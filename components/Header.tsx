'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { track } from '@/lib/posthog'
import AuthButtons from './AuthButtons'
import UserMenu from './UserMenu'
import LogoMark from './LogoMark'
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
    <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
      <Link href="/" aria-label="What Are You Building — home" className="flex items-center gap-2">
        <LogoMark className="h-9 w-9 shrink-0" />
        <span className="masthead hidden text-lg leading-none sm:inline">WHAT ARE YOU BUILDING</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/submit" className="rule mono text-xs px-2 py-1">+ SUBMIT</Link>
        {user
          ? <UserMenu label={user.name ?? user.email ?? 'Account'} />
          : <AuthButtons />}
      </div>
    </header>
  )
}
