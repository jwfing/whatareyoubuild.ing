import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getServerUser } from '@/lib/auth-server'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Lightweight Product Hunt alternatives for indie hackers',
  description:
    'An honest rundown of lighter places to launch and showcase a product when Product Hunt feels too heavy or competitive: Indie Hackers, Show HN, Reddit, BetaList, Peerlist, Uneed, Tiny Launch, Microlaunch, and What Are You Building — with real pros and cons.',
  alternates: { canonical: '/product-hunt-alternatives' },
  openGraph: {
    type: 'article',
    title: 'Lightweight Product Hunt alternatives for indie hackers',
    description: 'Where else to launch or showcase your product when Product Hunt feels too heavy — honest pros and cons.',
    url: '/product-hunt-alternatives',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Lightweight Product Hunt alternatives for indie hackers',
  description:
    'An honest comparison of lighter Product Hunt alternatives — Indie Hackers, Show HN, Reddit, BetaList, Peerlist, Uneed, Tiny Launch, Microlaunch, and What Are You Building — with pros, cons, and when Product Hunt is still the right call.',
  url: `${SITE_URL}/product-hunt-alternatives`,
  about: 'Product launch platforms and showcase sites for indie hackers and indie founders.',
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Product Hunt still worth it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, when you want a big spike of visibility on one day, have a polished product and an audience to rally, and can put real effort into the launch. For a small side project or an early build, that machinery is often more pressure than payoff — a lighter platform fits better.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I post to more than one platform?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, and most indie hackers do. The cultures differ, so tailor each post — a Show HN comment, an Indie Hackers build story, a clean screenshot on a showcase site — rather than pasting the same blurb everywhere.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which alternative needs the least effort?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Showcase-style sites like What Are You Building, Uneed, or Microlaunch ask the least: a name, an image, a line, a link. There is no launch day to orchestrate and no campaign to run — you post and the community reacts.',
      },
    },
  ],
}

export default async function ProductHuntAlternativesPage() {
  const user = await getServerUser()
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header user={user} />

      <article className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="masthead text-3xl leading-tight text-balance sm:text-4xl">Lightweight Product Hunt alternatives</h1>
        <p className="mt-4 text-lg leading-relaxed">
          Product Hunt is still the biggest launchpad in indie tech — but it&apos;s heavy. A single launch day, a crowd
          to rally, a top-five scramble, and a product polished enough to survive the spotlight. When that feels like too
          much for a side project, an early build, or a quiet relaunch, there are plenty of lighter places to get your
          work seen. Here&apos;s an honest rundown of the real options, what each is good for, and when Product Hunt is
          still the right call.
        </p>

        <h2 className="masthead mt-10 text-2xl">Why look beyond Product Hunt?</h2>
        <p className="mt-3 leading-relaxed">
          Nothing is wrong with Product Hunt — it&apos;s great at what it does. But it rewards a particular kind of
          launch: <b>big, coordinated, once</b>. If your product is half-built, niche, or just not ready for a day of
          scrutiny, the machinery works against you. Lighter platforms trade the traffic spike for less pressure: post
          when you want, get feedback instead of a leaderboard, and skip the campaign. Many builders use a few in
          parallel — a showcase for eyes, a community for conversation, a launch site for the spike when it&apos;s
          actually warranted.
        </p>

        <div className="mono mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="hairline text-left text-[var(--muted)]">
                <th className="py-2 pr-4 font-normal">Platform</th>
                <th className="py-2 pr-4 font-normal">Best for</th>
                <th className="py-2 font-normal">Vibe / effort</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hairline align-top">
                <td className="py-2 pr-4">Indie Hackers</td>
                <td className="py-2 pr-4">build-in-public, revenue stories</td>
                <td className="py-2">conversation, low effort</td>
              </tr>
              <tr className="hairline align-top">
                <td className="py-2 pr-4">Hacker News (Show HN)</td>
                <td className="py-2 pr-4">technical products, blunt feedback</td>
                <td className="py-2">high-signal, unforgiving</td>
              </tr>
              <tr className="hairline align-top">
                <td className="py-2 pr-4">Reddit (niche subs)</td>
                <td className="py-2 pr-4">reaching a specific audience</td>
                <td className="py-2">community-first, no selling</td>
              </tr>
              <tr className="hairline align-top">
                <td className="py-2 pr-4">BetaList</td>
                <td className="py-2 pr-4">pre-launch, early signups</td>
                <td className="py-2">curated, slow queue</td>
              </tr>
              <tr className="hairline align-top">
                <td className="py-2 pr-4">Peerlist</td>
                <td className="py-2 pr-4">makers with a portfolio</td>
                <td className="py-2">professional, profile-led</td>
              </tr>
              <tr className="hairline align-top">
                <td className="py-2 pr-4">Uneed</td>
                <td className="py-2 pr-4">daily launch with less crowd</td>
                <td className="py-2">light launch, friendly</td>
              </tr>
              <tr className="hairline align-top">
                <td className="py-2 pr-4">Tiny Launch / TinyStartups</td>
                <td className="py-2 pr-4">small launches, indie crowd</td>
                <td className="py-2">low-stakes, fast</td>
              </tr>
              <tr className="hairline align-top">
                <td className="py-2 pr-4">Microlaunch</td>
                <td className="py-2 pr-4">micro-SaaS, simple listing</td>
                <td className="py-2">minimal, quiet</td>
              </tr>
              <tr className="hairline align-top">
                <td className="py-2 pr-4">What Are You Building</td>
                <td className="py-2 pr-4">taste-forward showcase, no launch day</td>
                <td className="py-2">no pressure, post anytime</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="masthead mt-10 text-2xl">The community options: Indie Hackers, Show HN, Reddit</h2>
        <p className="mt-3 leading-relaxed">
          <b>Indie Hackers</b> is the natural home for build-in-public. It rewards a story — what you made, what you
          learned, what it earns — more than a slick listing, and the audience is fellow founders who&apos;ll actually
          reply. The trade-off: it&apos;s a conversation, not a traffic firehose, so don&apos;t expect a signup spike.
        </p>
        <p className="mt-3 leading-relaxed">
          <b>Hacker News (Show HN)</b> can send serious, high-quality traffic — if your product is technical and your
          post is honest and concise. Be warned: the feedback is blunt and the front page is a lottery. It&apos;s the
          best place to learn whether engineers respect what you built, and a rough place to discover they don&apos;t.
        </p>
        <p className="mt-3 leading-relaxed">
          <b>Reddit</b> works when you find the right niche subreddit and genuinely participate. A relevant post in
          r/SideProject or a community built around your problem space can outperform a generic launch — but the
          self-promotion rules are real, and a drive-by plug gets removed fast. Show up as a member first.
        </p>

        <h2 className="masthead mt-10 text-2xl">The launch-lite sites: BetaList, Peerlist, Uneed, Tiny Launch, Microlaunch</h2>
        <p className="mt-3 leading-relaxed">
          <b>BetaList</b> targets the pre-launch moment — it&apos;s built to collect early signups for products that
          aren&apos;t public yet. The curation keeps quality up, but the queue can be slow and paid options exist to skip
          it. <b>Peerlist</b> leans professional: a maker profile, a portfolio, and a launch surface aimed at people who
          want their work tied to a credible identity.
        </p>
        <p className="mt-3 leading-relaxed">
          <b>Uneed</b>, <b>Tiny Launch</b> / <b>TinyStartups</b>, and <b>Microlaunch</b> are spiritual cousins:
          Product-Hunt-shaped daily or rolling launches with a fraction of the crowd and a fraction of the pressure.
          You&apos;ll get less raw traffic than a top PH launch, but a far gentler bar to clear — ideal for micro-SaaS
          and small tools that don&apos;t need a coordinated campaign to be worth showing.
        </p>

        <h2 className="masthead mt-10 text-2xl">Where we fit: What Are You Building</h2>
        <p className="mt-3 leading-relaxed">
          To be upfront — this is us, and we&apos;re one option among several, not a replacement for everything above.{' '}
          <b>What Are You Building</b> is a taste-forward showcase with <b>no launch day and no pressure</b>: post a
          name, an image, and one honest line whenever you like, and the community upvotes and comments. The HOT feed is
          time-decayed so fresh work surfaces and nobody squats the top, and every post comes with a{' '}
          <Link href="/submit" className="underline">free GEO report</Link> — a quick read on whether AI search engines
          mention your product. If you want a clean, low-stakes place to keep showing what you&apos;re shipping, it&apos;s
          a good fit. If you want a one-day traffic spike, that&apos;s not what this is.
        </p>

        <h2 className="masthead mt-10 text-2xl">When Product Hunt is still the right call</h2>
        <p className="mt-3 leading-relaxed">
          Don&apos;t write off Product Hunt. When you have a <b>polished, ready product</b>, an audience you can mobilize
          on launch day, and the appetite to run a real campaign, nothing else delivers the same concentrated burst of
          eyes, press attention, and backlinks. The lightweight options here are better for the in-between — the early,
          the niche, the quiet relaunch — not a substitute for a flagship launch you&apos;ve earned.
        </p>

        <h2 className="masthead mt-10 text-2xl">FAQ</h2>
        <dl className="mt-3 space-y-4">
          <div>
            <dt className="font-bold">Is Product Hunt still worth it?</dt>
            <dd className="mt-1 leading-relaxed text-[var(--muted)]">
              Yes — when you want a big one-day spike, have a polished product and an audience to rally, and can put real
              effort in. For a small side project or early build, that machinery is often more pressure than payoff, and
              a lighter platform fits better.
            </dd>
          </div>
          <div>
            <dt className="font-bold">Can I post to more than one platform?</dt>
            <dd className="mt-1 leading-relaxed text-[var(--muted)]">
              Yes, and most indie hackers do. The cultures differ, so tailor each post — a Show HN comment, an Indie
              Hackers build story, a clean screenshot on a showcase — rather than pasting the same blurb everywhere.
            </dd>
          </div>
          <div>
            <dt className="font-bold">Which alternative needs the least effort?</dt>
            <dd className="mt-1 leading-relaxed text-[var(--muted)]">
              Showcase-style sites like <Link href="/submit" className="underline">What Are You Building</Link>, Uneed,
              or Microlaunch ask the least: a name, an image, a line, a link. No launch day to orchestrate — you post and
              the community reacts.
            </dd>
          </div>
        </dl>

        <div className="rule mt-12 px-6 py-8 text-center">
          <p className="masthead text-xl">Want a lighter place to show your work?</p>
          <p className="mt-2 text-[var(--muted)]">Post your product, get honest feedback, and a free GEO report — no launch day required.</p>
          <Link
            href="/submit"
            className="rule mono mt-5 inline-block px-4 py-2 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          >
            + POST YOUR PRODUCT
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  )
}
