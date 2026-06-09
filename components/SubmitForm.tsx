'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/insforge'
import { track } from '@/lib/posthog'
import AuthButtons from './AuthButtons'

export default function SubmitForm() {
  const router = useRouter()
  const insforge = getBrowserClient()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    insforge.auth.getCurrentUser()
      .then(({ data }) => setAuthed(!!data.user))
      .catch(() => setAuthed(false))
  }, [])

  if (authed === null) return <p className="mono p-8">…</p>
  if (!authed) return (
    <div className="p-8">
      <p className="mb-3">Sign in to post your product.</p>
      <AuthButtons />
    </div>
  )

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setErr(null)
    const form = new FormData(e.currentTarget)
    const file = form.get('image') as File
    if (!file || file.size === 0) { setErr('An image is required.'); setBusy(false); return }

    const up = await insforge.storage.from('product-images').uploadAuto(file)
    if (up.error || !up.data) { setErr('Image upload failed.'); setBusy(false); return }

    const { data, error } = await insforge.database.from('products').insert({
      name: String(form.get('name') || '').trim(),
      tagline: String(form.get('tagline') || '').trim(),
      link: String(form.get('link') || '').trim() || null,
      description: String(form.get('description') || '').trim() || null,
      image_url: up.data.url,
      image_key: up.data.key,
    }).select().single()

    if (error || !data) { setErr('Could not save. Check name (≤80) and tagline (≤60).'); setBusy(false); return }
    track.productSubmitted((data as { id: string }).id)
    router.push(`/p/${(data as { id: string }).id}`)
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-3 p-6">
      <input name="name" required maxLength={80} placeholder="Product name" className="rule w-full px-3 py-2" />
      <input name="tagline" required maxLength={60} placeholder="One line (≤60 chars)" className="rule w-full px-3 py-2" />
      <input name="link" type="url" placeholder="Link (optional)" className="rule w-full px-3 py-2" />
      <textarea name="description" placeholder="Details (optional, markdown)" className="rule w-full px-3 py-2" rows={4} />
      <input name="image" type="file" accept="image/*" required className="mono block text-sm" />
      {err && <p className="mono text-sm text-red-700">{err}</p>}
      <button disabled={busy} className="rule mono px-4 py-2">{busy ? 'Posting…' : 'Post it'}</button>
    </form>
  )
}
