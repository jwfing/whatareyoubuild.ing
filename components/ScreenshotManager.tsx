'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { getBrowserClient, type Screenshot } from '@/lib/insforge'

const MAX = 6

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length || from === to) return arr
  const a = [...arr]
  const [x] = a.splice(from, 1)
  a.splice(to, 0, x)
  return a
}

// Unified screenshot manager: multi-add, per-item remove, drag/button reorder.
// Uploads on add (so thumbnails are immediate); `value` is the ordered, already
// stored list. `onChange` is the parent's setState so we can update functionally.
export default function ScreenshotManager({
  value,
  onChange,
}: {
  value: Screenshot[]
  onChange: React.Dispatch<React.SetStateAction<Screenshot[]>>
}) {
  const insforge = getBrowserClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const dragFrom = useRef<number | null>(null)
  const [uploading, setUploading] = useState(0)
  const [err, setErr] = useState<string | null>(null)

  function addFiles(files: FileList | File[]) {
    setErr(null)
    let room = MAX - value.length - uploading
    for (const f of Array.from(files)) {
      if (!f || f.size === 0) continue
      if (room <= 0) { setErr(`Up to ${MAX} screenshots.`); break }
      if (!f.type.startsWith('image/')) { setErr('Screenshots must be image files.'); continue }
      if (f.size > 5 * 1024 * 1024) { setErr('Each screenshot must be under 5 MB.'); continue }
      room--
      setUploading((u) => u + 1)
      insforge.storage.from('product-images').uploadAuto(f)
        .then((up) => {
          const d = up.data
          if (up.error || !d) { setErr('An upload failed. Please try again.'); return }
          onChange((prev) => (prev.length >= MAX ? prev : [...prev, { url: d.url, key: d.key }]))
        })
        .catch(() => setErr('An upload failed. Please try again.'))
        .finally(() => setUploading((u) => u - 1))
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="mono block text-xs text-[var(--muted)]">SCREENSHOTS ({value.length}/{MAX})</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {value.map((s, i) => (
          <div
            key={s.key}
            draggable
            onDragStart={() => { dragFrom.current = i }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              const from = dragFrom.current
              dragFrom.current = null
              if (from !== null) onChange((prev) => move(prev, from, i))
            }}
            className="rule relative h-20 w-20 cursor-grab overflow-hidden"
          >
            <Image src={s.url} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange((p) => p.filter((x) => x.key !== s.key))}
              aria-label={`Remove screenshot ${i + 1}`}
              className="rule absolute right-0 top-0 bg-[var(--paper)] px-1 text-xs leading-none"
            >
              ×
            </button>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[var(--paper)] px-0.5">
              <button type="button" disabled={i === 0} onClick={() => onChange((p) => move(p, i, i - 1))} aria-label="Move earlier" className="mono px-1 text-xs disabled:opacity-25">◀</button>
              <span className="mono text-[10px] text-[var(--muted)]">{i + 1}</span>
              <button type="button" disabled={i === value.length - 1} onClick={() => onChange((p) => move(p, i, i + 1))} aria-label="Move later" className="mono px-1 text-xs disabled:opacity-25">▶</button>
            </div>
          </div>
        ))}
        {uploading > 0 && (
          <div className="rule flex h-20 w-20 items-center justify-center">
            <span className="mono text-[10px] text-[var(--muted)]">uploading…</span>
          </div>
        )}
        {value.length + uploading < MAX && (
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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) addFiles(e.target.files) }}
      />
      <p className="mono mt-1.5 text-xs text-[var(--muted)]">Drag tiles (or use ◀ ▶) to reorder — the first is shown first.</p>
      {err && <p className="mono mt-1 text-sm text-red-700">{err}</p>}
    </div>
  )
}
