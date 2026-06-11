import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServerClient } from '@/lib/insforge'
import { generateReport } from '@/lib/geo/report'

// Node runtime (cheerio + node:dns) and a generous budget for the AI probes.
export const runtime = 'nodejs'
export const maxDuration = 60

type ProductRow = {
  id: string
  name: string
  tagline: string
  description: string | null
  link: string | null
  author_id: string
}

export async function POST(req: Request) {
  const token = (await cookies()).get('insforge_access_token')?.value
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Resolve the caller server-side (same path as getServerUser).
  let userId: string | null = null
  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_INSFORGE_URL}/api/auth/sessions/current`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (r.ok) {
      const b = (await r.json()) as { user?: { id?: string }; id?: string }
      userId = b.user?.id ?? b.id ?? null
    }
  } catch {
    /* fall through to 401 */
  }
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { productId?: string }
  const productId = String(body?.productId || '')
  if (!productId) return NextResponse.json({ error: 'missing productId' }, { status: 400 })

  // Verify ownership BEFORE spending any fetch/AI budget. The URL we analyze is
  // the product's stored link, never a client-supplied one — no open proxy.
  const { data } = await getServerClient().database.from('products').select().eq('id', productId).maybeSingle()
  const p = data as ProductRow | null
  if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (p.author_id !== userId) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  try {
    const report = await generateReport({
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      link: p.link,
    })
    return NextResponse.json({
      report,
      healthScore: report.health.score,
      footprintScore: report.footprint.score,
    })
  } catch (e) {
    const message = (e as { message?: string })?.message || 'GEO check failed'
    return NextResponse.json({ error: 'check_failed', message }, { status: 500 })
  }
}
