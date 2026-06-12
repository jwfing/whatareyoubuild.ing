// Thin OpenRouter chat client. Server-only — relies on OPENROUTER_API_KEY,
// which must never be exposed to the browser.
import 'server-only'

const OR_URL = 'https://openrouter.ai/api/v1/chat/completions'
const KEY = process.env.OPENROUTER_API_KEY

// A cheap, fast model for derive / classify / commentary (must support JSON output).
export const GEO_FAST_MODEL = process.env.GEO_FAST_MODEL || 'openai/gpt-4o-mini'

// Web-grounded engines for the visibility probes (each returns citations).
// Mirrors the three consumer answer engines: Perplexity, ChatGPT, Gemini.
// Override with GEO_WEB_ENGINES="id|Label,id|Label,…".
export type WebEngine = { id: string; label: string }
function parseEngines(s?: string): WebEngine[] | null {
  if (!s) return null
  const items = s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((pair) => {
      const [id, label] = pair.split('|').map((y) => y.trim())
      return id ? { id, label: label || id } : null
    })
    .filter((e): e is WebEngine => e !== null)
  return items.length ? items : null
}
export const GEO_WEB_ENGINES: WebEngine[] = parseEngines(process.env.GEO_WEB_ENGINES) ?? [
  { id: 'perplexity/sonar', label: 'Perplexity' },
  { id: 'openai/gpt-4o-mini:online', label: 'ChatGPT' },
  { id: 'google/gemini-2.5-flash:online', label: 'Gemini' },
]

export function aiConfigured(): boolean {
  return !!KEY
}

export async function chat(opts: {
  model: string
  system?: string
  user: string
  json?: boolean
  maxTokens?: number
  timeoutMs?: number
}): Promise<{ content: string; citations: string[] }> {
  if (!KEY) throw new Error('OPENROUTER_API_KEY not set')
  const messages: { role: string; content: string }[] = []
  if (opts.system) messages.push({ role: 'system', content: opts.system })
  messages.push({ role: 'user', content: opts.user })

  const body: Record<string, unknown> = {
    model: opts.model,
    messages,
    max_tokens: opts.maxTokens ?? 700,
    temperature: 0.2,
  }
  if (opts.json) body.response_format = { type: 'json_object' }

  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 30000)
  try {
    const res = await fetch(OR_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.whatareyoubuild.ing',
        'X-Title': 'What Are You Building',
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(`OpenRouter ${res.status}${txt ? `: ${txt.slice(0, 200)}` : ''}`)
    }
    const data = await res.json()
    const content: string = data?.choices?.[0]?.message?.content ?? ''
    return { content: String(content), citations: extractCitations(data) }
  } finally {
    clearTimeout(t)
  }
}

// Web-grounded models attach sources in different places depending on provider:
// a top-level `citations` array (older Perplexity) or, via OpenRouter, the
// OpenAI-standard `message.annotations` with `url_citation` entries.
type Annotation = { type?: string; url?: string; url_citation?: { url?: string } }
function extractCitations(data: unknown): string[] {
  const d = data as { citations?: unknown; choices?: { message?: { annotations?: Annotation[] } }[] }
  const out: string[] = []
  if (Array.isArray(d?.citations)) {
    for (const c of d.citations) {
      const url = typeof c === 'string' ? c : (c as { url?: string })?.url
      if (url) out.push(url)
    }
  }
  const ann = d?.choices?.[0]?.message?.annotations
  if (Array.isArray(ann)) {
    for (const a of ann) {
      const url = a?.url_citation?.url || (a?.type === 'url_citation' ? a?.url : undefined)
      if (url) out.push(url)
    }
  }
  return [...new Set(out)]
}

// Best-effort JSON extraction — models occasionally wrap JSON in prose.
export function parseJson<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T
  } catch {
    /* fall through */
  }
  const m = s.match(/\{[\s\S]*\}/)
  if (m) {
    try {
      return JSON.parse(m[0]) as T
    } catch {
      /* give up */
    }
  }
  return null
}
