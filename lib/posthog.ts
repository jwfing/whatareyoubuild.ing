import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key || posthog.__loaded) return
  posthog.init(key, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST, capture_pageview: true })
}

// The funnel events from the spec. One place, typed, so names never drift.
export const track = {
  productPageViewed: (productId: string) => posthog.capture('product_page_viewed', { productId }),
  signupCompleted: (provider: string) => posthog.capture('signup_completed', { provider }),
  productSubmitted: (productId: string) => posthog.capture('product_submitted', { productId }),
  voteCast: (productId: string) => posthog.capture('vote_cast', { productId }),
  shareClicked: (productId: string) => posthog.capture('share_clicked', { productId }),
}
