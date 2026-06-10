import Header from '@/components/Header'
import Feed from '@/components/Feed'
import ErrorBanner from '@/components/ErrorBanner'
import { getServerUser } from '@/lib/auth-server'

export default async function Home({ searchParams }: { searchParams: Promise<{ sort?: string; error?: string }> }) {
  const { sort, error } = await searchParams
  const s = sort === 'hot' ? 'hot' : 'new'
  const user = await getServerUser()
  return (
    <main>
      <Header user={user} />
      {error ? <ErrorBanner code={error} /> : null}
      <Feed sort={s} userId={user?.id ?? null} />
    </main>
  )
}
