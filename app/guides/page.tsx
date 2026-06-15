import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getServerUser } from '@/lib/auth-server'

export const metadata: Metadata = {
  title: 'Guides',
  description:
    'Practical guides for indie builders and vibe coders: showing up in AI search (GEO), where to share what you are building, lightweight Product Hunt alternatives, getting honest feedback, and how our HOT ranking works.',
  alternates: { canonical: '/guides' },
  openGraph: { type: 'website', title: 'Guides', description: 'Playbooks for shipping, sharing, and getting your product seen.', url: '/guides' },
}

const GUIDES = [
  {
    href: '/geo-guide',
    title: 'How to show up in AI search',
    desc: 'A GEO playbook: the fundamentals that get your product surfaced and cited by ChatGPT, Perplexity, and Google AI.',
  },
  {
    href: '/where-to-share-your-product',
    title: 'Where to share what you’re building',
    desc: 'The best places to show an in-progress or just-launched product and get real eyes and feedback.',
  },
  {
    href: '/product-hunt-alternatives',
    title: 'Lightweight Product Hunt alternatives',
    desc: 'Where else to launch when Product Hunt feels too heavy — honest pros and cons.',
  },
  {
    href: '/how-to-get-product-feedback',
    title: 'How to get honest feedback on your product',
    desc: 'Tactics for real, actionable feedback instead of vanity praise.',
  },
  {
    href: '/how-hot-works',
    title: 'How HOT is calculated',
    desc: 'The time-decay ranking behind the HOT feed, with worked examples.',
  },
]

export default async function GuidesPage() {
  const user = await getServerUser()
  return (
    <main>
      <Header user={user} />
      <div className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="masthead text-3xl leading-tight text-balance sm:text-4xl">Guides</h1>
        <p className="mt-4 text-lg leading-relaxed">
          Practical playbooks for shipping, sharing, and getting your product seen — by people and by AI.
        </p>
        <ul className="mt-8">
          {GUIDES.map((g) => (
            <li key={g.href} className="hairline py-4">
              <Link href={g.href} className="masthead text-xl underline-offset-4 hover:underline">
                {g.title}
              </Link>
              <p className="mt-1 leading-relaxed text-[var(--muted)]">{g.desc}</p>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </main>
  )
}
