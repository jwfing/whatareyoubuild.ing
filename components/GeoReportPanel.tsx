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

function SectionLabel({ children, accent }: { children: React.ReactNode; accent?: React.ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-center gap-3">
      <span className="mono text-[11px] tracking-[0.2em] text-[var(--muted)]">{children}</span>
      {accent}
      <span className="h-px flex-1 bg-[var(--line)]" />
    </div>
  )
}

function StatusTag({ status }: { status: CheckStatus }) {
  if (status === 'urgent')
    return <span className="mono bg-[var(--ink)] px-1.5 py-0.5 text-[10px] tracking-wider text-[var(--report)]">URGENT</span>
  if (status === 'recommended')
    return <span className="mono border border-[var(--ink)] px-1.5 py-0.5 text-[10px] tracking-wider">TO TUNE</span>
  return <span className="mono text-[10px] tracking-wider text-[var(--muted)]">✓ DONE</span>
}

function ScoreTile({ label, score, grade: g, sub }: { label: string; score: number; grade?: string; sub: string }) {
  return (
    <div className="flex-1 border border-[var(--ink)] bg-[var(--paper)] px-4 py-3">
      <div className="mono text-[11px] tracking-[0.15em] text-[var(--muted)]">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="masthead text-5xl leading-none tabular-nums">{score}</span>
        <span className="text-sm text-[var(--muted)]">/100</span>
        {g && <span className="mono ml-auto text-3xl">{g}</span>}
      </div>
      <div className="mt-2 text-xs leading-snug text-[var(--muted)]">{sub}</div>
    </div>
  )
}

function Metric({ n, unit, label, detail }: { n: string; unit: string; label: string; detail: string }) {
  return (
    <div className="p-3">
      <dt className="mono text-[10px] tracking-[0.12em] text-[var(--muted)]">{label.toUpperCase()}</dt>
      <dd className="masthead mt-1 text-2xl leading-none capitalize tabular-nums">
        {n}
        {unit && <span className="text-sm font-normal text-[var(--muted)]">{unit}</span>}
      </dd>
      <dd className="mt-1.5 text-[11px] leading-snug text-[var(--muted)]">{detail}</dd>
    </div>
  )
}

function Item({ it }: { it: CheckItem }) {
  return (
    <li className="hairline py-2.5">
      <div className="flex items-center gap-2">
        <StatusTag status={it.status} />
        <b className="text-sm">{it.label}</b>
        <span className="mono ml-auto text-right text-xs text-[var(--muted)]">{it.detail}</span>
      </div>
      {it.tip && <p className="mt-1 text-sm text-[var(--muted)]">{it.tip}</p>}
    </li>
  )
}

export default function GeoReportPanel({ productId, preview }: { productId: string; preview?: GeoRow[] }) {
  const [rows, setRows] = useState<GeoRow[]>(preview ?? [])
  const [loadingHistory, setLoadingHistory] = useState(!preview)
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
    if (preview) return
    if (didInit.current) return
    didInit.current = true
    ;(async () => {
      const history = await loadGeoHistory(productId)
      setRows(history)
      setLoadingHistory(false)
      if (history.length === 0) void run()
    })()
  }, [productId, run, preview])

  const latest = rows[0]
  const r = latest?.report
  const urgent = r?.health.items.filter((i) => i.status === 'urgent') ?? []
  const tune = r?.health.items.filter((i) => i.status === 'recommended') ?? []
  const done = r?.health.items.filter((i) => i.status === 'done') ?? []
  const fp = r?.footprint

  return (
    <section className="mt-10">
      <div className="rule bg-[var(--report)]">
        {/* Reverse-printed header bar — marks this as a distinct, private module */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-[var(--ink)] px-4 py-3 text-[var(--paper)] sm:px-6">
          <div>
            <h2 className="masthead text-xl leading-none">GEO REPORT</h2>
            <span className="mono mt-1 block text-[10px] tracking-[0.18em] text-[var(--paper)]/60">
              PRIVATE · ONLY YOU SEE THIS
            </span>
          </div>
          <button
            onClick={run}
            disabled={running}
            className="mono ml-auto border border-[var(--paper)]/40 px-3 py-1.5 text-xs transition-colors hover:bg-[var(--paper)] hover:text-[var(--ink)] disabled:opacity-50"
          >
            {running ? 'Checking…' : latest ? 'Run new check' : 'Run check'}
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-sm text-[var(--muted)]">
            A free read on how findable your product is — your page&apos;s on-page health and your current footprint in AI
            answers. Re-run anytime; every check is saved so you can watch it improve.
          </p>

          {error && <p className="mono mt-3 text-sm text-red-700">{error}</p>}

          {!latest && (loadingHistory || running) && (
            <div className="mt-5 border border-[var(--ink)] bg-[var(--paper)] px-5 py-12 text-center">
              <p className="masthead text-lg">{running ? 'Running your first GEO check…' : 'Loading…'}</p>
              {running && (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Asking AI engines about your product — this takes ~15 seconds.
                </p>
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
                      ? (r.footprint.note ?? 'Not measured')
                      : r.footprint.score === 0
                        ? 'Near zero is normal for a new launch — this is your baseline'
                        : 'Your current presence in AI answers'
                  }
                />
              </div>

              {/* On-page health */}
              <SectionLabel
                accent={urgent.length > 0 ? <span className="mono text-[11px] text-red-700">{urgent.length} URGENT</span> : undefined}
              >
                ON-PAGE HEALTH
              </SectionLabel>
              {urgent.length === 0 && tune.length === 0 ? (
                <p className="text-sm">Clean sweep — every on-page check passed.</p>
              ) : (
                <ul>
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
              <SectionLabel>AI FOOTPRINT · CORE METRICS</SectionLabel>
              {!fp?.available ? (
                <p className="text-sm text-[var(--muted)]">{fp?.note ?? 'Could not measure AI footprint this run.'}</p>
              ) : (
                <>
                  <dl className="grid grid-cols-2 divide-x divide-y divide-[var(--line)] border border-[var(--ink)] bg-[var(--paper)] sm:grid-cols-4 sm:divide-y-0">
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
                      {fp.competitors.length > 0 && <> · Measured against: {fp.competitors.join(', ')}</>}
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
                  <SectionLabel>WHAT AI SEES</SectionLabel>
                  {r.commentary.aiDescription && (
                    <p className="border border-[var(--ink)] bg-[var(--paper)] px-4 py-3 text-[15px] italic leading-relaxed">
                      “{r.commentary.aiDescription}”
                    </p>
                  )}
                  {r.commentary.improvements.length > 0 && (
                    <ol className="mt-4 space-y-2">
                      {r.commentary.improvements.map((s, i) => (
                        <li key={i} className="flex gap-2.5 text-sm">
                          <span className="mono shrink-0 text-[var(--muted)]">{i + 1}.</span>
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
                  <SectionLabel>HISTORY · YOUR PROGRESS</SectionLabel>
                  <ul>
                    {rows.map((row, i) => {
                      const prev = rows[i + 1]
                      const dF = prev ? row.footprint_score - prev.footprint_score : 0
                      return (
                        <li key={row.id} className="hairline flex items-center gap-3 py-2 text-sm">
                          <span className="mono text-xs text-[var(--muted)]">{timeAgo(row.checked_at)}</span>
                          <span className="mono ml-auto text-xs">Health {row.health_score}</span>
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

              <p className="mt-6 border-t border-[var(--line)] pt-4 text-[11px] leading-relaxed text-[var(--muted)]">
                Last checked {timeAgo(latest.checked_at)}. {r.method}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
