'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/insforge'
import { toggleVote } from '@/lib/vote'
import { track } from '@/lib/posthog'
import { notify } from '@/lib/notify'

type Size = 'sm' | 'lg'

const SIZING: Record<Size, { box: string; tri: number; count: string }> = {
  sm: { box: 'min-w-[2.75rem] px-2 py-1.5', tri: 6, count: 'text-sm' },
  lg: { box: 'px-4 py-3', tri: 9, count: 'text-base' },
}

export default function VoteButton({
  productId,
  initialCount,
  userId,
  size = 'lg',
}: {
  productId: string
  initialCount: number
  userId: string | null
  size?: Size
}) {
  const router = useRouter()
  const insforge = getBrowserClient()
  const [state, setState] = useState({ voted: false, count: initialCount })
  const [pending, setPending] = useState(false)
  const s = SIZING[size]

  // "Did I already vote?" — public read (votes_select_all), keyed on the
  // server-provided userId. No getCurrentUser (cross-domain backend refresh).
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      try {
        const { data: rows } = await insforge.database
          .from('votes').select('id').eq('product_id', productId).eq('user_id', userId)
        if (!cancelled) setState((v) => ({ ...v, voted: !!(rows && rows.length) }))
      } catch {
        /* leave as unvoted */
      }
    })()
    return () => { cancelled = true }
  }, [productId, userId])

  async function onClick(e: React.MouseEvent) {
    // The row navigates via a stretched-link overlay; the vote must not.
    e.preventDefault()
    e.stopPropagation()
    if (pending) return
    if (!userId) { router.push('/signin'); return }
    setPending(true)
    const prev = state
    const next = toggleVote(state)
    setState(next) // optimistic
    try {
      if (next.voted) {
        const { error } = await insforge.database.from('votes').insert({ product_id: productId })
        if (error) {
          setState(prev)
        } else {
          track.voteCast(productId)
          notify({ type: 'vote', productId }) // email the owner on milestones (best-effort)
        }
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
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={state.voted ? 'Remove your vote' : 'Upvote'}
      aria-pressed={state.voted}
      className={`relative z-10 rule mono ${s.box} inline-flex flex-col items-center justify-center gap-1 leading-none transition-colors duration-150 disabled:opacity-60 ${
        state.voted ? 'bg-[var(--ink)] text-[var(--paper)]' : 'hover:bg-[var(--paper-2)]'
      }`}
    >
      <span
        aria-hidden
        style={{
          width: 0,
          height: 0,
          borderLeft: `${s.tri}px solid transparent`,
          borderRight: `${s.tri}px solid transparent`,
          borderBottom: `${Math.round(s.tri * 1.5)}px solid currentColor`,
        }}
      />
      <b className={s.count}>{state.count}</b>
    </button>
  )
}
