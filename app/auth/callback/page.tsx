'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/insforge'
import { track } from '@/lib/posthog'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    const run = async () => {
      try {
        const insforge = getBrowserClient()
        const { data } = await insforge.auth.getCurrentUser()
        const user = data.user
        if (user) {
          const ageMs = Date.now() - new Date(user.createdAt).getTime()
          const isNewSignup = ageMs >= 0 && ageMs < 120_000
          if (isNewSignup) track.signupCompleted(user.providers?.[0] ?? 'oauth')
        }
      } finally {
        router.replace('/')
      }
    }
    run()
  }, [router])
  return <p className="mono p-8">Signing you in…</p>
}
