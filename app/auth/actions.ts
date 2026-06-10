'use server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@insforge/sdk/ssr'

// The app is reachable on multiple hosts (the deploy URL + custom domains).
// OAuth must return to the SAME host the user started on — otherwise the
// httpOnly code-verifier cookie (host-only) isn't present at the callback and
// the exchange fails with "missing_verifier". So derive the origin from the
// incoming request, not a build-time env var. The InsForge allow-list is the
// security gate against a spoofed Host.
async function appOrigin() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export async function initiateOAuth(provider: 'google' | 'github') {
  const client = createServerClient()
  const { data, error } = await client.auth.signInWithOAuth(provider, {
    redirectTo: `${await appOrigin()}/api/auth/callback`,
    skipBrowserRedirect: true,
  })
  if (error || !data.url || !data.codeVerifier) {
    throw new Error(error?.message ?? 'OAuth init failed')
  }
  const cookieStore = await cookies()
  cookieStore.set('insforge_code_verifier', data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  redirect(data.url)
}

export async function signInGoogle() {
  await initiateOAuth('google')
}

export async function signInGitHub() {
  await initiateOAuth('github')
}

export async function signOutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('insforge_access_token')
  cookieStore.delete('insforge_refresh_token')
  redirect('/')
}
