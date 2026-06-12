import { describe, it, expect } from 'vitest'
import { analyzeOnPage, aiBotsBlocked, scoreItems, collectLdTypes, type PageDoc } from './onpage'

const base = (html: string, extra: Partial<PageDoc> = {}): PageDoc => ({
  status: 200,
  finalUrl: 'https://ex.com',
  html,
  robotsTxt: null,
  llmsTxtExists: false,
  sitemapHint: false,
  ...extra,
})

const goodHtml = `<!doctype html><html lang="en"><head>
<title>Acme — the fast widget builder</title>
<meta name="description" content="Acme helps indie builders ship widgets fast with a clean editor, ready-made templates, and one-click deploy to the web.">
<link rel="canonical" href="https://ex.com/">
<link rel="icon" href="/favicon.ico">
<meta property="og:title" content="Acme"><meta property="og:description" content="Build widgets"><meta property="og:image" content="https://ex.com/og.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{"@type":"SoftwareApplication","name":"Acme"}</script>
</head><body><h1>Acme builds widgets</h1>
<p>${'word '.repeat(200)}</p></body></html>`

describe('analyzeOnPage', () => {
  it('scores a well-formed page near perfect with no urgent items', () => {
    const r = analyzeOnPage(base(goodHtml, { llmsTxtExists: true, sitemapHint: true }))
    expect(r.capped).toBe(false)
    expect(r.items.filter((i) => i.status === 'urgent')).toHaveLength(0)
    expect(r.score).toBeGreaterThanOrEqual(90)
  })

  it('flags a JS-only shell: missing tags + no readable text', () => {
    const r = analyzeOnPage(base('<html><head></head><body><div id="root"></div></body></html>'))
    expect(r.items.find((i) => i.id === 'ssr')?.status).toBe('urgent')
    expect(r.items.find((i) => i.id === 'title')?.status).toBe('urgent')
    expect(r.score).toBeLessThan(40)
  })

  it('caps the score when the page is unreachable', () => {
    const r = analyzeOnPage(base('', { status: 503, html: '' }))
    expect(r.capped).toBe(true)
    expect(r.fetchOk).toBe(false)
    expect(r.capReason).toContain('503')
  })

  it('handles a product with no link distinctly', () => {
    const r = analyzeOnPage(base('', { status: null, noLink: true, finalUrl: '' }))
    expect(r.capped).toBe(true)
    expect(r.items[0].id).toBe('link')
  })

  it('treats multiple H1s as a recommendation, not a pass', () => {
    const r = analyzeOnPage(base(goodHtml.replace('<h1>Acme builds widgets</h1>', '<h1>One</h1><h1>Two</h1>')))
    expect(r.items.find((i) => i.id === 'h1')?.status).toBe('recommended')
  })
})

describe('collectLdTypes', () => {
  it('reads a bare object', () => {
    const out: string[] = []
    collectLdTypes({ '@type': 'SoftwareApplication' }, out)
    expect(out).toEqual(['SoftwareApplication'])
  })
  it('descends into @graph (the insforge.dev shape)', () => {
    const out: string[] = []
    collectLdTypes(
      { '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization' }, { '@type': 'WebSite' }, { '@type': 'SoftwareApplication' }] },
      out,
    )
    expect(out).toEqual(['Organization', 'WebSite', 'SoftwareApplication'])
  })
  it('handles a top-level array and array-valued @type', () => {
    const out: string[] = []
    collectLdTypes([{ '@type': 'Product' }, { '@type': ['WebPage', 'FAQPage'] }], out)
    expect(out).toEqual(['Product', 'WebPage', 'FAQPage'])
  })
})

describe('analyzeOnPage @graph JSON-LD', () => {
  it('counts @graph-wrapped structured data as present', () => {
    const html = `<html lang="en"><head><title>Acme widgets builder</title>
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"Acme"},{"@type":"WebSite"}]}</script>
</head><body><h1>Acme</h1><p>${'word '.repeat(150)}</p></body></html>`
    const r = analyzeOnPage({ status: 200, finalUrl: 'https://ex.com', html, robotsTxt: null, llmsTxtExists: false, sitemapHint: false })
    const jsonld = r.items.find((i) => i.id === 'jsonld')!
    expect(jsonld.status).toBe('done')
    expect(jsonld.detail).toContain('Organization')
    expect(jsonld.detail).toContain('WebSite')
  })
})

describe('aiBotsBlocked', () => {
  it('detects a specific AI bot fully blocked', () => {
    expect(aiBotsBlocked('User-agent: GPTBot\nDisallow: /')).toContain('GPTBot')
  })
  it('detects a wildcard block of all crawlers', () => {
    expect(aiBotsBlocked('User-agent: *\nDisallow: /')).toContain('all crawlers (*)')
  })
  it('returns empty when only sub-paths are disallowed', () => {
    expect(aiBotsBlocked('User-agent: *\nDisallow: /admin')).toEqual([])
  })
  it('ignores unrelated bots', () => {
    expect(aiBotsBlocked('User-agent: SomeRandomBot\nDisallow: /')).toEqual([])
  })
})

describe('scoreItems', () => {
  it('weights done=1, recommended=0.5, urgent=0', () => {
    const score = scoreItems([
      { id: 'a', label: '', status: 'done', detail: '', tip: '' },
      { id: 'b', label: '', status: 'recommended', detail: '', tip: '' },
      { id: 'c', label: '', status: 'urgent', detail: '', tip: '' },
      { id: 'd', label: '', status: 'done', detail: '', tip: '' },
    ])
    expect(score).toBe(63) // (1 + 0.5 + 0 + 1) / 4 = 0.625
  })
})
