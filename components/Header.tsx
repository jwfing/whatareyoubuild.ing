'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/insforge'
import AuthButtons from './AuthButtons'

export default function Header() {
  const [name, setName] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const insforge = getBrowserClient()
  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      setName(data.user?.profile?.name ?? data.user?.email ?? null)
      setReady(true)
    })
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
