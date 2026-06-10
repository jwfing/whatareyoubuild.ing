'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/insforge'

export default function ProfileForm({ initialName }: { initialName: string }) {
  const router = useRouter()
  const insforge = getBrowserClient()
  const [name, setName] = useState(initialName)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setMsg({ kind: 'err', text: 'Name can’t be empty.' }); return }
    setBusy(true); setMsg(null)
    const { error } = await insforge.auth.setProfile({ name: trimmed })
    setBusy(false)
    if (error) { setMsg({ kind: 'err', text: 'Could not save. Please try again.' }); return }
    setMsg({ kind: 'ok', text: 'Saved.' })
    router.refresh() // re-render the server header with the new name
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-3 px-5 pb-10">
      <label htmlFor="display-name" className="mono block text-xs text-[var(--muted)]">
        DISPLAY NAME
      </label>
      <input
        id="display-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        className="rule w-full px-3 py-2"
      />
      {msg && (
        <p className={`mono text-sm ${msg.kind === 'err' ? 'text-red-700' : 'text-[var(--muted)]'}`}>{msg.text}</p>
      )}
      <button disabled={busy} className="rule mono px-4 py-2 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-60">
        {busy ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
