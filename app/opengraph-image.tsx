import { ImageResponse } from 'next/og'
import { getServerClient, type Product } from '@/lib/insforge'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const PAPER = '#f4f1ea'
const INK = '#111'
const MUTED = '#555'

// Magazine-cover share card for the homepage: the top-voted product as the
// cover story, with the next few as cover lines.
export default async function OG() {
  let products: Product[] = []
  try {
    const { data } = await getServerClient()
      .database.from('products')
      .select('id, name, tagline, image_url, vote_count')
      .order('vote_count', { ascending: false })
      .limit(5)
    products = (data ?? []) as Product[]
  } catch {
    products = []
  }

  const [featured, ...rest] = products

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: PAPER,
          color: INK,
          border: `14px solid ${INK}`,
          fontFamily: 'serif',
        }}
      >
        {/* Masthead */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            borderBottom: `6px solid ${INK}`,
            padding: '28px 48px',
          }}
        >
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>WHAT ARE YOU BUILDING</div>
          <div style={{ fontSize: 20, color: MUTED, letterSpacing: 3 }}>THE BUILDERS&apos; SHOWCASE</div>
        </div>

        {/* Cover story */}
        <div style={{ display: 'flex', flex: 1, padding: 48, gap: 40 }}>
          {featured?.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featured.image_url}
              width={300}
              height={300}
              alt=""
              style={{ width: 300, height: 300, objectFit: 'cover', background: '#000', border: `4px solid ${INK}` }}
            />
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, color: MUTED, letterSpacing: 3 }}>
              {featured
                ? `TOP VOTED  /  ${featured.vote_count} ${featured.vote_count === 1 ? 'VOTE' : 'VOTES'}`
                : 'A SHOWCASE OF WHAT BUILDERS SHIP'}
            </div>
            <div style={{ fontSize: featured ? 78 : 70, fontWeight: 800, lineHeight: 1, marginTop: 10 }}>
              {featured ? featured.name : 'See what builders are shipping.'}
            </div>
            <div style={{ fontSize: 32, color: MUTED, marginTop: 18 }}>
              {featured ? featured.tagline : 'Post your product. Get upvoted. Get feedback.'}
            </div>
          </div>
        </div>

        {/* Cover lines + footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `6px solid ${INK}`,
            padding: '24px 48px',
            fontSize: 24,
          }}
        >
          <div style={{ display: 'flex', color: INK }}>
            {rest.length > 0 ? `ALSO SHIPPING:  ${rest.map((p) => p.name).join('   /   ')}` : 'whatareyoubuild.ing'}
          </div>
          {rest.length > 0 ? <div style={{ display: 'flex', color: MUTED }}>whatareyoubuild.ing</div> : null}
        </div>
      </div>
    ),
    size,
  )
}
