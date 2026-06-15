import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getServerUser } from '@/lib/auth-server'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Where to share what you’re building — an honest guide',
  description:
    'A practical, honest guide for indie hackers and vibe coders on where to share an in-progress or just-launched product: X build-in-public, Reddit (r/SideProject, r/indiehackers, r/SaaS), Indie Hackers, Hacker News Show HN, Product Hunt, BetaList, maker Discords, and What Are You Building — with real pros, cons, and effort for each.',
  alternates: { canonical: '/where-to-share-your-product' },
  openGraph: {
    type: 'article',
    title: 'Where to share what you’re building — an honest guide',
    description:
      'Honest pros, cons, and effort for the best places to show an in-progress or just-launched product and get real feedback.',
    url: '/where-to-share-your-product',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Where to share what you’re building — an honest guide',
  description:
    'A practical, honest guide to the best places to share an in-progress or just-launched product — X, Reddit, Indie Hackers, Hacker News, Product Hunt, BetaList, maker communities, and What Are You Building — with real pros, cons, and effort.',
  url: `${SITE_URL}/where-to-share-your-product`,
  about: 'Where indie hackers and vibe coders can share products and get feedback.',
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Where should I share a product that isn’t finished yet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For unfinished work, go where in-progress is welcome: build-in-public on X, r/SideProject, an Indie Hackers post, a maker Discord, or a lighter showcase like What Are You Building. Save Product Hunt and Show HN for when the thing is solid enough to take a wave of traffic.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many places should I post to at once?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pick two or three that fit your goal, not ten. One high-effort venue (Show HN or Product Hunt) plus one or two low-effort ones (X, r/SideProject, a showcase) is plenty. Spreading thin across every site gets you ignored everywhere.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I share without being spammy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lead with the work, not the link. Show a screenshot or a specific result, ask a real question, and follow each community’s rules — most subreddits and forums punish drive-by self-promotion. Be a regular before you ask for attention.',
      },
    },
  ],
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="masthead text-2xl">
        <span className="mono mr-2 text-[var(--muted)]">{n}.</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed">{children}</div>
    </section>
  )
}

export default async function WhereToShareYourProductPage() {
  const user = await getServerUser()
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header user={user} />

      <article className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="masthead text-3xl leading-tight text-balance sm:text-4xl">
          Where to share what you’re building
        </h1>
        <p className="mt-4 text-lg leading-relaxed">
          You shipped something — or you’re halfway there — and you want eyes and honest feedback. The good news:
          there are a dozen places that want to see indie work. The catch: each one has its own crowd, etiquette, and
          payoff. <b>Match the venue to your goal — feedback, traffic, or your first users — and post to two or three,
          not ten.</b> Here’s an honest rundown of where to share and what to expect.
        </p>

        <Section n={1} title="Pick the venue by what you actually want">
          <p>
            Before you post anywhere, name the goal. &ldquo;Get feedback on the flow&rdquo; sends you somewhere very
            different from &ldquo;get a spike of signups.&rdquo; Use this as a quick map, then read the sections below.
          </p>
          <div className="mono overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="hairline text-left text-[var(--muted)]">
                  <th className="py-2 pr-4 font-normal">Venue</th>
                  <th className="py-2 pr-4 font-normal">Best for</th>
                  <th className="py-2 font-normal">Effort</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">X (build-in-public)</td>
                  <td className="py-2 pr-4">ongoing audience, momentum</td>
                  <td className="py-2">low, but compounding</td>
                </tr>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">Reddit (niche subs)</td>
                  <td className="py-2 pr-4">blunt feedback, early users</td>
                  <td className="py-2">low–medium</td>
                </tr>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">Indie Hackers</td>
                  <td className="py-2 pr-4">peer advice, accountability</td>
                  <td className="py-2">medium</td>
                </tr>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">Hacker News (Show HN)</td>
                  <td className="py-2 pr-4">technical eyes, big spike</td>
                  <td className="py-2">high, one shot</td>
                </tr>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">Product Hunt</td>
                  <td className="py-2 pr-4">launch buzz, backlinks</td>
                  <td className="py-2">high, coordinated</td>
                </tr>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">BetaList</td>
                  <td className="py-2 pr-4">early-adopter signups</td>
                  <td className="py-2">low, slow queue</td>
                </tr>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">Maker Discords / Slacks</td>
                  <td className="py-2 pr-4">warm feedback, relationships</td>
                  <td className="py-2">medium, ongoing</td>
                </tr>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">What Are You Building</td>
                  <td className="py-2 pr-4">lightweight showcase, votes</td>
                  <td className="py-2">low</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section n={2} title="Build in public on X">
          <p>
            X is where the indie-hacker scene mostly lives. Posting progress — a screenshot, a metric, a problem you
            just solved — builds an audience over time that you can launch to later. <b>The payoff compounds, but it
            doesn’t arrive on day one.</b>
          </p>
          <p>
            <i>Pros:</i> low friction, real-time replies, and the people who care about indie products are already
            here. <i>Cons:</i> from a standing start it’s mostly shouting into the void — reach follows consistency and
            a network you have to build first. Reply to other builders, share specifics, and don’t just broadcast
            links.
          </p>
        </Section>

        <Section n={3} title="Post to the right Reddit communities">
          <p>
            Reddit gives you blunt, unfiltered feedback and early users — if you respect each subreddit’s rules.
            The most useful for makers:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li><b>r/SideProject</b> — the friendliest room for in-progress and just-shipped work.</li>
            <li><b>r/indiehackers</b> — fellow founders; good for the story behind the build.</li>
            <li><b>r/SaaS</b> — sharper, more business-minded; great for B2B tools and pricing talk.</li>
          </ul>
          <p>
            <i>Pros:</i> honest reactions, niche subs for almost any audience, durable (posts get found via search
            later). <i>Cons:</i> mods are strict, low-effort self-promo gets removed or downvoted fast, and you need a
            real account with history. Lead with a screenshot or a specific question, not a bare link.
          </p>
        </Section>

        <Section n={4} title="Use Indie Hackers and maker communities for peers">
          <p>
            Indie Hackers is a forum of people doing exactly what you’re doing. Posting a milestone, a numbers
            breakdown, or a &ldquo;here’s what I’d do differently&rdquo; gets thoughtful replies from peers rather than
            random traffic. The same goes for maker <b>Discords and Slacks</b> (WIP, indie-focused servers, and the
            communities around tools you use).
          </p>
          <p>
            <i>Pros:</i> high-quality advice, accountability, and relationships that pay off across multiple projects.
            <i>Cons:</i> smaller reach than the big public sites, and you have to show up regularly — <b>these reward
            being a participant, not a poster who drops in only to promote.</b>
          </p>
        </Section>

        <Section n={5} title="Save Hacker News and Product Hunt for real launches">
          <p>
            These are your big-spike venues — high effort, high variance, and best used once the product can survive a
            crowd.
          </p>
          <p>
            <b>Show HN</b> on Hacker News puts you in front of a sharp, technical audience. A front-page hit sends
            serious traffic and pointed feedback. <i>Cons:</i> the crowd is critical, timing and title matter a lot,
            and a flat launch sinks without trace. Submit something genuinely interesting, write a plain title, and be
            in the comments to answer.
          </p>
          <p>
            <b>Product Hunt</b> is a coordinated launch day: a polished gallery, a tagline, and ideally a rally of
            people ready to support you. A strong day brings buzz, backlinks, and signups. <i>Cons:</i> it’s
            effort-heavy, it favors makers with an existing following, and the traffic bump is often a spike, not a
            sustained channel. Prep assets in advance and don’t launch into a vacuum.
          </p>
        </Section>

        <Section n={6} title="Seed early adopters with BetaList and directories">
          <p>
            <b>BetaList</b> and similar startup directories put pre-launch and just-launched products in front of
            people who specifically like trying new things. Good for collecting early signups while you’re still
            building.
          </p>
          <p>
            <i>Pros:</i> targeted early-adopter audience, low effort to submit, and a backlink. <i>Cons:</i> queues can
            be slow, the bump is modest and one-time, and some directories charge to skip the line. Treat it as one
            seed among several, not a growth engine.
          </p>
        </Section>

        <Section n={7} title="Use a lightweight showcase like this one">
          <p>
            <Link href="/" className="underline">What Are You Building</Link> — that’s us — is a taste-forward,
            black-and-white showcase where builders post what they’re shipping and the community upvotes and comments.
            It’s deliberately lighter than a Product Hunt launch: no coordinated day, no rally required, just drop the
            thing and get seen. Posting also gets you a <Link href="/submit" className="underline">free GEO report</Link>{' '}
            that shows whether AI engines mention your product.
          </p>
          <p>
            <i>Pros:</i> low effort, in-progress work is welcome, upvotes and comments for feedback, and that GEO
            report. <i>Cons:</i> it’s a newer, smaller room than the giants above, so reach is more modest. <b>Think of
            it as one good option among several — best paired with X or Reddit, not a replacement for a real launch.</b>
          </p>
        </Section>

        <section className="mt-10">
          <h2 className="masthead text-2xl">FAQ</h2>
          <dl className="mt-3 space-y-4">
            <div>
              <dt className="font-bold">Where should I share a product that isn’t finished yet?</dt>
              <dd className="mt-1 leading-relaxed text-[var(--muted)]">
                Go where in-progress is welcome: build-in-public on X, r/SideProject, an Indie Hackers post, a maker
                Discord, or a lighter showcase like this one. Save Product Hunt and Show HN for when the product can
                take a wave of traffic.
              </dd>
            </div>
            <div>
              <dt className="font-bold">How many places should I post to at once?</dt>
              <dd className="mt-1 leading-relaxed text-[var(--muted)]">
                Two or three that fit your goal, not ten. One high-effort venue plus one or two low-effort ones is
                plenty — spreading thin across every site gets you ignored everywhere.
              </dd>
            </div>
            <div>
              <dt className="font-bold">How do I share without being spammy?</dt>
              <dd className="mt-1 leading-relaxed text-[var(--muted)]">
                Lead with the work, not the link. Show a screenshot or a concrete result, ask a real question, follow
                each community’s rules, and be a regular before you ask for attention.
              </dd>
            </div>
          </dl>
        </section>

        <div className="rule mt-12 px-6 py-8 text-center">
          <p className="masthead text-xl">Ready to put it somewhere?</p>
          <p className="mt-2 text-[var(--muted)]">Post your product, collect upvotes and comments, and get a free GEO report.</p>
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
