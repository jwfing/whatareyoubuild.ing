'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { track } from '@/lib/posthog'
import AuthButtons from './AuthButtons'
import type { SessionUser } from '@/lib/auth-server'

export default function Header({ user }: { user: SessionUser | null }) {
  // Fire signup_completed once for brand-new users (the client OAuth callback
  // page that used to do this is gone in the SSR flow).
  useEffect(() => {
    if (!user || typeof window === 'undefined' || !user.createdAt) return
    const isNewSignup = Date.now() - new Date(user.createdAt).getTime() < 120_000
    if (isNewSignup && !sessionStorage.getItem('signup_tracked')) {
      track.signupCompleted(user.providers[0] ?? 'oauth')
      sessionStorage.setItem('signup_tracked', '1')
    }
  }, [user])

  return (
    <header className="rule border-x-0 border-t-0 flex items-baseline justify-between px-5 py-3">
      <Link href="/" className="masthead text-lg">WHAT ARE YOU BUILDING</Link>
      <div className="flex items-center gap-3">
        <Link href="/submit" className="rule mono text-xs px-2 py-1">+ SUBMIT</Link>
        {user
          ? <span className="mono text-xs">{user.name ?? user.email}</span>
          : <AuthButtons />}
      </div>
    </header>
  )
}
