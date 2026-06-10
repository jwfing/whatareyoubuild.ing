'use client'
import { useCallback, useEffect, useState } from 'react'
import type { Screenshot } from '@/lib/insforge'

// Responsive strip (stacked on mobile, horizontal scroll on desktop) with a
// click-to-zoom lightbox: full-screen view, keyboard + arrow navigation,
// Esc / backdrop / × to close.
export default function ScreenshotGallery({
  screenshots,
  productName,
}: {
  screenshots: Screenshot[]
  productName: string
}) {
  const [open, setOpen] = useState<number | null>(null)
  const count = screenshots?.length ?? 0

  const close = useCallback(() => setOpen(null), [])
  const go = useCallback(
    (delta: number) => setOpen((i) => (i === null ? i : (i + delta + count) % count)),
    [count],
  )

  useEffect(() => {
    if (open === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, close, go])

  if (!count) return null

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:overflow-x-auto sm:pb-3">
        {screenshots.map((s, i) => (
          <button
            key={s.key || i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`View ${productName} screenshot ${i + 1} larger`}
            className="block cursor-zoom-in sm:shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.url}
              alt={`${productName} screenshot ${i + 1}`}
              loading="lazy"
              className="rule mx-auto block max-h-[80vh] w-auto max-w-full sm:mx-0 sm:h-56 sm:max-h-none sm:max-w-none"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} screenshot ${open + 1} of ${count}`}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{ background: 'rgba(17,17,17,0.95)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshots[open].url}
            alt={`${productName} screenshot ${open + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[94vw] object-contain"
          />

          <button
            type="button"
            autoFocus
            onClick={close}
            aria-label="Close"
            className="rule mono absolute right-4 top-4 bg-[var(--paper)] px-2 py-1 text-sm"
          >
            × Close
          </button>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1) }}
                aria-label="Previous screenshot"
                className="rule mono absolute left-3 top-1/2 -translate-y-1/2 bg-[var(--paper)] px-2.5 py-3 sm:left-5"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1) }}
                aria-label="Next screenshot"
                className="rule mono absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--paper)] px-2.5 py-3 sm:right-5"
              >
                ▶
              </button>
              <span className="mono absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-[var(--paper)]">
                {open + 1} / {count}
              </span>
            </>
          )}
        </div>
      )}
    </>
  )
}
