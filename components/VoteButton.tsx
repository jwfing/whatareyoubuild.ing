'use client'
import { useEffect, useState } from 'react'
import { getBrowserClient } from '@/lib/insforge'
import { toggleVote } from '@/lib/vote'
import { track } from '@/lib/posthog'
import AuthButtons from './AuthButtons'

export default function VoteButton({ productId, initialCount }: { productId: string; initialCount: number }) {
  const insforge = getBrowserClient()
  const [state, setState] = useState({ voted: false, count: initialCount })
  const [userId, setUserId] = useState<string | null>(null)
  const [needAuth, setNeedAuth] = useState(false)

  useEffect(() => {
    insforge.auth.getCurrentUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      const { data: rows } = await insforge.database
        .from('votes').select('id').eq('product_id', productId).eq('user_id', data.user.id)
      setState(s => ({ ...s, voted: !!(rows && rows.length) }))
    }).catch(() => {})
  }, [productId])

  async function onClick() {
    if (!userId) { setNeedAuth(true); return }
    const prev = state
    const next = toggleVote(state)
    setState(next) // optimistic
    if (next.voted) {
      const { error } = await insforge.database.from('votes').insert({ product_id: productId })
      if (error) setState(prev); else track.voteCast(productId)
    } else {
      const { error } = await insforge.database.from('votes').delete()
        .eq('product_id', productId).eq('user_id', userId)
      if (error) setState(prev)
    }
  }

  return (
    <div>
      <button onClick={onClick} className={`rule mono px-4 py-3 text-center ${state.voted ? 'bg-[var(--ink)] text-[var(--paper)]' : ''}`}>
        ▲<br /><b>{state.count}</b>
      </button>
      {needAuth && <div className="mt-2"><p className="mono mb-1 text-xs">Sign in to vote:</p><AuthButtons /></div>}
    </div>
  )
}
