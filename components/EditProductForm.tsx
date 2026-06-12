'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient, type Product, type Screenshot } from '@/lib/insforge'
import ScreenshotManager from './ScreenshotManager'
import CoverImageInput from './CoverImageInput'

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter()
  const insforge = getBrowserClient()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [cover, setCover] = useState<Screenshot | null>(
    product.image_url ? { url: product.image_url, key: product.image_key } : null,
  )
  const [shots, setShots] = useState<Screenshot[]>(product.screenshots ?? [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setErr(null)
    const form = new FormData(e.currentTarget)

    const name = String(form.get('name') || '').trim()
    const tagline = String(form.get('tagline') || '').trim()
    if (!name || !tagline) { setErr('Name and tagline are required.'); setBusy(false); return }

    const rawLink = String(form.get('link') || '').trim()
    let link: string | null = null
    if (rawLink) {
      try {
        const u = new URL(rawLink)
        if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('bad scheme')
        link = u.toString()
      } catch {
        setErr('Link must be a valid http(s) URL.'); setBusy(false); return
      }
    }

    if (!cover) { setErr('A logo / icon image is required.'); setBusy(false); return }

    // The logo and screenshots were uploaded as they were added/replaced.
    const { error } = await insforge.database.from('products').update({
      name,
      tagline,
      link,
      description: String(form.get('description') || '').trim() || null,
      image_url: cover.url,
      image_key: cover.key,
      screenshots: shots,
    }).eq('id', product.id)

    if (error) {
      const e = (error || {}) as { message?: string; status?: number; statusCode?: number }
      const code = e.statusCode ?? e.status
      const isAuth = code === 401 || code === 403 || (!!e.message && /unauthor|forbidden|jwt|session/i.test(e.message))
      setErr(isAuth
        ? 'Your session has expired. Please sign in again.'
        : `Could not save your changes${e.message ? `: ${e.message}` : ''}. Please try again.`)
      setBusy(false); return
    }
    router.push(`/p/${product.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-3 p-6">
      <input name="name" aria-label="Product name" defaultValue={product.name} required maxLength={80} placeholder="Product name" className="rule w-full px-3 py-2" />
      <input name="tagline" aria-label="One-line tagline" defaultValue={product.tagline} required maxLength={60} placeholder="One line (≤60 chars)" className="rule w-full px-3 py-2" />
      <input name="link" aria-label="Product link" type="url" defaultValue={product.link ?? ''} placeholder="Link (optional)" className="rule w-full px-3 py-2" />
      <textarea name="description" aria-label="Details" defaultValue={product.description ?? ''} placeholder="Details (optional, markdown)" className="rule w-full px-3 py-2" rows={4} />
      <CoverImageInput value={cover} onChange={setCover} />

      <ScreenshotManager value={shots} onChange={setShots} />

      {err && <p className="mono text-sm text-red-700">{err}</p>}
      <div className="flex items-center gap-3">
        <button disabled={busy} className="rule mono px-4 py-2 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-60">
          {busy ? 'Saving…' : 'Save changes'}
        </button>
        <a href={`/p/${product.id}`} className="mono text-sm text-[var(--muted)] underline">Cancel</a>
      </div>
    </form>
  )
}
