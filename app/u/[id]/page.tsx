import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductRow from '@/components/ProductRow'
import FollowButton from '@/components/FollowButton'
import { getServerClient, type Product } from '@/lib/insforge'
import { getServerUser } from '@/lib/auth-server'
import { SITE_URL } from '@/lib/site'

type ProfileInfo = { name: string; avatarUrl: string | null }

async function getProfileInfo(id: string): Promise<ProfileInfo | null> {
  try {
    const { data } = await getServerClient().auth.getProfile(id)
    if (!data) return null
    const p = (data.profile ?? {}) as { name?: string; avatar_url?: string }
    return { name: (p.name || '').trim() || 'A builder', avatarUrl: p.avatar_url || null }
  } catch {
    return null
  }
}

async function getProducts(id: string): Promise<Product[]> {
  const { data } = await getServerClient()
    .database.from('products')
    .select()
    .eq('author_id', id)
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: false })
  return (data ?? []) as Product[]
}

async function getFollowerCount(id: string): Promise<number> {
  try {
    const { data } = await getServerClient().database.from('follows').select('follower_id').eq('following_id', id).limit(5000)
    return data?.length ?? 0
  } catch {
    return 0
  }
}

async function viewerFollows(viewerId: string, id: string): Promise<boolean> {
  try {
    const { data } = await getServerClient()
      .database.from('follows')
      .select('follower_id')
      .eq('follower_id', viewerId)
      .eq('following_id', id)
      .maybeSingle()
    return !!data
  } catch {
    return false
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const info = await getProfileInfo(id)
  const name = info?.name ?? 'Builder'
  return {
    title: name,
    description: `${name}'s products on What Are You Building — what this builder is shipping.`,
    alternates: { canonical: `/u/${id}` },
    openGraph: { type: 'profile', title: name, description: `What ${name} is building.`, url: `/u/${id}` },
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const viewer = await getServerUser()
  const [info, products, followers, isFollowing] = await Promise.all([
    getProfileInfo(id),
    getProducts(id),
    getFollowerCount(id),
    viewer && viewer.id !== id ? viewerFollows(viewer.id, id) : Promise.resolve(false),
  ])
  if (!info && products.length === 0) notFound()

  const name = info?.name ?? 'A builder'
  const totalVotes = products.reduce((sum, p) => sum + (p.vote_count || 0), 0)
  const isYou = viewer?.id === id
  const canFollow = !!viewer && viewer.id !== id

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: `${SITE_URL}/u/${id}`,
    ...(info?.avatarUrl ? { image: info.avatarUrl } : {}),
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <Header user={viewer} />
      <div className="mx-auto max-w-2xl px-5 py-8">
        <div className="flex items-center gap-4">
          {info?.avatarUrl ? (
            <Image
              src={info.avatarUrl}
              alt=""
              width={72}
              height={72}
              className="rule h-[72px] w-[72px] shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="rule masthead flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[var(--paper-2)] text-3xl">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="masthead truncate text-3xl">{name}</h1>
            <p className="mono mt-1 text-xs text-[var(--muted)]">
              {products.length} {products.length === 1 ? 'product' : 'products'} · ▲ {totalVotes} total · {followers}{' '}
              {followers === 1 ? 'follower' : 'followers'}
              {isYou && (
                <>
                  {' · '}
                  <Link href="/profile" className="underline transition-colors hover:text-[var(--ink)]">
                    this is you · edit
                  </Link>
                </>
              )}
            </p>
          </div>
          {canFollow && <FollowButton profileId={id} initialFollowing={isFollowing} />}
        </div>

        {products.length === 0 ? (
          <p className="mt-10 text-[var(--muted)]">Nothing shipped yet.</p>
        ) : (
          <>
            <h2 className="mono mt-8 mb-1 text-xs tracking-[0.15em] text-[var(--muted)]">SHIPPED</h2>
            <ol>
              {products.map((p, i) => (
                <ProductRow key={p.id} p={p} rank={i + 1} userId={viewer?.id ?? null} index={i} />
              ))}
            </ol>
          </>
        )}
      </div>
      <Footer />
    </main>
  )
}
