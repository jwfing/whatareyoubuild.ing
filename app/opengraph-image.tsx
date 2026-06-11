import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Default share card for the site itself (homepage and any page without its own).
export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          background: '#f4f1ea',
          color: '#111',
          border: '14px solid #111',
          padding: 72,
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 2 }}>WHAT ARE YOU BUILDING</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 86, fontWeight: 800, lineHeight: 1.02 }}>See what builders are shipping.</div>
          <div style={{ fontSize: 34, color: '#555', marginTop: 20 }}>Post your product. Get upvoted. Get feedback.</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#666' }}>
          <span>whatareyoubuild.ing</span>
          <span>NEW / HOT</span>
        </div>
      </div>
    ),
    size,
  )
}
