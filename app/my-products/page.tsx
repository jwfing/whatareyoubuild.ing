import Link from 'next/link'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import MyProductRow from '@/components/MyProductRow'
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
              <MyProductRow key={p.id} product={p} />
            ))}
          </ol>
        )}
      </div>
    </main>
  )
}
