'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@insforge/sdk/ssr'

export async function initiateOAuth(provider: 'google' | 'github') {
  const client = createServerClient()
  const { data, error } = await client.auth.signInWithOAuth(provider, {
    redirectTo: new URL('/api/auth/callback', process.env.NEXT_PUBLIC_SITE_URL).toString(),
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
