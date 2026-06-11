// Core GEO Metrics — the objective "AI footprint" layer. We derive a category +
// realistic user prompts + a competitor set, probe a web-grounded model with
// those prompts, then measure Visibility, Citations, Sentiment, and Share of
// Voice from the answers. New products read near zero; that is the honest
// baseline, and the saved history is what makes it useful.
import 'server-only'
import { chat, parseJson, GEO_FAST_MODEL, GEO_WEB_MODEL, aiConfigured } from './openrouter'
import type { FootprintLayer, ProbeResult, Sentiment } from './types'

type Derived = { category: string; prompts: string[]; competitors: string[] }

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
// Match a brand as a whole token, case-insensitive (avoids "Notion" matching "Notional").
function mkRe(s: string): RegExp {
  return new RegExp(`(^|[^a-z0-9])${esc(s.trim())}([^a-z0-9]|$)`, 'i')
}
function countMatches(text: string, term: string): number {
  if (!term.trim()) return 0
  const re = new RegExp(`(^|[^a-z0-9])${esc(term.trim())}([^a-z0-9]|$)`, 'gi')
  const m = text.match(re)
  return m ? m.length : 0
}
function host(url: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return null
  }
}
function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n))
}

function emptyFootprint(note: string | null): FootprintLayer {
  return {
    score: 0,
    engine: GEO_WEB_MODEL,
    category: '',
    competitors: [],
    prompts: [],
    visibility: { score: 0, mentions: 0, probes: 0, detail: 'Not measured.' },
    citations: { score: 0, count: 0, probes: 0, detail: 'Not measured.' },
    sentiment: { index: 0, label: 'unknown', detail: 'Not measured.' },
    shareOfVoice: { score: 0, brandMentions: 0, competitorMentions: 0, detail: 'Not measured.' },
    probes: [],
    available: false,
    note,
  }
}

async function deriveContext(input: {
  name: string
  tagline: string
  description: string | null
  pageText: string | null
}): Promise<Derived> {
  const user = `A product is described below. Return ONLY JSON of this shape:
{"category":"<short category, e.g. 'AI note-taking apps'>",
 "prompts":["<exactly 5 natural questions a real person would type into an AI assistant when looking for a product like this. Do NOT mention this product's name — we are testing whether it surfaces organically>"],
 "competitors":["<5 to 8 well-known competing or peer product/brand names in this category>"]}

Product name: ${input.name}
Tagline: ${input.tagline}
${input.description ? `Description: ${input.description.slice(0, 500)}` : ''}
${input.pageText ? `Website text (excerpt): ${input.pageText.slice(0, 1200)}` : ''}`

  const { content } = await chat({
    model: GEO_FAST_MODEL,
    system: 'You are a precise market analyst. Respond ONLY with valid JSON.',
    user,
    json: true,
    maxTokens: 500,
  })
  const j = parseJson<Derived>(content)
  if (!j || !Array.isArray(j.prompts) || !j.prompts.length) throw new Error('derive failed')
  return {
    category: String(j.category || '').slice(0, 80),
    prompts: j.prompts.filter(Boolean).slice(0, 5),
    competitors: (j.competitors || []).filter(Boolean).slice(0, 8),
  }
}

async function probeOne(prompt: string, name: string, brandHost: string | null): Promise<ProbeResult> {
  try {
    const { content, citations } = await chat({ model: GEO_WEB_MODEL, user: prompt, maxTokens: 600, timeoutMs: 35000 })
    const mentioned = mkRe(name).test(content)
    const cited = brandHost
      ? citations.some((u) => u.toLowerCase().includes(brandHost)) || content.toLowerCase().includes(brandHost)
      : false
    return { prompt, answer: content, mentioned, cited, citations }
  } catch {
    return { prompt, answer: '', mentioned: false, cited: false, citations: [] }
  }
}

async function classifySentiment(
  name: string,
  answers: string[],
): Promise<{ index: number; label: Sentiment; detail: string }> {
  try {
    const user = `In the AI answers below, how is "${name}" characterized? Respond ONLY with JSON: {"label":"positive|neutral|negative","index":<integer -100..100>,"detail":"<one sentence>"}.

${answers.map((a, i) => `[Answer ${i + 1}] ${a.slice(0, 800)}`).join('\n\n')}`
    const { content } = await chat({
      model: GEO_FAST_MODEL,
      system: 'Respond ONLY with valid JSON.',
      user,
      json: true,
      maxTokens: 200,
    })
    const j = parseJson<{ label: Sentiment; index: number; detail: string }>(content)
    if (!j) throw new Error('sentiment parse')
    const label = (['positive', 'neutral', 'negative'].includes(j.label as string) ? j.label : 'neutral') as Sentiment
    return { index: clamp(Math.round(j.index ?? 0), -100, 100), label, detail: String(j.detail || '') }
  } catch {
    return { index: 0, label: 'neutral', detail: 'Mentioned, but sentiment was unclear.' }
  }
}

export async function computeFootprint(input: {
  name: string
  tagline: string
  description: string | null
  link: string | null
  pageText: string | null
}): Promise<FootprintLayer> {
  if (!aiConfigured()) return emptyFootprint('AI gateway is not configured.')

  let derived: Derived
  try {
    derived = await deriveContext(input)
  } catch {
    return emptyFootprint('Could not analyze the product category for AI probes.')
  }

  const brandHost = host(input.link)
  const probes = await Promise.all(derived.prompts.map((p) => probeOne(p, input.name, brandHost)))

  const fp = emptyFootprint(null)
  fp.available = true
  fp.category = derived.category
  fp.competitors = derived.competitors
  fp.prompts = derived.prompts
  fp.probes = probes

  const N = probes.length || 1
  const mentions = probes.filter((p) => p.mentioned).length
  const cited = probes.filter((p) => p.cited).length

  fp.visibility = {
    score: Math.round((mentions / N) * 100),
    mentions,
    probes: N,
    detail: `Mentioned in ${mentions} of ${N} AI answers to category questions.`,
  }
  fp.citations = {
    score: Math.round((cited / N) * 100),
    count: cited,
    probes: N,
    detail: brandHost
      ? `Your site was cited as a source in ${cited} of ${N} answers.`
      : 'Add a product link to measure source citations.',
  }

  // Share of Voice: brand mentions vs competitor mentions across all answers.
  let brandM = 0
  let compM = 0
  for (const pr of probes) {
    brandM += countMatches(pr.answer, input.name)
    for (const c of derived.competitors) compM += countMatches(pr.answer, c)
  }
  const total = brandM + compM
  fp.shareOfVoice = {
    score: total ? Math.round((brandM / total) * 100) : 0,
    brandMentions: brandM,
    competitorMentions: compM,
    detail: total
      ? `${brandM} of ${total} brand mentions across the answers were yours (vs ${derived.competitors.length} peers).`
      : 'No brands surfaced in these answers yet.',
  }

  fp.sentiment =
    mentions > 0
      ? await classifySentiment(input.name, probes.filter((p) => p.mentioned).map((p) => p.answer))
      : { index: 0, label: 'unknown', detail: 'Not mentioned yet — nothing to measure.' }

  // Blended footprint: visibility leads, citations + share of voice support.
  fp.score = Math.round(fp.visibility.score * 0.5 + fp.citations.score * 0.25 + fp.shareOfVoice.score * 0.25)
  return fp
}
