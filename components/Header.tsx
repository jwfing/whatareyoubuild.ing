'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/insforge'
import { track } from '@/lib/posthog'
import AuthButtons from './AuthButtons'

export default function Header() {
  const [name, setName] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const insforge = getBrowserClient()
  useEffect(() => {
    insforge.auth.getCurrentUser()
      .then(({ data }) => {
        const user = data.user
        setName(user?.profile?.name ?? user?.email ?? null)
        // Fire signup_completed once for brand-new users (the client OAuth
        // callback page that used to do this is gone in the SSR flow).
        if (user && typeof window !== 'undefined') {
          const isNewSignup = Date.now() - new Date(user.createdAt).getTime() < 120_000
          const alreadyTracked = sessionStorage.getItem('signup_tracked')
          if (isNewSignup && !alreadyTracked) {
            track.signupCompleted(user.providers?.[0] ?? 'oauth')
            sessionStorage.setItem('signup_tracked', '1')
          }
        }
      })
      .catch(() => setName(null))
      .finally(() => setReady(true))
  }, [])
  return (
    <header className="rule border-x-0 border-t-0 flex items-baseline justify-between px-5 py-3">
      <Link href="/" className="masthead text-lg">WHAT ARE YOU BUILDING</Link>
      <div className="flex items-center gap-3">
        <Link href="/submit" className="rule mono text-xs px-2 py-1">+ SUBMIT</Link>
        {ready && (name
          ? <span className="mono text-xs">{name}</span>
          : <AuthButtons />)}
      </div>
    </header>
  )
}
