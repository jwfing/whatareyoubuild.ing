'use client'
// Compact per-product GEO line for the owner-only "Your products" page:
// cached scores + an on-demand (re)check button. Full report lives on /p/[id].
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { runGeoCheck, loadGeoHistory } from '@/lib/geo/client'
import type { GeoRow } from '@/lib/geo/types'

export default function GeoSummary({ productId }: { productId: string }) {
  const [latest, setLatest] = useState<GeoRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const didInit = useRef(false)

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    ;(async () => {
      const history = await loadGeoHistory(productId)
      setLatest(history[0] ?? null)
      setLoading(false)
    })()
  }, [productId])

  async function run() {
    setRunning(true)
    setError(null)
    try {
      setLatest(await runGeoCheck(productId))
    } catch (e) {
      setError((e as Error).message || 'failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="mono mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-[72px] text-[11px] text-[var(--muted)]">
      <span className="tracking-[0.15em]">GEO</span>
      {loading ? (
        <span>…</span>
      ) : latest ? (
        <>
          <span>Health {latest.health_score}</span>
          <span>Footprint {latest.footprint_score}</span>
          <Link href={`/p/${productId}`} className="underline transition-colors hover:text-[var(--ink)]">
            report →
          </Link>
        </>
      ) : (
        <span>not checked yet</span>
      )}
      <button
        onClick={run}
        disabled={running}
        className="border border-[var(--line)] px-2 py-0.5 transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)] disabled:opacity-50"
      >
        {running ? 'checking…' : latest ? 'recheck' : 'run check'}
      </button>
      {error && <span className="text-red-700">{error}</span>}
    </div>
  )
}
