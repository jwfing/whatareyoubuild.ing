import { ImageResponse } from 'next/og'
import { getServerClient, type Product } from '@/lib/insforge'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data } = await getServerClient().database.from('products').select().eq('id', id).maybeSingle()
  const p = data as Product | null
  const name = p?.name ?? 'What Are You Building'
  const tagline = p?.tagline ?? 'A showcase of what vibe coders are building'
  const votes = p?.vote_count ?? 0
  const image = p?.image_url ?? null

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#f4f1ea', color: '#111', border: '12px solid #111', fontFamily: 'serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1.2, padding: 56, borderRight: '12px solid #111' }}>
          <div style={{ fontSize: 22, letterSpacing: 2 }}>WHAT ARE YOU BUILDING</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 24, color: '#666', letterSpacing: 3 }}>FEATURED</div>
            <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1, marginTop: 8 }}>{name}</div>
            <div style={{ fontSize: 32, color: '#555', marginTop: 16 }}>{tagline}</div>
          </div>
          <div style={{ fontSize: 22, color: '#666' }}>whatareyoubuilding</div>
        </div>
        <div style={{ display: 'flex', flex: 0.8, background: '#111', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} width={480} height={630} style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', opacity: 0.85 }} alt="" />
          ) : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 40, padding: '16px 28px', border: '4px solid #f4f1ea', color: '#f4f1ea', fontSize: 40, zIndex: 1 }}>
            <div style={{ display: 'flex', width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderBottom: '26px solid #f4f1ea' }} />
            <div style={{ display: 'flex' }}>{votes}</div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
