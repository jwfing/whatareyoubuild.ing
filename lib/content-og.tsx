import { ImageResponse } from 'next/og'

// Shared editorial OG card for content pages (about, guides, changelog).
// ASCII-only text so Satori never needs to fetch a glyph font.
export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

const PAPER = '#f4f1ea'
const INK = '#111'
const MUTED = '#555'

export function contentOg(kicker: string, title: string) {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          background: PAPER,
          color: INK,
          border: `14px solid ${INK}`,
          padding: 72,
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 2 }}>WHAT ARE YOU BUILDING</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 24, color: MUTED, letterSpacing: 4 }}>{kicker}</div>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.06, marginTop: 14 }}>{title}</div>
        </div>
        <div style={{ fontSize: 24, color: MUTED }}>whatareyoubuild.ing</div>
      </div>
    ),
    ogSize,
  )
}
