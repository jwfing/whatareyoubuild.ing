'use client'
import { useState } from 'react'
import { getBrowserClient, type Screenshot } from '@/lib/insforge'
import { notify } from '@/lib/notify'
import ScreenshotManager from './ScreenshotManager'

export default function FeedbackForm() {
  const insforge = getBrowserClient()
  const [body, setBody] = useState('')
  const [images, setImages] = useState<Screenshot[]>([])
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const text = body.trim()
    if (!text) { setErr('Please write something first.'); return }
    setBusy(true); setErr(null)
    const { data, error } = await insforge.database.from('feedback').insert({ body: text, images }).select().single()
    setBusy(false)
    if (error || !data) { setErr('Could not send — please try again.'); return }
    notify({ type: 'feedback', feedbackId: (data as { id: string }).id }) // email the owner (best-effort)
    setDone(true)
  }

  if (done) {
    return (
      <div className="mx-auto mt-6 max-w-xl border border-[var(--line)] px-6 py-10 text-center">
        <p className="masthead text-xl">Thanks — got it. 🙌</p>
        <p className="mt-2 text-[var(--muted)]">I read every note, and I&apos;ll reply to the email on your account if it needs a response.</p>
        <button
          onClick={() => { setBody(''); setImages([]); setDone(false) }}
          className="rule mono mt-5 px-4 py-2 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-3 p-6">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        maxLength={4000}
        aria-label="Your feedback"
        placeholder="What's on your mind? Ideas, requests, bugs — about the product or your GEO report…"
        className="w-full border border-[var(--line)] px-3 py-2 focus:border-[var(--ink)] focus:outline-none"
      />
      <div className="flex justify-end">
        <span className="mono text-xs text-[var(--muted)]">{body.length}/4000</span>
      </div>
      <ScreenshotManager value={images} onChange={setImages} label="ATTACHMENTS" hint="Add a screenshot if it helps explain." />
      {err && <p className="mono text-sm text-red-700">{err}</p>}
      <button
        disabled={busy}
        className="rule mono px-4 py-2 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-60"
      >
        {busy ? 'Sending…' : 'Send feedback'}
      </button>
      <p className="mono text-xs text-[var(--muted)]">Goes privately to the maker — who can reply to the email on your account.</p>
    </form>
  )
}
