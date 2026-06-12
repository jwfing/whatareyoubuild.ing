'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/insforge'
import { timeAgo } from '@/lib/format'

export type CommentItem = {
  id: string
  userId: string
  name: string
  body: string
  createdAt: string
}

export default function CommentsSection({
  productId,
  productAuthorId,
  userId,
  currentUserName,
  initial,
}: {
  productId: string
  productAuthorId: string
  userId: string | null
  currentUserName: string | null
  initial: CommentItem[]
}) {
  const router = useRouter()
  const insforge = getBrowserClient()
  const [comments, setComments] = useState<CommentItem[]>(initial)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onPost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setBusy(true); setErr(null)
    const { data, error } = await insforge.database
      .from('comments').insert({ product_id: productId, body: text }).select().single()
    setBusy(false)
    if (error || !data) { setErr('Could not post your comment. Please try again.'); return }
    const row = data as { id: string; created_at: string }
    setComments((cs) => [
      { id: row.id, userId: userId as string, name: currentUserName ?? 'you', body: text, createdAt: row.created_at },
      ...cs,
    ])
    setBody('')
  }

  async function onDelete(id: string) {
    const prev = comments
    setComments((cs) => cs.filter((c) => c.id !== id)) // optimistic
    const { error } = await insforge.database.from('comments').delete().eq('id', id)
    if (error) setComments(prev) // rollback; RLS is the real gate
  }

  return (
    <section className="mt-8">
      <h2 className="mono mb-3 text-xs tracking-[0.15em] text-[var(--muted)]">
        {comments.length > 0 ? `${comments.length} COMMENT${comments.length === 1 ? '' : 'S'}` : 'COMMENTS'}
      </h2>

      {userId ? (
        <form onSubmit={onPost} className="mb-6">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Leave the builder some feedback…"
            aria-label="Write a comment"
            className="w-full border border-[var(--line)] px-3 py-2 focus:border-[var(--ink)] focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="mono text-xs text-[var(--muted)]">{body.length}/500</span>
            <button
              disabled={busy || !body.trim()}
              className="rule mono px-4 py-1.5 text-sm transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-50"
            >
              {busy ? 'Posting…' : 'Post'}
            </button>
          </div>
          {err && <p className="mono mt-2 text-sm text-red-700">{err}</p>}
        </form>
      ) : (
        <button
          onClick={() => router.push('/signin')}
          className="mono mb-6 w-full border border-[var(--line)] px-3 py-3 text-left text-sm text-[var(--muted)] transition-colors hover:bg-[var(--paper-2)]"
        >
          Sign in to leave feedback →
        </button>
      )}

      {comments.length === 0 ? (
        <p className="text-[var(--muted)]">Be the first to cheer this on.</p>
      ) : (
        <ol className="space-y-4">
          {comments.map((c) => {
            const isMaker = c.userId === productAuthorId
            const canDelete = !!userId && (userId === c.userId || userId === productAuthorId)
            return (
              <li key={c.id} className="hairline pb-4">
                <div className="mb-1 flex items-center gap-2">
                  <b className="text-sm">{c.name}</b>
                  {isMaker && (
                    <span className="mono bg-[var(--ink)] px-1.5 py-0.5 text-[10px] tracking-wider text-[var(--paper)]">MAKER</span>
                  )}
                  <span className="mono text-xs text-[var(--muted)]">{timeAgo(c.createdAt)}</span>
                  {canDelete && (
                    <button
                      onClick={() => onDelete(c.id)}
                      className="mono ml-auto text-xs text-[var(--muted)] underline transition-colors hover:text-[var(--ink)]"
                    >
                      delete
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm">{c.body}</p>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
