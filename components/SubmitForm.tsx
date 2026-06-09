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

    const name = String(form.get('name') || '').trim()
    const tagline = String(form.get('tagline') || '').trim()
    if (!name || !tagline) { setErr('Name and tagline are required.'); setBusy(false); return }

    const file = form.get('image') as File
    if (!file || file.size === 0) { setErr('An image is required.'); setBusy(false); return }
    if (!file.type.startsWith('image/')) { setErr('Please choose an image file.'); setBusy(false); return }
    if (file.size > 5 * 1024 * 1024) { setErr('Image must be under 5 MB.'); setBusy(false); return }

    const up = await insforge.storage.from('product-images').uploadAuto(file)
    if (up.error || !up.data) { setErr('Image upload failed.'); setBusy(false); return }

    const { data, error } = await insforge.database.from('products').insert({
      name,
      tagline,
      link: String(form.get('link') || '').trim() || null,
      description: String(form.get('description') || '').trim() || null,
      image_url: up.data.url,
      image_key: up.data.key,
    }).select().single()

    if (error || !data) {
      const e = (error || {}) as { message?: string; status?: number; statusCode?: number }
      const code = e.statusCode ?? e.status
      const isAuth = code === 401 || code === 403 || (!!e.message && /unauthor|forbidden|jwt|session/i.test(e.message))
      if (isAuth) {
        setErr('Your session has expired. Please sign in again.')
      } else {
        const msg = e.message
        setErr(`Could not save your product${msg ? `: ${msg}` : ''}. Please try again.`)
      }
      setBusy(false); return
    }
    track.productSubmitted((data as { id: string }).id)
    router.push(`/p/${(data as { id: string }).id}`)
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-3 p-6">
      <input name="name" aria-label="Product name" required maxLength={80} placeholder="Product name" className="rule w-full px-3 py-2" />
      <input name="tagline" aria-label="One-line tagline" required maxLength={60} placeholder="One line (≤60 chars)" className="rule w-full px-3 py-2" />
      <input name="link" aria-label="Product link" type="url" placeholder="Link (optional)" className="rule w-full px-3 py-2" />
      <textarea name="description" aria-label="Details" placeholder="Details (optional, markdown)" className="rule w-full px-3 py-2" rows={4} />
      <input name="image" aria-label="Product image" type="file" accept="image/*" required className="mono block text-sm" />
      {err && <p className="mono text-sm text-red-700">{err}</p>}
      <button disabled={busy} className="rule mono px-4 py-2">{busy ? 'Posting…' : 'Post it'}</button>
    </form>
  )
}
