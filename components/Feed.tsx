import Link from 'next/link'
import Image from 'next/image'
import { getServerClient, type Product } from '@/lib/insforge'
import ProductRow from './ProductRow'
import VoteButton from './VoteButton'

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={`mono inline-flex min-h-[2.25rem] items-center border-b-2 px-1 text-sm transition-colors ${
        active ? 'border-[var(--ink)] font-bold' : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
      }`}
    >
      {children}
    </Link>
  )
}

export default async function Feed({ sort, userId }: { sort: 'new' | 'hot'; userId: string | null }) {
  const insforge = getServerClient()
  const { data, error } = await insforge.database.rpc('list_products', { p_sort: sort, p_limit: 30, p_offset: 0 })

  if (error) {
    console.error('list_products failed', error)
    return <p className="mono p-8 text-[var(--muted)]">Couldn’t load the feed. Try again.</p>
  }

  const products = (data ?? []) as Product[]

  return (
    <div className="feed-fade mx-auto max-w-2xl px-5 py-5">
      <nav className="mb-6 flex gap-5" aria-label="Sort the feed">
        <Tab href="/?sort=new" active={sort === 'new'}>NEW</Tab>
        <Tab href="/?sort=hot" active={sort === 'hot'}>HOT</Tab>
      </nav>

      {products.length === 0 ? (
        <div className="rule px-6 py-16 text-center">
          <p className="masthead text-2xl">Nothing here yet.</p>
          <p className="mt-2 text-[var(--muted)]">Be the first to ship — post what you’re building.</p>
          <Link href="/submit" className="rule mono mt-5 inline-block px-4 py-2 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]">+ SUBMIT YOURS</Link>
        </div>
      ) : (
        <FeedBody products={products} userId={userId} />
      )}
    </div>
  )
}

function FeedBody({ products, userId }: { products: Product[]; userId: string | null }) {
  const [featured, ...rest] = products
  return (
    <>
      {/* Today's top — a modestly distinguished lead, not a hero. Same row
          shape as everyone else, a touch larger + a quiet kicker. The point is
          to nod at #1, not to bury the rest. */}
      <ol>
        <li className="feed-row feed-rise hairline relative mb-1 flex items-center gap-4 px-2 py-3.5">
          <span className="mono w-6 shrink-0 text-right text-sm text-[var(--muted)]">1</span>
          <Image
            src={featured.image_url}
            alt=""
            width={80}
            height={80}
            priority
            className="feed-thumb rule h-20 w-20 shrink-0 object-cover"
          />
          <span className="min-w-0 flex-1">
            <span className="mono block text-[10px] tracking-[0.18em] text-[var(--muted)]">★ TODAY’S TOP</span>
            <b className="block truncate text-lg">{featured.name}</b>
            <span className="block truncate text-sm text-[var(--muted)]">{featured.tagline}</span>
          </span>
          <VoteButton productId={featured.id} initialCount={featured.vote_count} userId={userId} size="lg" />
          <Link href={`/p/${featured.id}`} aria-label={featured.name} className="absolute inset-0 z-0" />
        </li>

        {rest.map((p, i) => (
          <ProductRow key={p.id} p={p} rank={i + 2} userId={userId} index={i + 1} />
        ))}
      </ol>
    </>
  )
}
