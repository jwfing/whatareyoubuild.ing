import Header from '@/components/Header'
import Feed from '@/components/Feed'
import ErrorBanner from '@/components/ErrorBanner'
import Footer from '@/components/Footer'
import { getServerUser } from '@/lib/auth-server'
import { SITE_NAME, SITE_URL, SITE_TAGLINE } from '@/lib/site'

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_TAGLINE,
}

export default async function Home({ searchParams }: { searchParams: Promise<{ sort?: string; error?: string }> }) {
  const { sort, error } = await searchParams
  const s = sort === 'hot' ? 'hot' : 'new'
  const user = await getServerUser()
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <h1 className="sr-only">{SITE_NAME} — a showcase of what builders are shipping</h1>
      <Header user={user} />
      {error ? <ErrorBanner code={error} /> : null}
      <Feed sort={s} userId={user?.id ?? null} />
      <Footer />
    </main>
  )
}
