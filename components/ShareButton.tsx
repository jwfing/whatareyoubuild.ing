'use client'
import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/posthog'

export default function ShareButton({ productId, productName }: { productId: string; productName: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  const url = () => (typeof window !== 'undefined' ? window.location.href : '')

  function postToX() {
    track.shareClicked(productId)
    const text = `${productName} — building in public on What Are You Building`
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url())}`,
      '_blank',
      'noopener,noreferrer',
    )
    setOpen(false)
  }

  async function copyLink() {
    track.shareClicked(productId)
    try {
      await navigator.clipboard.writeText(url())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked — ignore */
    }
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rule mono px-3 py-1 text-xs transition-colors hover:bg-[var(--paper-2)]"
      >
        {copied ? 'Link copied ✓' : 'Share ↗'}
      </button>
      {open && (
        <div role="menu" className="rule absolute left-0 z-30 mt-1 w-40 bg-[var(--paper)]">
          <button
            role="menuitem"
            onClick={postToX}
            className="mono block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--paper-2)]"
          >
            Post to X 𝕏
          </button>
          <button
            role="menuitem"
            onClick={copyLink}
            className="mono block w-full border-t border-[var(--line)] px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--paper-2)]"
          >
            Copy link
          </button>
        </div>
      )}
    </div>
  )
}
