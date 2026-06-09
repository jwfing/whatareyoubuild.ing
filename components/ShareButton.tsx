'use client'
import { track } from '@/lib/posthog'

export default function ShareButton({ productId }: { productId: string }) {
  async function onShare() {
    track.shareClicked(productId)
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ url }) } catch {}
    } else {
      try { await navigator.clipboard.writeText(url) } catch {}
    }
  }
  return <button onClick={onShare} className="rule mono px-3 py-1 text-xs">Share ↗</button>
}
