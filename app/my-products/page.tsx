import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import { getServerClient, type Product } from '@/lib/insforge'
import { getServerUser } from '@/lib/auth-server'

export default async function MyProductsPage() {
  const user = await getServerUser()
  if (!user) redirect('/signin')

  const { data } = await getServerClient()
    .database.from('products')
    .select()
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
  const products = (data ?? []) as Product[]

  return (
    <main>
      <Header user={user} />
      <div className="mx-auto max-w-2xl px-5 py-6">
        <div className="flex items-baseline justify-between">
          <h1 className="masthead text-2xl">Your products</h1>
          <Link href="/submit" className="rule mono px-2 py-1 text-xs transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]">+ SUBMIT</Link>
        </div>

        {products.length === 0 ? (
          <div className="rule mt-6 px-6 py-14 text-center">
            <p className="masthead text-xl">Nothing posted yet.</p>
            <p className="mt-2 text-[var(--muted)]">Ship something and it’ll show up here.</p>
            <Link href="/submit" className="rule mono mt-5 inline-block px-4 py-2 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]">+ SUBMIT YOURS</Link>
          </div>
        ) : (
          <ol className="mt-4">
            {products.map((p) => (
              <li key={p.id} className="hairline flex items-center gap-4 px-2 py-3">
                <Image src={p.image_url} alt="" width={56} height={56} className="rule h-14 w-14 shrink-0 object-cover" />
                <div className="min-w-0 flex-1">
                  <b className="block truncate">{p.name}</b>
                  <span className="block truncate text-sm text-[var(--muted)]">{p.tagline}</span>
                </div>
                <span className="mono shrink-0 text-xs text-[var(--muted)]">▲ {p.vote_count}</span>
                <Link href={`/p/${p.id}`} className="mono shrink-0 text-xs underline">View</Link>
                <Link href={`/p/${p.id}/edit`} className="rule mono shrink-0 px-3 py-1 text-xs transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]">Edit</Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  )
}
