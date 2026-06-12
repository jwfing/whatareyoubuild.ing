// Deterministic on-page GEO/SEO health checks. Pure given a PageDoc, so it is
// unit-testable and produces the same score every run.
import * as cheerio from 'cheerio'
import type { CheckItem, HealthLayer } from './types'

export type PageDoc = {
  status: number | null
  finalUrl: string
  html: string
  robotsTxt: string | null
  llmsTxtExists: boolean
  sitemapHint: boolean
  noLink?: boolean
}

const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
]

// Crude robots.txt evaluation: group by User-agent, flag groups that Disallow: /.
// Returns the AI-relevant agents (or "*") that are fully blocked.
export function aiBotsBlocked(robots: string): string[] {
  const lines = robots
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*/, '').trim())
    .filter(Boolean)

  type Group = { agents: string[]; disallowAll: boolean }
  const groups: Group[] = []
  let cur: Group | null = null
  let lastWasAgent = false

  for (const line of lines) {
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i)
    if (!m) continue
    const field = m[1].toLowerCase()
    const val = m[2].trim()
    if (field === 'user-agent') {
      if (!cur || !lastWasAgent) {
        cur = { agents: [], disallowAll: false }
        groups.push(cur)
      }
      cur.agents.push(val)
      lastWasAgent = true
    } else {
      lastWasAgent = false
      if (!cur) continue
      if (field === 'disallow' && val === '/') cur.disallowAll = true
      if (field === 'allow' && val === '/') cur.disallowAll = false // loosens (approx)
    }
  }

  const blocked = new Set<string>()
  for (const g of groups) {
    if (!g.disallowAll) continue
    for (const a of g.agents) {
      if (a === '*') blocked.add('all crawlers (*)')
      else if (AI_BOTS.some((b) => b.toLowerCase() === a.toLowerCase())) blocked.add(a)
    }
  }
  return [...blocked]
}

// Pull every @type out of a parsed JSON-LD value, following @graph containers
// and arrays. Handles the common shapes: a bare object, an array of objects,
// and { "@context": …, "@graph": [ … ] }.
export function collectLdTypes(node: unknown, out: string[]): void {
  if (!node) return
  if (Array.isArray(node)) {
    for (const n of node) collectLdTypes(n, out)
    return
  }
  if (typeof node === 'object') {
    const o = node as Record<string, unknown>
    const t = o['@type']
    if (Array.isArray(t)) for (const x of t) out.push(String(x))
    else if (t) out.push(String(t))
    if (o['@graph']) collectLdTypes(o['@graph'], out)
  }
}

export function scoreItems(items: CheckItem[]): number {
  if (!items.length) return 0
  let got = 0
  for (const it of items) {
    got += it.status === 'done' ? 1 : it.status === 'recommended' ? 0.5 : 0
  }
  return Math.round((got / items.length) * 100)
}

export function analyzeOnPage(page: PageDoc): HealthLayer {
  const items: CheckItem[] = []

  if (page.noLink) {
    const capReason = 'No product link to analyze.'
    items.push({
      id: 'link',
      label: 'Product has a link',
      status: 'urgent',
      detail: 'This product has no link, so there is no page to check.',
      tip: 'Add a product URL — without a destination, AI engines and visitors have nothing to send people to, and there is nothing to optimize.',
    })
    return { score: 0, capped: true, capReason, items, fetchOk: false, finalUrl: null, httpStatus: null }
  }

  const fetchOk = !!page.html && (page.status ? page.status < 400 : false)

  if (!fetchOk) {
    const capReason = page.status
      ? `The page returned HTTP ${page.status}.`
      : 'We could not load the page — it timed out, blocked our request, or sits behind a login.'
    items.push({
      id: 'reachable',
      label: 'Page loads for crawlers',
      status: 'urgent',
      detail: capReason,
      tip: 'Make sure the page is publicly reachable without a login wall and returns HTTP 200. If AI crawlers and search engines cannot fetch it, nothing else matters.',
    })
    return { score: 10, capped: true, capReason, items, fetchOk, finalUrl: page.finalUrl, httpStatus: page.status }
  }

  const $ = cheerio.load(page.html)
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()

  const add = (id: string, label: string, ok: boolean, warn: boolean, detail: string, tip: string) =>
    items.push({ id, label, status: ok ? 'done' : warn ? 'recommended' : 'urgent', detail, tip: ok ? '' : tip })

  // Title
  const title = ($('head > title').first().text() || '').trim()
  add(
    'title',
    'Title tag',
    !!title && title.length >= 10 && title.length <= 65,
    !!title,
    title ? `“${title}” (${title.length} chars)` : 'No <title> found.',
    title
      ? 'Aim for 10–65 characters that clearly name the product and what it does.'
      : 'Add a <title> naming the product and its value in 10–65 characters.',
  )

  // Meta description
  const desc = ($('meta[name="description"]').attr('content') || '').trim()
  add(
    'description',
    'Meta description',
    desc.length >= 50 && desc.length <= 160,
    !!desc,
    desc ? `${desc.length} chars` : 'No meta description.',
    desc
      ? 'Aim for 50–160 characters. AI answers often lift this verbatim as the summary.'
      : 'Add a meta description (50–160 chars). AI answers often lift it as the product summary.',
  )

  // H1
  const h1s = $('h1')
    .map((_, e) => $(e).text().trim())
    .get()
    .filter(Boolean)
  add(
    'h1',
    'Single clear H1',
    h1s.length === 1,
    h1s.length > 1,
    h1s.length ? `${h1s.length} H1${h1s.length > 1 ? 's' : ''} found` : 'No H1 found.',
    h1s.length > 1
      ? 'Use exactly one H1 that states what the product is.'
      : 'Add one H1 that states plainly what the product is.',
  )

  // Canonical — worth having, but a missing canonical (especially on a homepage)
  // is a tune-up, not urgent: engines usually resolve the canonical URL anyway.
  const canonical = $('link[rel="canonical"]').attr('href')
  add(
    'canonical',
    'Canonical URL',
    !!canonical,
    true,
    canonical || 'No canonical link.',
    'Add <link rel="canonical"> so engines consolidate ranking signals onto one URL.',
  )

  // Language
  const lang = $('html').attr('lang')
  add(
    'lang',
    'Language declared',
    !!lang,
    true,
    lang ? `lang="${lang}"` : 'No <html lang>.',
    'Set <html lang="…"> so engines know the content language.',
  )

  // Open Graph
  const ogt = $('meta[property="og:title"]').attr('content')
  const ogd = $('meta[property="og:description"]').attr('content')
  const ogi = $('meta[property="og:image"]').attr('content')
  const ogCount = [ogt, ogd, ogi].filter(Boolean).length
  add(
    'og',
    'Open Graph tags',
    ogCount === 3,
    ogCount > 0,
    `${ogCount}/3 present (title / description / image)`,
    'Add og:title, og:description, and og:image so your product renders a rich card when shared or cited.',
  )

  // Twitter card
  const tw = $('meta[name="twitter:card"]').attr('content')
  add('twitter', 'Twitter Card', !!tw, true, tw || 'No twitter:card.', 'Add a twitter:card (summary_large_image) for rich previews on X.')

  // Structured data — collect @type values, descending into @graph and arrays
  // (very common wrappers; the old top-level-only check missed them).
  const ldTypes: string[] = []
  $('script[type="application/ld+json"]').each((_, e) => {
    try {
      collectLdTypes(JSON.parse($(e).text()), ldTypes)
    } catch {
      /* malformed JSON-LD — ignore */
    }
  })
  add(
    'jsonld',
    'Structured data (JSON-LD)',
    ldTypes.length > 0,
    false,
    ldTypes.length ? `Found: ${[...new Set(ldTypes)].join(', ')}` : 'No JSON-LD structured data.',
    'Add schema.org JSON-LD (SoftwareApplication or Organization). It is one of the strongest signals for an AI engine to understand and cite you.',
  )

  // Favicon
  const fav = $('link[rel~="icon"]').attr('href')
  add('favicon', 'Favicon', !!fav, true, fav ? 'present' : 'No favicon link.', 'Add a favicon so your brand shows an icon in results and tabs.')

  // AI crawler access
  const robotsExists = page.robotsTxt != null && page.robotsTxt.trim().length > 0
  const blocked = robotsExists ? aiBotsBlocked(page.robotsTxt as string) : []
  add(
    'aicrawlers',
    'AI crawlers allowed',
    robotsExists ? blocked.length === 0 : true,
    !robotsExists,
    !robotsExists
      ? 'No robots.txt (everything is crawlable by default).'
      : blocked.length
        ? `Blocked: ${blocked.join(', ')}`
        : 'No AI crawlers blocked.',
    blocked.length
      ? `Your robots.txt blocks ${blocked.join(', ')}. Remove those Disallow rules so AI answer engines can read and cite you.`
      : 'Keep AI crawler user-agents (GPTBot, ClaudeBot, PerplexityBot, …) allowed in robots.txt.',
  )

  // llms.txt
  add(
    'llmstxt',
    'llms.txt present',
    page.llmsTxtExists,
    true,
    page.llmsTxtExists ? 'Found at /llms.txt' : 'No /llms.txt.',
    'Add an /llms.txt — a short markdown brief telling AI engines what your product is and which pages to cite.',
  )

  // Sitemap
  add(
    'sitemap',
    'Sitemap discoverable',
    page.sitemapHint,
    true,
    page.sitemapHint ? 'Referenced or available' : 'No sitemap in robots.txt or at /sitemap.xml.',
    'Publish a sitemap.xml and reference it from robots.txt so engines discover all your pages.',
  )

  // Server-rendered text (AI crawlers often do not run JS)
  const wordCount = bodyText ? bodyText.split(' ').filter(Boolean).length : 0
  add(
    'ssr',
    'Readable text in HTML',
    wordCount >= 120,
    wordCount >= 40,
    `${wordCount} words of text in the served HTML`,
    'Your page returns little text in the initial HTML — likely a JavaScript-only render. Many AI crawlers do not run JS, so they see an empty page. Add server-side rendering or prerendering so your copy is in the HTML.',
  )

  return { score: scoreItems(items), capped: false, capReason: null, items, fetchOk, finalUrl: page.finalUrl, httpStatus: page.status }
}

// Plain-text extraction for the AI derive step (drop script/style/nav noise).
export function textFromHtml(html: string): string {
  try {
    const $ = cheerio.load(html)
    $('script, style, noscript, svg').remove()
    return $('body').text().replace(/\s+/g, ' ').trim()
  } catch {
    return ''
  }
}
