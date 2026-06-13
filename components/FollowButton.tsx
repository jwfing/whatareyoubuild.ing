'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/insforge'
import { notify } from '@/lib/notify'

export default function FollowButton({ profileId, initialFollowing }: { profileId: string; initialFollowing: boolean }) {
  const router = useRouter()
  const insforge = getBrowserClient()
  const [following, setFollowing] = useState(initialFollowing)
  const [busy, setBusy] = useState(false)
  const [hover, setHover] = useState(false)

  async function toggle() {
    if (busy) return
    setBusy(true)
    const prev = following
    setFollowing(!prev) // optimistic
    // RLS scopes both ops to the signed-in user, so following_id is enough.
    if (prev) {
      const { error } = await insforge.database.from('follows').delete().eq('following_id', profileId)
      if (error) setFollowing(true)
    } else {
      const { error } = await insforge.database.from('follows').insert({ following_id: profileId })
      if (error) setFollowing(false)
      else notify({ type: 'follow', followingId: profileId })
    }
    setBusy(false)
    router.refresh() // refresh the follower count
  }

  const label = !following ? 'Follow' : hover ? 'Unfollow' : 'Following'
  return (
    <button
      onClick={toggle}
      disabled={busy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-pressed={following}
      className={`rule mono shrink-0 px-4 py-1.5 text-xs transition-colors disabled:opacity-60 ${
        following ? 'hover:border-red-700 hover:text-red-700' : 'hover:bg-[var(--ink)] hover:text-[var(--paper)]'
      }`}
    >
      {label}
    </button>
  )
}
