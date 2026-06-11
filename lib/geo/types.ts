// Shared shapes for the GEO/AEO report. One report = three layers:
//   1. health    — deterministic on-page checks (actionable now)
//   2. footprint  — measured AI visibility (track over time)
//   3. commentary — an AI coach's read of both

export type CheckStatus = 'urgent' | 'recommended' | 'done'

export type CheckItem = {
  id: string
  label: string
  status: CheckStatus
  detail: string // what we found
  tip: string // how to fix (empty when done)
}

export type HealthLayer = {
  score: number // 0–100
  capped: boolean
  capReason: string | null
  items: CheckItem[]
  fetchOk: boolean
  finalUrl: string | null
  httpStatus: number | null
}

export type Sentiment = 'positive' | 'neutral' | 'negative' | 'unknown'

export type ProbeResult = {
  prompt: string
  answer: string
  mentioned: boolean
  cited: boolean
  citations: string[]
}

export type FootprintLayer = {
  score: number // 0–100 blended AI footprint
  engine: string // model id used for the web probes
  category: string
  competitors: string[]
  prompts: string[]
  visibility: { score: number; mentions: number; probes: number; detail: string }
  citations: { score: number; count: number; probes: number; detail: string }
  sentiment: { index: number; label: Sentiment; detail: string } // index -100..100
  shareOfVoice: { score: number; brandMentions: number; competitorMentions: number; detail: string }
  probes: ProbeResult[]
  available: boolean // false when metrics could not run (no key / derive failed)
  note: string | null
}

export type Commentary = {
  aiDescription: string // how an AI would describe the product today
  improvements: string[] // top few highest-leverage fixes
}

export type GeoReport = {
  version: 1
  generatedAt: string // ISO
  productId: string
  link: string | null
  health: HealthLayer
  footprint: FootprintLayer
  commentary: Commentary | null
  method: string // honest disclosure of how the numbers were produced
}

// Persisted row shape (table: product_geo_reports).
export type GeoRow = {
  id: string
  product_id: string
  report: GeoReport
  health_score: number
  footprint_score: number
  checked_at: string
}
