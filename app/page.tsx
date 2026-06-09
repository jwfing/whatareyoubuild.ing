import Header from '@/components/Header'
import Feed from '@/components/Feed'

export default async function Home({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams
  const s = sort === 'hot' ? 'hot' : 'new'
  return (
    <main>
      <Header />
      <Feed sort={s} />
    </main>
  )
}
