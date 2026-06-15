import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getServerUser } from '@/lib/auth-server'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'How to show up in AI search — a GEO playbook',
  description:
    'A practical playbook for generative engine optimization (GEO): the SEO fundamentals, conversational-query content, AI-friendly structure, E-E-A-T, freshness, structured data, and off-site citations that get your product surfaced and cited by ChatGPT, Perplexity, and Google AI answers.',
  alternates: { canonical: '/geo-guide' },
  openGraph: {
    type: 'article',
    title: 'How to show up in AI search — a GEO playbook',
    description: 'The fundamentals that get your product surfaced and cited by ChatGPT, Perplexity, and Google AI.',
    url: '/geo-guide',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'How to show up in AI search — a GEO playbook',
  description:
    'A practical playbook for generative engine optimization (GEO): SEO fundamentals, conversational queries, AI-friendly structure, E-E-A-T, freshness, structured data, and off-site citations.',
  url: `${SITE_URL}/geo-guide`,
  about: 'Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO).',
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is GEO different from SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mostly an extension. GEO keeps every SEO fundamental — speed, crawlability, useful content — and adds structure, demonstrated authority, and off-site citations that AI answer engines reward.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I know whether AI engines mention my product?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ask them. A GEO report queries engines like Perplexity, ChatGPT, and Gemini with category questions and measures whether you surface, whether you get cited as a source, the sentiment, and your share of voice versus peers.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the single highest-leverage thing for GEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Publish genuinely useful, well-structured content that answers the specific questions your audience asks — then get it cited on other platforms. Structure plus citations beats any single technical tweak.',
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

export default async function GeoGuidePage() {
  const user = await getServerUser()
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header user={user} />

      <article className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="masthead text-3xl leading-tight text-balance sm:text-4xl">How to show up in AI search</h1>
        <p className="mt-4 text-lg leading-relaxed">
          ChatGPT, Perplexity, and Google&apos;s AI answers are fast becoming how people discover products. Earning a
          spot there — <b>generative engine optimization</b> (GEO, sometimes called AEO) — rewards the same fundamentals
          as good SEO, plus a few habits AI engines clearly favor. Here&apos;s the practical playbook, and the one your{' '}
          <Link href="/submit" className="underline">free GEO report</Link> scores you against.
        </p>

        <Section n={1} title="Start with solid SEO fundamentals">
          <p>
            AI engines lean on the same ranking signals as classic search: fast{' '}
            <b>Core Web Vitals</b>, mobile-friendliness, HTTPS, a <b>crawlable structure</b>, and genuinely useful
            content. Audit regularly with Search Console, PageSpeed Insights, and a crawler like Screaming Frog. Sites
            that do SEO well still win in the AI era.
          </p>
        </Section>

        <Section n={2} title="Write for the questions people actually ask">
          <p>
            Conversational search is longer and more specific than keyword search. Target the <i>question</i>, not the
            keyword — add question words (what / how / why) and scenario qualifiers (audience, budget, time, use case).
          </p>
          <div className="mono overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="hairline text-left text-[var(--muted)]">
                  <th className="py-2 pr-4 font-normal">Keyword search</th>
                  <th className="py-2 pr-4 font-normal">Conversational query</th>
                  <th className="py-2 font-normal">Content angle</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">best restaurants NYC</td>
                  <td className="py-2 pr-4">“best restaurants in NYC for a romantic dinner under $100?”</td>
                  <td className="py-2">break out by price &amp; occasion</td>
                </tr>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">digital marketing tools</td>
                  <td className="py-2 pr-4">“what marketing tools work for a small business on a tight budget?”</td>
                  <td className="py-2">organize by company size &amp; budget</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>Mine question-shaped keywords with tools like AnswerThePublic and AlsoAsked.</p>
        </Section>

        <Section n={3} title="Structure content so an AI can lift it">
          <p>AI engines quote what&apos;s easy to extract. Make it easy:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Descriptive <b>H2/H3</b> headings that state the answer.</li>
            <li>Bullet lists, comparison tables, and <b>FAQ</b> blocks.</li>
            <li>Short paragraphs; bold the key takeaway.</li>
          </ul>
          <p>
            And don&apos;t just reword your product page — publish a <b>separate page for each high-frequency question</b>{' '}
            your audience asks.
          </p>
        </Section>

        <Section n={4} title="Show experience and authority (E-E-A-T)">
          <p>
            Engines weigh who&apos;s behind the content. Add real author bios (credentials + experience), first-hand
            data and examples, citations to credible research, testimonials and certifications, and a presence on
            authoritative platforms (a complete LinkedIn page, a clear org/about page). Real expertise, shown, builds
            trust.
          </p>
        </Section>

        <Section n={5} title="Keep it fresh">
          <p>
            Audit content every 3–6 months: refresh stats, prices, and trends — but make <i>real</i> updates, not just a
            new date. Use analytics to find high-traffic pages worth refreshing, and Google Trends to catch rising
            topics.
          </p>
        </Section>

        <Section n={6} title="Add the right structured data">
          <p>
            Schema.org markup helps engines understand and quote you. Prioritize <b>Article</b>, <b>FAQ</b>,{' '}
            <b>HowTo</b>, <b>Product</b>, <b>Review</b>, and (for local) <b>LocalBusiness</b>. Validate with Google&apos;s
            Rich Results Test, and start by adding FAQ and HowTo to your top-traffic pages.
          </p>
        </Section>

        <Section n={7} title="Build citations across the web">
          <p>
            AI training and retrieval lean heavily on public platforms. Take one product page and turn it into, say, 3
            LinkedIn posts, 5 Reddit answers, and 2 Medium articles — distributed where your audience already is.{' '}
            <b>Multiple independent sources mentioning you</b> is one of the strongest GEO signals there is.
          </p>
        </Section>

        <section className="mt-10">
          <h2 className="masthead text-2xl">FAQ</h2>
          <dl className="mt-3 space-y-4">
            <div>
              <dt className="font-bold">Is GEO different from SEO?</dt>
              <dd className="mt-1 leading-relaxed text-[var(--muted)]">
                Mostly an extension. GEO keeps every SEO fundamental and adds structure, demonstrated authority, and
                off-site citations that AI answer engines reward.
              </dd>
            </div>
            <div>
              <dt className="font-bold">How do I know whether AI engines mention my product?</dt>
              <dd className="mt-1 leading-relaxed text-[var(--muted)]">
                Ask them. A <Link href="/submit" className="underline">GEO report</Link> queries Perplexity, ChatGPT, and
                Gemini with category questions and measures whether you surface, get cited, the sentiment, and your share
                of voice versus peers.
              </dd>
            </div>
            <div>
              <dt className="font-bold">What&apos;s the single highest-leverage thing?</dt>
              <dd className="mt-1 leading-relaxed text-[var(--muted)]">
                Publish genuinely useful, well-structured content that answers your audience&apos;s real questions — then
                get it cited elsewhere. Structure plus citations beats any single technical tweak.
              </dd>
            </div>
          </dl>
        </section>

        <div className="rule mt-12 px-6 py-8 text-center">
          <p className="masthead text-xl">Want to see where you stand?</p>
          <p className="mt-2 text-[var(--muted)]">Post your product and get a free GEO report — your AI footprint, scored.</p>
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
