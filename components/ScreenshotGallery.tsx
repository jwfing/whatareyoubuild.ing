import type { Screenshot } from '@/lib/insforge'

// Responsive gallery: stacked full-width on mobile, a fixed-height horizontal
// scroll strip (~3 visible) on desktop. Natural aspect ratios, no cropping, so
// the real UI is fully visible. Plain <img> because screenshot dimensions vary.
export default function ScreenshotGallery({
  screenshots,
  productName,
}: {
  screenshots: Screenshot[]
  productName: string
}) {
  if (!screenshots?.length) return null
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:overflow-x-auto sm:pb-3">
      {screenshots.map((s, i) => (
        <div key={s.key || i} className="sm:shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.url}
            alt={`${productName} screenshot ${i + 1}`}
            loading="lazy"
            className="rule mx-auto block max-h-[80vh] w-auto max-w-full sm:mx-0 sm:h-56 sm:max-h-none sm:max-w-none"
          />
        </div>
      ))}
    </div>
  )
}
