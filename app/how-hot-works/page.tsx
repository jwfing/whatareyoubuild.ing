import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getServerUser } from '@/lib/auth-server'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'How HOT is calculated',
  description:
    'The HOT feed ranks products by a time-decay score: votes divided by (hours since posted + 2) raised to 1.8. Fresh work surfaces, older work drifts down, and nobody squats the top. Here is the exact formula with worked examples.',
  alternates: { canonical: '/how-hot-works' },
  openGraph: { type: 'article', title: 'How HOT is calculated — What Are You Building', url: '/how-hot-works' },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'How HOT is calculated',
  description:
    'The HOT feed ranks products by a time-decay score: votes divided by (hours since posted + 2)^1.8.',
  url: `${SITE_URL}/how-hot-works`,
  about: 'Ranking algorithm for the HOT feed on What Are You Building.',
}

export default async function HowHotWorksPage() {
  const user = await getServerUser()
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <Header user={user} />

      <article className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="masthead text-3xl leading-tight text-balance sm:text-4xl">How HOT is calculated</h1>
        <p className="mt-4 text-lg leading-relaxed">
          There are two feeds. <b>NEW</b> is simply newest-first. <b>HOT</b> balances how many upvotes a product has
          against how long it has been up — so fresh work can surface, and yesterday&apos;s hits gradually settle down
          instead of squatting the top forever.
        </p>

        <h2 className="masthead mt-10 text-2xl">The formula</h2>
        <p className="mt-3 leading-relaxed">Every product gets a score, and HOT sorts by it, highest first:</p>
        <div className="rule mono mt-4 px-4 py-4 text-center text-base sm:text-lg">
          score = votes ÷ (hours_since_posted + 2)<sup>1.8</sup>
        </div>

        <h2 className="masthead mt-10 text-2xl">What each part does</h2>
        <ul className="mt-3 space-y-2 leading-relaxed">
          <li><b>votes</b> — total upvotes (one per signed-in person).</li>
          <li><b>hours since posted</b> — as a product ages, the denominator grows, so its score falls even if the votes don&apos;t change. That&apos;s the &ldquo;decay.&rdquo;</li>
          <li><b>the 1.8 exponent (&ldquo;gravity&rdquo;)</b> — how fast things sink. Higher gravity makes older products drop away faster.</li>
          <li><b>the +2</b> — softens the very first hours, so a single early vote can&apos;t rocket a brand-new post straight to #1 (and it avoids dividing by near-zero).</li>
        </ul>

        <h2 className="masthead mt-10 text-2xl">A worked example</h2>
        <p className="mt-3 leading-relaxed">Three products, ranked by HOT right now:</p>
        <div className="mono mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="hairline text-left text-[var(--muted)]">
                <th className="py-2 pr-4 font-normal">Product</th>
                <th className="py-2 pr-4 font-normal">Votes</th>
                <th className="py-2 pr-4 font-normal">Age</th>
                <th className="py-2 font-normal">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hairline"><td className="py-2 pr-4">B</td><td className="py-2 pr-4">6</td><td className="py-2 pr-4">2 hours</td><td className="py-2"><b>≈ 0.50</b></td></tr>
              <tr className="hairline"><td className="py-2 pr-4">C</td><td className="py-2 pr-4">1</td><td className="py-2 pr-4">just posted</td><td className="py-2">≈ 0.29</td></tr>
              <tr className="hairline"><td className="py-2 pr-4">A</td><td className="py-2 pr-4">50</td><td className="py-2 pr-4">2 days</td><td className="py-2">≈ 0.04</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 leading-relaxed">
          Notice that <b>B</b> — two hours old with just six votes — outranks <b>A</b>, which has fifty votes but is two
          days old. Fifty votes spread over two days can&apos;t out-pull a burst of fresh momentum. That&apos;s the
          point: HOT rewards what&apos;s catching on <i>now</i>.
        </p>

        <h2 className="masthead mt-10 text-2xl">Why it&apos;s built this way</h2>
        <ul className="mt-3 space-y-2 leading-relaxed">
          <li><b>Fresh work gets a real shot.</b> A new product doesn&apos;t need to out-vote everything that came before — it just needs momentum in its first hours.</li>
          <li><b>The top rotates.</b> Decay means no product can sit at #1 indefinitely; the feed stays worth checking.</li>
          <li><b>It resists gaming.</b> Votes are sign-in-gated, one per person, and the count is enforced on the server — so the score is hard to inflate.</li>
        </ul>

        <p className="mt-8 leading-relaxed text-[var(--muted)]">
          Prefer raw recency? The <Link href="/?sort=new" className="underline">NEW</Link> feed is strict newest-first. Or
          jump to <Link href="/?sort=hot" className="underline">HOT</Link>.
        </p>
      </article>

      <Footer />
    </main>
  )
}
