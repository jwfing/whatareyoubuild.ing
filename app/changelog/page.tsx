import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getServerUser } from '@/lib/auth-server'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What is new on What Are You Building — recent features and improvements, newest first.',
  alternates: { canonical: '/changelog' },
  openGraph: { type: 'article', title: 'Changelog', description: 'What is new on What Are You Building.', url: '/changelog' },
}

type Entry = { date: string; title: string; items: string[] }

// Newest first. Keep these substantive — real shipped changes, not date bumps.
const ENTRIES: Entry[] = [
  {
    date: 'June 15, 2026',
    title: 'GEO playbook + question guides',
    items: [
      'New GEO playbook and guides answering common maker questions (where to share, Product Hunt alternatives, getting feedback).',
      'Site-wide structured data: Organization, breadcrumbs, and share images on every guide.',
    ],
  },
  {
    date: 'June 14, 2026',
    title: 'Send feedback',
    items: ['Write feedback (with screenshots) about the product or your GEO report — it reaches the maker, who can reply to your email.'],
  },
  {
    date: 'June 13, 2026',
    title: 'Follows + email notifications',
    items: [
      'Follow other builders from their profile.',
      'Get emailed when someone comments on your product, when it hits an upvote milestone, or when someone follows you.',
    ],
  },
  {
    date: 'June 12, 2026',
    title: 'GEO report history',
    items: ['Open any past version of your GEO report to see its full detail, and watch your scores move over time.'],
  },
  {
    date: 'June 11, 2026',
    title: 'Builder profiles + AI footprint',
    items: [
      'Public builder profiles with all your products, plus a "by <creator>" link on every product.',
      'The GEO report now measures your real AI footprint across Perplexity, ChatGPT, and Gemini — visibility, citations, sentiment, and share of voice.',
    ],
  },
  {
    date: 'June 10, 2026',
    title: 'Richer product pages',
    items: ['Screenshot galleries with a zoom lightbox, builder feedback comments, and edit/delete for your own products.'],
  },
  {
    date: 'June 9, 2026',
    title: 'Launch',
    items: ['NEW and HOT feeds, one-vote-per-person upvotes, Google/GitHub sign-in, and magazine-cover share cards.'],
  },
]

export default async function ChangelogPage() {
  const user = await getServerUser()
  return (
    <main>
      <Header user={user} />
      <article className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="masthead text-3xl leading-tight text-balance sm:text-4xl">Changelog</h1>
        <p className="mt-4 text-lg leading-relaxed">
          What&apos;s new on What Are You Building — recent features and improvements, newest first.
        </p>

        <ol className="mt-10">
          {ENTRIES.map((e) => (
            <li key={e.date} className="hairline py-5">
              <time className="mono text-xs tracking-[0.15em] text-[var(--muted)]">{e.date.toUpperCase()}</time>
              <h2 className="masthead mt-1 text-xl">{e.title}</h2>
              <ul className="mt-2 ml-5 list-disc space-y-1 leading-relaxed">
                {e.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </article>
      <Footer />
    </main>
  )
}
