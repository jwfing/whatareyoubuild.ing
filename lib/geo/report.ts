// Orchestrates one full GEO report: fetch the page (+ robots/llms/sitemap),
// run on-page health, measure the AI footprint, and add coach commentary.
import 'server-only'
import { safeFetch } from './safe-fetch'
import { analyzeOnPage, textFromHtml, type PageDoc } from './onpage'
import { computeFootprint } from './metrics'
import { buildCommentary } from './commentary'
import type { GeoReport } from './types'

const METHOD =
  'On-page checks read your live HTML. The AI-footprint metrics are an approximation: we query three web-grounded AI engines (Perplexity, ChatGPT, and Gemini) with category-relevant prompts via OpenRouter — not a scrape of their live consumer interfaces, which can differ. New products usually start near zero; re-run over time to watch it climb.'

function safeOrigin(url: string): string | null {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

export async function generateReport(product: {
  id: string
  name: string
  tagline: string
  description: string | null
  link: string | null
}): Promise<GeoReport> {
  let page: PageDoc = {
    status: null,
    finalUrl: product.link || '',
    html: '',
    robotsTxt: null,
    llmsTxtExists: false,
    sitemapHint: false,
    noLink: !product.link,
  }
  let pageText: string | null = null

  if (product.link) {
    const origin = safeOrigin(product.link)
    const empty = { ok: false, status: null, finalUrl: '', html: '', error: 'skip' } as const
    const [main, robots, llms, sitemap] = await Promise.all([
      safeFetch(product.link),
      origin ? safeFetch(`${origin}/robots.txt`, { timeoutMs: 6000, maxBytes: 200_000 }) : Promise.resolve(empty),
      origin ? safeFetch(`${origin}/llms.txt`, { timeoutMs: 6000, maxBytes: 200_000 }) : Promise.resolve(empty),
      origin ? safeFetch(`${origin}/sitemap.xml`, { timeoutMs: 6000, maxBytes: 100_000 }) : Promise.resolve(empty),
    ])
    page = {
      status: main.status,
      finalUrl: main.finalUrl,
      html: main.html,
      robotsTxt: robots.ok ? robots.html : null,
      llmsTxtExists: llms.ok && llms.html.trim().length > 0,
      sitemapHint: (sitemap.ok && sitemap.html.includes('<')) || (robots.ok && /sitemap\s*:/i.test(robots.html)),
    }
    pageText = main.ok ? textFromHtml(main.html) : null
  }

  const health = analyzeOnPage(page)
  // Footprint can run from the product's own copy even when the live page is down.
  const footprint = await computeFootprint({
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    link: product.link,
    pageText,
  })
  const commentary = await buildCommentary({ name: product.name, tagline: product.tagline, health, footprint })

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    productId: product.id,
    link: product.link,
    health,
    footprint,
    commentary,
    method: METHOD,
  }
}
