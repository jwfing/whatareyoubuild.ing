'use client'
import { useEffect, useState } from 'react'
import { getBrowserClient } from '@/lib/insforge'
import { toggleVote } from '@/lib/vote'
import { track } from '@/lib/posthog'
import AuthButtons from './AuthButtons'

export default function VoteButton({ productId, initialCount, userId }: { productId: string; initialCount: number; userId: string | null }) {
  const insforge = getBrowserClient()
  const [state, setState] = useState({ voted: false, count: initialCount })
  const [needAuth, setNeedAuth] = useState(false)
  const [pending, setPending] = useState(false)

  // "Did I already vote?" — public read (votes_select_all), keyed on the
  // server-provided userId. No getCurrentUser (that triggers a cross-domain
  // backend refresh in this SSR setup).
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      try {
        const { data: rows } = await insforge.database
          .from('votes').select('id').eq('product_id', productId).eq('user_id', userId)
        if (!cancelled) setState(s => ({ ...s, voted: !!(rows && rows.length) }))
      } catch {
        /* ignore — vote state stays unvoted */
      }
    })()
    return () => { cancelled = true }
  }, [productId, userId])

  async function onClick() {
    if (pending) return
    if (!userId) { setNeedAuth(true); return }
    setPending(true)
    const prev = state
    const next = toggleVote(state)
    setState(next) // optimistic
    try {
      if (next.voted) {
        const { error } = await insforge.database.from('votes').insert({ product_id: productId })
        if (error) setState(prev); else track.voteCast(productId)
      } else {
        const { error } = await insforge.database.from('votes').delete()
          .eq('product_id', productId).eq('user_id', userId)
        if (error) setState(prev)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <button onClick={onClick} disabled={pending} aria-label={state.voted ? 'Remove your vote' : 'Upvote'} aria-pressed={state.voted} className={`rule mono px-4 py-3 text-center ${state.voted ? 'bg-[var(--ink)] text-[var(--paper)]' : ''}`}>
        ▲<br /><b>{state.count}</b>
      </button>
      {needAuth && <div className="mt-2"><p className="mono mb-1 text-xs">Sign in to vote:</p><AuthButtons /></div>}
    </div>
  )
}
