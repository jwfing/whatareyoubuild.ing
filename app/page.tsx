import Header from '@/components/Header'
import Feed from '@/components/Feed'
import ErrorBanner from '@/components/ErrorBanner'

export default async function Home({ searchParams }: { searchParams: Promise<{ sort?: string; error?: string }> }) {
  const { sort, error } = await searchParams
  const s = sort === 'hot' ? 'hot' : 'new'
  return (
    <main>
      <Header />
      {error ? <ErrorBanner code={error} /> : null}
      <Feed sort={s} />
    </main>
  )
}
