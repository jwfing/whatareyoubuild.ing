'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { runGeoCheck, loadGeoHistory } from '@/lib/geo/client'
import type { CheckItem, CheckStatus, GeoRow } from '@/lib/geo/types'
import { timeAgo } from '@/lib/format'

function grade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

function StatusTag({ status }: { status: CheckStatus }) {
  if (status === 'urgent')
    return <span className="mono bg-[var(--ink)] px-1.5 py-0.5 text-[10px] tracking-wider text-[var(--paper)]">URGENT</span>
  if (status === 'recommended')
    return <span className="mono rule border px-1.5 py-0.5 text-[10px] tracking-wider" style={{ borderWidth: 1 }}>TO TUNE</span>
  return <span className="mono text-[10px] tracking-wider text-[var(--muted)]">✓ DONE</span>
}

function ScoreTile({ label, score, grade: g, sub }: { label: string; score: number; grade?: string; sub?: string }) {
  return (
    <div className="rule flex-1 px-4 py-3">
      <div className="mono text-[11px] tracking-[0.15em] text-[var(--muted)]">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="masthead text-4xl tabular-nums">{score}</span>
        <span className="text-[var(--muted)]">/100</span>
        {g && <span className="mono ml-auto text-2xl">{g}</span>}
      </div>
      {sub && <div className="mt-1 text-xs text-[var(--muted)]">{sub}</div>}
    </div>
  )
}

function Item({ it }: { it: CheckItem }) {
  return (
    <li className="hairline py-2.5">
      <div className="flex items-center gap-2">
        <StatusTag status={it.status} />
        <b className="text-sm">{it.label}</b>
        <span className="mono ml-auto text-xs text-[var(--muted)]">{it.detail}</span>
      </div>
      {it.tip && <p className="mt-1 text-sm text-[var(--muted)]">{it.tip}</p>}
    </li>
  )
}

export default function GeoReportPanel({ productId }: { productId: string }) {
  const [rows, setRows] = useState<GeoRow[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const didInit = useRef(false)

  const run = useCallback(async () => {
    setRunning(true)
    setError(null)
    try {
      const row = await runGeoCheck(productId)
      setRows((prev) => [row, ...prev])
    } catch (e) {
      setError((e as Error).message || 'Check failed. Please try again.')
    } finally {
      setRunning(false)
    }
  }, [productId])

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    ;(async () => {
      const history = await loadGeoHistory(productId)
      setRows(history)
      setLoadingHistory(false)
      if (history.length === 0) void run()
    })()
  }, [productId, run])

  const latest = rows[0]
  const r = latest?.report
  const urgent = r?.health.items.filter((i) => i.status === 'urgent') ?? []
  const tune = r?.health.items.filter((i) => i.status === 'recommended') ?? []
  const done = r?.health.items.filter((i) => i.status === 'done') ?? []
  const fp = r?.footprint

  return (
    <section className="rule mt-10 border-x-0 border-b-0 pt-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="masthead text-2xl">GEO report</h2>
        <span className="mono text-[11px] tracking-wider text-[var(--muted)]">PRIVATE · ONLY YOU SEE THIS</span>
        <button
          onClick={run}
          disabled={running}
          className="rule mono ml-auto px-3 py-1.5 text-xs transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-50"
        >
          {running ? 'Checking…' : latest ? 'Run new check' : 'Run check'}
        </button>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        A free read on how findable your product is — both your page&apos;s on-page health and your current footprint in AI
        answers. Re-run anytime; every check is saved so you can watch it improve.
      </p>

      {error && <p className="mono mt-3 text-sm text-red-700">{error}</p>}

      {!latest && (loadingHistory || running) && (
        <div className="rule mt-5 px-5 py-10 text-center">
          <p className="masthead text-lg">{running ? 'Running your first GEO check…' : 'Loading…'}</p>
          {running && (
            <p className="mt-1 text-sm text-[var(--muted)]">Asking AI engines about your product — this takes ~15 seconds.</p>
          )}
        </div>
      )}

      {latest && r && (
        <>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <ScoreTile
              label="GEO HEALTH"
              score={r.health.score}
              grade={grade(r.health.score)}
              sub={r.health.capped ? (r.health.capReason ?? 'Capped.') : 'On-page readiness for search + AI crawlers'}
            />
            <ScoreTile
              label="AI FOOTPRINT"
              score={r.footprint.score}
              sub={
                !r.footprint.available
                  ? r.footprint.note ?? 'Not measured'
                  : r.footprint.score === 0
                    ? 'Near zero is normal for a new launch — this is your baseline'
                    : 'Your current presence in AI answers'
              }
            />
          </div>

          {/* On-page health */}
          <h3 className="mono mt-7 text-xs tracking-[0.15em] text-[var(--muted)]">
            ON-PAGE HEALTH {urgent.length > 0 && <span className="text-red-700">· {urgent.length} URGENT</span>}
          </h3>
          {urgent.length === 0 && tune.length === 0 ? (
            <p className="mt-2 text-sm">Clean sweep — every on-page check passed. 🎯</p>
          ) : (
            <ul className="mt-1">
              {urgent.map((it) => (
                <Item key={it.id} it={it} />
              ))}
              {tune.map((it) => (
                <Item key={it.id} it={it} />
              ))}
            </ul>
          )}
          {done.length > 0 && (
            <details className="mt-2">
              <summary className="mono cursor-pointer text-xs text-[var(--muted)] hover:text-[var(--ink)]">
                {done.length} passing — show
              </summary>
              <ul className="mt-1">
                {done.map((it) => (
                  <li key={it.id} className="hairline flex items-center gap-2 py-1.5 text-sm">
                    <span className="text-[var(--muted)]">✓</span>
                    <span>{it.label}</span>
                    <span className="mono ml-auto text-xs text-[var(--muted)]">{it.detail}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* AI footprint metrics */}
          <h3 className="mono mt-7 text-xs tracking-[0.15em] text-[var(--muted)]">AI FOOTPRINT — CORE METRICS</h3>
          {!fp?.available ? (
            <p className="mt-2 text-sm text-[var(--muted)]">{fp?.note ?? 'Could not measure AI footprint this run.'}</p>
          ) : (
            <>
              <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                <Metric n={`${fp.visibility.score}`} unit="/100" label="Visibility" detail={fp.visibility.detail} />
                <Metric n={`${fp.citations.count}`} unit={`/${fp.citations.probes}`} label="Citations" detail={fp.citations.detail} />
                <Metric
                  n={fp.sentiment.label === 'unknown' ? '—' : fp.sentiment.label}
                  unit=""
                  label="Sentiment"
                  detail={fp.sentiment.detail}
                />
                <Metric n={`${fp.shareOfVoice.score}`} unit="%" label="Share of Voice" detail={fp.shareOfVoice.detail} />
              </dl>
              {fp.category && (
                <p className="mt-3 text-xs text-[var(--muted)]">
                  Category: <span className="text-[var(--ink)]">{fp.category}</span>
                  {fp.competitors.length > 0 && <> · Peers measured against: {fp.competitors.join(', ')}</>}
                </p>
              )}
              {fp.prompts.length > 0 && (
                <details className="mt-2">
                  <summary className="mono cursor-pointer text-xs text-[var(--muted)] hover:text-[var(--ink)]">
                    {fp.prompts.length} prompts we asked AI — show
                  </summary>
                  <ol className="mt-1 space-y-1">
                    {fp.prompts.map((p, i) => (
                      <li key={i} className="text-sm text-[var(--muted)]">
                        “{p}”
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </>
          )}

          {/* AI coach commentary */}
          {r.commentary && (
            <>
              <h3 className="mono mt-7 text-xs tracking-[0.15em] text-[var(--muted)]">WHAT AI SEES</h3>
              {r.commentary.aiDescription && <p className="mt-2 text-sm italic">“{r.commentary.aiDescription}”</p>}
              {r.commentary.improvements.length > 0 && (
                <ol className="mt-3 space-y-1.5">
                  {r.commentary.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mono text-[var(--muted)]">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}

          {/* History */}
          {rows.length > 1 && (
            <>
              <h3 className="mono mt-7 text-xs tracking-[0.15em] text-[var(--muted)]">HISTORY — YOUR PROGRESS</h3>
              <ul className="mt-1">
                {rows.map((row, i) => {
                  const prev = rows[i + 1]
                  const dF = prev ? row.footprint_score - prev.footprint_score : 0
                  return (
                    <li key={row.id} className="hairline flex items-center gap-3 py-2 text-sm">
                      <span className="mono text-xs text-[var(--muted)]">{timeAgo(row.checked_at)}</span>
                      <span className="ml-auto mono text-xs">Health {row.health_score}</span>
                      <span className="mono text-xs">
                        Footprint {row.footprint_score}
                        {prev && dF !== 0 && (
                          <span className={dF > 0 ? 'text-green-700' : 'text-red-700'}>
                            {' '}
                            {dF > 0 ? '▲' : '▼'}
                            {Math.abs(dF)}
                          </span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          <p className="mt-6 text-[11px] leading-relaxed text-[var(--muted)]">
            Last checked {timeAgo(latest.checked_at)}. {r.method}
          </p>
        </>
      )}
    </section>
  )
}

function Metric({ n, unit, label, detail }: { n: string; unit: string; label: string; detail: string }) {
  return (
    <div>
      <dt className="mono text-[11px] tracking-[0.12em] text-[var(--muted)]">{label.toUpperCase()}</dt>
      <dd className="masthead mt-0.5 text-2xl capitalize tabular-nums">
        {n}
        {unit && <span className="text-base font-normal text-[var(--muted)]">{unit}</span>}
      </dd>
      <dd className="mt-0.5 text-xs leading-snug text-[var(--muted)]">{detail}</dd>
    </div>
  )
}
