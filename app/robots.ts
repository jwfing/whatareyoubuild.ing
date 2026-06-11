import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Allow everyone — including AI crawlers (GPTBot, ClaudeBot, PerplexityBot,
// Google-Extended) — so generative engines can read and cite the content.
// Only the app/auth surfaces (no public content) are disallowed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/signin', '/submit', '/profile', '/my-products'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
