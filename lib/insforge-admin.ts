import 'server-only'
import { createAdminClient } from '@insforge/sdk'

// Full-access admin client (project_admin) — server-only. Used by the
// notification route to look up recipient emails and send mail. The API key
// must never reach the browser.
export function getAdminClient() {
  return createAdminClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    apiKey: process.env.INSFORGE_API_KEY!,
  })
}

export function adminConfigured(): boolean {
  return !!process.env.INSFORGE_API_KEY
}
