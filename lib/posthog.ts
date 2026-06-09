import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key || posthog.__loaded) return
  posthog.init(key, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST, capture_pageview: true })
}

function capture(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !posthog.__loaded) return
  posthog.capture(event, props)
}

// The funnel events from the spec. One place, typed, so names never drift.
export const track = {
  productPageViewed: (productId: string) => capture('product_page_viewed', { productId }),
  signupCompleted: (provider: string) => capture('signup_completed', { provider }),
  productSubmitted: (productId: string) => capture('product_submitted', { productId }),
  voteCast: (productId: string) => capture('vote_cast', { productId }),
  shareClicked: (productId: string) => capture('share_clicked', { productId }),
}
