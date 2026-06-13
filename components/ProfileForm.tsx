'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/insforge'

export default function ProfileForm({ initialProfile }: { initialProfile: Record<string, unknown> }) {
  const router = useRouter()
  const insforge = getBrowserClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(String(initialProfile.name ?? ''))
  const [avatarUrl, setAvatarUrl] = useState<string | null>((initialProfile.avatar_url as string) || null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  // Always send the whole profile (merged with whatever OAuth populated) so a
  // partial update never drops the other field.
  async function persist(nextName: string, nextAvatar: string | null) {
    const profile: Record<string, unknown> = { ...initialProfile, name: nextName.trim() }
    if (nextAvatar) profile.avatar_url = nextAvatar
    return insforge.auth.setProfile(profile)
  }

  async function onAvatarFile(file: File | null | undefined) {
    if (!file || file.size === 0) return
    if (!file.type.startsWith('image/')) { setMsg({ kind: 'err', text: 'Please choose an image file.' }); return }
    if (file.size > 5 * 1024 * 1024) { setMsg({ kind: 'err', text: 'Image must be under 5 MB.' }); return }
    setUploading(true); setMsg(null)
    const up = await insforge.storage.from('product-images').uploadAuto(file)
    if (fileRef.current) fileRef.current.value = ''
    if (up.error || !up.data) { setUploading(false); setMsg({ kind: 'err', text: 'Upload failed. Try again.' }); return }
    const newUrl = up.data.url
    const { error } = await persist(name, newUrl)
    setUploading(false)
    if (error) { setMsg({ kind: 'err', text: 'Could not save your photo.' }); return }
    setAvatarUrl(newUrl)
    setMsg({ kind: 'ok', text: 'Photo updated.' })
    router.refresh()
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setMsg({ kind: 'err', text: 'Name can’t be empty.' }); return }
    setBusy(true); setMsg(null)
    const { error } = await persist(trimmed, avatarUrl)
    setBusy(false)
    if (error) { setMsg({ kind: 'err', text: 'Could not save. Please try again.' }); return }
    setMsg({ kind: 'ok', text: 'Saved.' })
    router.refresh()
  }

  const initial = (name.trim().charAt(0) || '?').toUpperCase()

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 px-5 pb-10">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" width={72} height={72} className="rule h-[72px] w-[72px] shrink-0 rounded-full object-cover" />
        ) : (
          <div className="rule masthead flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[var(--paper-2)] text-3xl">
            {initial}
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rule mono px-3 py-1.5 text-sm transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
          </button>
          <p className="mono mt-1 text-xs text-[var(--muted)]">A square image works best.</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onAvatarFile(e.target.files?.[0])} />
      </div>

      <div>
        <label htmlFor="display-name" className="mono block text-xs text-[var(--muted)]">
          DISPLAY NAME
        </label>
        <input
          id="display-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className="rule mt-1 w-full px-3 py-2"
        />
      </div>

      {msg && <p className={`mono text-sm ${msg.kind === 'err' ? 'text-red-700' : 'text-[var(--muted)]'}`}>{msg.text}</p>}
      <button
        disabled={busy}
        className="rule mono px-4 py-2 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-60"
      >
        {busy ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
