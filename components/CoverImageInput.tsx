'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { getBrowserClient, type Screenshot } from '@/lib/insforge'

// Single-image picker for the product logo/icon. Mirrors ScreenshotManager's
// framed tile + × delete + upload-on-add, so the cover can be previewed and
// swapped out the same way screenshots are. Uploads immediately; `value` holds
// the already-stored { url, key }.
export default function CoverImageInput({
  value,
  onChange,
  label = 'LOGO / ICON',
}: {
  value: Screenshot | null
  onChange: (v: Screenshot | null) => void
  label?: string
}) {
  const insforge = getBrowserClient()
  const inputRef = useRef<HTMLInputElement>(null)
  // Keys uploaded in THIS session — safe to delete from storage when removed,
  // since they aren't referenced by any saved product yet. The initial value's
  // key (an already-saved image) is intentionally NOT tracked here; the form
  // owns that deletion, and only after a successful save.
  const sessionKeys = useRef<Set<string>>(new Set())
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function addFile(file: File | null | undefined) {
    setErr(null)
    if (!file || file.size === 0) return
    if (!file.type.startsWith('image/')) { setErr('Please choose an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setErr('Image must be under 5 MB.'); return }
    setUploading(true)
    insforge.storage
      .from('product-images')
      .uploadAuto(file)
      .then((up) => {
        const d = up.data
        if (up.error || !d) { setErr('Upload failed. Please try again.'); return }
        sessionKeys.current.add(d.key)
        onChange({ url: d.url, key: d.key })
      })
      .catch(() => setErr('Upload failed. Please try again.'))
      .finally(() => {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      })
  }

  function remove() {
    const key = value?.key
    if (key && sessionKeys.current.has(key)) {
      sessionKeys.current.delete(key)
      insforge.storage.from('product-images').remove(key).catch(() => {})
    }
    onChange(null)
  }

  return (
    <div>
      <label className="mono block text-xs text-[var(--muted)]">{label}</label>
      <div className="mt-2">
        {value ? (
          <div className="rule relative h-20 w-20 overflow-hidden bg-[var(--paper-2)]">
            <Image src={value.url} alt="" fill sizes="80px" className="object-contain" />
            <button
              type="button"
              onClick={remove}
              aria-label="Remove image"
              className="rule absolute right-0 top-0 bg-[var(--paper)] px-1 text-xs leading-none"
            >
              ×
            </button>
          </div>
        ) : uploading ? (
          <div className="rule flex h-20 w-20 items-center justify-center">
            <span className="mono text-[10px] text-[var(--muted)]">uploading…</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rule flex h-20 w-20 flex-col items-center justify-center text-[var(--muted)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="mono mt-0.5 text-[10px]">add</span>
          </button>
        )}
      </div>
      <p className="mono mt-1.5 text-xs text-[var(--muted)]">A small square image — your logo or app icon.</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => addFile(e.target.files?.[0])}
      />
      {err && <p className="mono mt-1 text-sm text-red-700">{err}</p>}
    </div>
  )
}
