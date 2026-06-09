import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import VoteButton from '@/components/VoteButton'
import { getServerClient, type Product } from '@/lib/insforge'

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await getServerClient().database.from('products').select().eq('id', id).maybeSingle()
  return (data as Product) ?? null
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
  return (
    <main>
      <Header />
      <article className="mx-auto max-w-2xl px-5 py-6">
        <div className="rule flex gap-4 p-4">
          <Image src={p.image_url} alt="" width={160} height={120} className="h-[120px] w-[160px] object-cover" />
          <div className="flex-1">
            <h1 className="masthead text-3xl">{p.name}</h1>
            <p className="text-[var(--muted)]">{p.tagline}</p>
            {p.link && <a href={p.link} target="_blank" rel="noopener" className="mono mt-2 inline-block text-sm underline">Visit →</a>}
          </div>
          <VoteButton productId={p.id} initialCount={p.vote_count} />
        </div>
        {p.description && <div className="mt-4 whitespace-pre-wrap">{p.description}</div>}
      </article>
    </main>
  )
}
