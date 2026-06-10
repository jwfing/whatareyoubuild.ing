import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import VoteButton from '@/components/VoteButton'
import ShareButton from '@/components/ShareButton'
import PageView from '@/components/PageView'
import CommentsSection, { type CommentItem } from '@/components/CommentsSection'
import ScreenshotGallery from '@/components/ScreenshotGallery'
import { getServerClient, type Product } from '@/lib/insforge'
import { getServerUser } from '@/lib/auth-server'

function safeHttpUrl(raw: string | null): string | null {
  if (!raw) return null
  try {
    const u = new URL(raw)
    return (u.protocol === 'http:' || u.protocol === 'https:') ? u.toString() : null
  } catch {
    return null
  }
}

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await getServerClient().database.from('products').select().eq('id', id).maybeSingle()
  return (data as Product) ?? null
}

async function getComments(productId: string): Promise<CommentItem[]> {
  const insforge = getServerClient()
  const { data } = await insforge.database
    .from('comments').select().eq('product_id', productId).order('created_at', { ascending: false })
  const rows = (data ?? []) as { id: string; user_id: string; body: string; created_at: string }[]
  // Resolve display names from the trusted profile (never client-supplied).
  const uids = [...new Set(rows.map((r) => r.user_id))]
  const namePairs = await Promise.all(
    uids.map(async (uid) => {
      try {
        const { data: prof } = await insforge.auth.getProfile(uid)
        return [uid, (prof as { name?: string } | null)?.name || 'builder'] as const
      } catch {
        return [uid, 'builder'] as const
      }
    }),
  )
  const names = new Map(namePairs)
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: names.get(r.user_id) ?? 'builder',
    body: r.body,
    createdAt: r.created_at,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const p = await getProduct(id)
  if (!p) return { title: 'Not found' }
  return {
    title: `${p.name} — What Are You Building`,
    description: p.tagline,
    openGraph: { title: p.name, description: p.tagline },
    twitter: { card: 'summary_large_image', title: p.name, description: p.tagline },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await getProduct(id)
  if (!p) notFound()
  const safeLink = safeHttpUrl(p.link)
  const user = await getServerUser()
  const comments = await getComments(p.id)
  return (
    <main>
      <Header user={user} />
      <PageView productId={p.id} />
      <article className="mx-auto max-w-2xl px-5 pt-6">
        <div className="rule flex gap-4 p-4">
          <Image src={p.image_url} alt={p.name} width={160} height={120} className="h-[120px] w-[160px] object-cover" />
          <div className="flex-1">
            <h1 className="masthead text-3xl">{p.name}</h1>
            <p className="text-[var(--muted)]">{p.tagline}</p>
            {safeLink && <a href={safeLink} target="_blank" rel="noopener" className="mono mt-2 inline-block text-sm underline">Visit →</a>}
            <div className="mt-3 flex items-center gap-3">
              <ShareButton productId={p.id} />
              {user?.id === p.author_id && (
                <Link href={`/p/${p.id}/edit`} className="rule mono px-3 py-1 text-xs transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]">
                  Edit
                </Link>
              )}
            </div>
          </div>
          <VoteButton productId={p.id} initialCount={p.vote_count} userId={user?.id ?? null} />
        </div>
      </article>
      {p.screenshots.length > 0 && (
        <section className="mx-auto mt-6 max-w-5xl px-5" aria-label="Screenshots">
          <ScreenshotGallery screenshots={p.screenshots} productName={p.name} />
        </section>
      )}
      <article className="mx-auto max-w-2xl px-5 py-6">
        {p.description && <div className="whitespace-pre-wrap">{p.description}</div>}
        <CommentsSection
          productId={p.id}
          productAuthorId={p.author_id}
          userId={user?.id ?? null}
          currentUserName={user?.name ?? null}
          initial={comments}
        />
      </article>
    </main>
  )
}
