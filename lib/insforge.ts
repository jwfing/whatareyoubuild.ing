import { createClient } from '@insforge/sdk'
import { createBrowserClient } from '@insforge/sdk/ssr'

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY

// Browser singleton (carries the signed-in user session via the
// browser-readable insforge_access_token cookie + /api/auth/refresh).
let browserClient: ReturnType<typeof createBrowserClient> | null = null
export function getBrowserClient() {
  if (!browserClient) browserClient = createBrowserClient()
  return browserClient
}

// Fresh stateless anon client for server components / route handlers
// (PUBLIC reads via RLS: feed/detail/OG — no user session needed).
export function getServerClient() {
  return createClient({ baseUrl, anonKey })
}

export type Product = {
  id: string
  name: string
  tagline: string
  image_url: string
  image_key: string
  link: string | null
  description: string | null
  author_id: string
  vote_count: number
  created_at: string
  screenshots: Screenshot[]
}

export type Screenshot = { url: string; key: string }

// The single most-upvoted product (the "champion"), or null if nothing has a
// vote yet. Used to badge it across the feed and its detail page.
export async function getTopVotedProductId(): Promise<string | null> {
  try {
    const { data } = await getServerClient()
      .database.from('products')
      .select('id, vote_count')
      .order('vote_count', { ascending: false })
      .limit(1)
      .maybeSingle()
    const row = data as { id: string; vote_count: number } | null
    return row && row.vote_count > 0 ? row.id : null
  } catch {
    return null
  }
}
