'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient, type Product } from '@/lib/insforge'
import GeoSummary from './GeoSummary'

export default function MyProductRow({ product: p }: { product: Product }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onDelete() {
    setBusy(true)
    setErr(null)
    const insforge = getBrowserClient()
    // Delete the row first — it's the RLS-gated, cascading action (votes,
    // comments, and GEO reports drop with it). Only touch storage if it works.
    const { error } = await insforge.database.from('products').delete().eq('id', p.id)
    if (error) {
      setErr('Could not delete — please try again.')
      setBusy(false)
      return
    }
    // Best-effort cleanup of the now-orphaned images (don't block on failures).
    const keys = [p.image_key, ...(p.screenshots ?? []).map((s) => s.key)].filter(Boolean)
    await Promise.allSettled(keys.map((k) => insforge.storage.from('product-images').remove(k)))
    router.refresh()
  }

  return (
    <li className="hairline px-2 py-3">
      <div className="flex items-center gap-4">
        <Image src={p.image_url} alt="" width={56} height={56} className="rule h-14 w-14 shrink-0 object-cover" />
        <div className="min-w-0 flex-1">
          <b className="block truncate">{p.name}</b>
          <span className="block truncate text-sm text-[var(--muted)]">{p.tagline}</span>
        </div>
        <span className="mono shrink-0 text-xs text-[var(--muted)]">▲ {p.vote_count}</span>
        <Link href={`/p/${p.id}`} className="mono shrink-0 text-xs underline">
          View
        </Link>
        <Link
          href={`/p/${p.id}/edit`}
          className="rule mono shrink-0 px-3 py-1 text-xs transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
        >
          Edit
        </Link>
        <button
          onClick={() => setConfirming((c) => !c)}
          className="mono shrink-0 px-2 py-1 text-xs text-[var(--muted)] underline transition-colors hover:text-red-700"
        >
          Delete
        </button>
      </div>

      <GeoSummary productId={p.id} />

      {confirming && (
        <div className="mono mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 border border-red-700/40 bg-red-700/5 px-3 py-2 text-xs">
          <span>
            Delete <b>{p.name}</b>? This permanently removes it, its votes, comments, and GEO reports.
          </span>
          <button
            onClick={onDelete}
            disabled={busy}
            className="ml-auto bg-red-700 px-3 py-1 text-[var(--paper)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Deleting…' : 'Delete for good'}
          </button>
          <button onClick={() => setConfirming(false)} disabled={busy} className="underline disabled:opacity-50">
            Cancel
          </button>
          {err && <span className="w-full text-red-700">{err}</span>}
        </div>
      )}
    </li>
  )
}
