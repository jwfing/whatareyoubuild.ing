// SSRF-guarded fetch. We follow user-controlled product links from the server,
// so we resolve the host first and refuse private / loopback / link-local /
// cloud-metadata addresses, cap size, time out, and re-validate every redirect
// hop. Best-effort (DNS can rebind between check and connect) but it blocks the
// obvious abuse of using us as a proxy into internal networks.
import 'server-only'
import { lookup } from 'node:dns/promises'
import net from 'node:net'

export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const p = ip.split('.').map(Number)
    if (p[0] === 0 || p[0] === 10 || p[0] === 127) return true
    if (p[0] === 169 && p[1] === 254) return true // link-local + 169.254.169.254 metadata
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true
    if (p[0] === 192 && p[1] === 168) return true
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return true // CGNAT
    return false
  }
  const v = ip.toLowerCase()
  if (v === '::1' || v === '::') return true
  if (v.startsWith('fc') || v.startsWith('fd')) return true // ULA fc00::/7
  if (v.startsWith('fe80')) return true // link-local
  if (v.startsWith('::ffff:')) {
    const mapped = v.slice(7)
    if (net.isIPv4(mapped)) return isPrivateIp(mapped)
  }
  return false
}

export type FetchResult = {
  ok: boolean
  status: number | null
  finalUrl: string
  html: string
  error: string | null
}

async function assertPublicHost(hostname: string): Promise<void> {
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('Refusing to fetch a private address')
    return
  }
  const records = await lookup(hostname, { all: true })
  if (!records.length) throw new Error('DNS resolution failed')
  for (const r of records) {
    if (isPrivateIp(r.address)) throw new Error('Refusing to fetch a private/internal address')
  }
}

export function emptyFetch(): FetchResult {
  return { ok: false, status: null, finalUrl: '', html: '', error: 'No URL' }
}

export async function safeFetch(
  rawUrl: string,
  opts?: { timeoutMs?: number; maxBytes?: number; maxRedirects?: number },
): Promise<FetchResult> {
  const timeoutMs = opts?.timeoutMs ?? 12000
  const maxBytes = opts?.maxBytes ?? 2_000_000
  let redirectsLeft = opts?.maxRedirects ?? 4
  let url = rawUrl

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let u: URL
      try {
        u = new URL(url)
      } catch {
        return { ok: false, status: null, finalUrl: url, html: '', error: 'Invalid URL' }
      }
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return { ok: false, status: null, finalUrl: url, html: '', error: 'Only http(s) URLs are supported' }
      }
      await assertPublicHost(u.hostname)

      const res = await fetch(u.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: ctrl.signal,
        headers: {
          'User-Agent': 'WhatAreYouBuilding-GEO-Checker/1.0 (+https://www.whatareyoubuild.ing)',
          Accept: 'text/html,application/xhtml+xml,*/*',
        },
      })

      const loc = res.headers.get('location')
      if (res.status >= 300 && res.status < 400 && loc) {
        if (redirectsLeft-- <= 0) {
          return { ok: false, status: res.status, finalUrl: u.toString(), html: '', error: 'Too many redirects' }
        }
        url = new URL(loc, u).toString()
        continue
      }

      // Read the body with a hard size cap.
      const reader = res.body?.getReader()
      const chunks: Uint8Array[] = []
      let received = 0
      if (reader) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) {
            received += value.length
            if (received > maxBytes) {
              try {
                await reader.cancel()
              } catch {
                /* ignore */
              }
              break
            }
            chunks.push(value)
          }
        }
      }
      const html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8')
      return { ok: res.ok, status: res.status, finalUrl: u.toString(), html, error: res.ok ? null : `HTTP ${res.status}` }
    }
  } catch (e) {
    const err = e as { name?: string; message?: string }
    const msg = err?.name === 'AbortError' ? 'Request timed out' : err?.message || 'Fetch failed'
    return { ok: false, status: null, finalUrl: url, html: '', error: msg }
  } finally {
    clearTimeout(timer)
  }
}
