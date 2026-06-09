import Link from 'next/link'
import Image from 'next/image'
import { getServerClient, type Product } from '@/lib/insforge'
import ProductRow from './ProductRow'

export default async function Feed({ sort }: { sort: 'new' | 'hot' }) {
  const insforge = getServerClient()
  const { data } = await insforge.database.rpc('list_products', { p_sort: sort, p_limit: 30, p_offset: 0 })
  const products = (data ?? []) as Product[]

  if (products.length === 0) {
    return <p className="mono p-8 text-[var(--muted)]">Nothing here yet. Be the first to ship.</p>
  }
  const [featured, ...rest] = products
  return (
    <div className="mx-auto max-w-2xl px-5 py-4">
      <nav className="mono mb-4 text-xs">
        <Link href="/?sort=new" className={sort === 'new' ? 'font-bold' : 'text-[var(--muted)]'}>NEW</Link>
        {' · '}
        <Link href="/?sort=hot" className={sort === 'hot' ? 'font-bold' : 'text-[var(--muted)]'}>HOT</Link>
      </nav>

      <Link href={`/p/${featured.id}`} className="rule mb-4 flex gap-4 p-4">
        <Image src={featured.image_url} alt="" width={120} height={90} className="h-[90px] w-[120px] object-cover" />
        <span className="flex-1">
          <span className="mono block text-[10px] tracking-widest">★ TODAY&apos;S TOP</span>
          <span className="masthead block text-2xl">{featured.name}</span>
          <span className="block text-sm text-[var(--muted)]">{featured.tagline}</span>
        </span>
        <span className="rule mono self-center px-2.5 py-1.5 text-center">▲<br /><b>{featured.vote_count}</b></span>
      </Link>

      {rest.map((p, i) => <ProductRow key={p.id} p={p} rank={i + 2} />)}
    </div>
  )
}
