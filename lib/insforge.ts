import { createClient } from '@insforge/sdk'

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY

// Browser singleton (carries the signed-in user session).
let browserClient: ReturnType<typeof createClient> | null = null
export function getBrowserClient() {
  if (!browserClient) browserClient = createClient({ baseUrl, anonKey })
  return browserClient
}

// Fresh stateless client for server components / route handlers (public reads via RLS).
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
}
