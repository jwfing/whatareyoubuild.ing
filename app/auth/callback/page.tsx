'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/insforge'
import { track } from '@/lib/posthog'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    const run = async () => {
      const insforge = getBrowserClient()
      const { data } = await insforge.auth.getCurrentUser()
      if (data.user) track.signupCompleted(data.user.providers?.[0] ?? 'oauth')
      router.replace('/')
    }
    run()
  }, [router])
  return <p className="mono p-8">Signing you in…</p>
}
