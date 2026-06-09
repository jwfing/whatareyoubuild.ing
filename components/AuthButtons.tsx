'use client'
import { getBrowserClient } from '@/lib/insforge'

export default function AuthButtons() {
  const insforge = getBrowserClient()
  const signIn = (provider: 'google' | 'github') =>
    insforge.auth.signInWithOAuth(provider, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    }).catch((e) => console.error('OAuth start failed', e))
  return (
    <div className="flex gap-2">
      <button className="rule mono px-3 py-1 text-sm" onClick={() => signIn('google')}>Google</button>
      <button className="rule mono px-3 py-1 text-sm" onClick={() => signIn('github')}>GitHub</button>
    </div>
  )
}
