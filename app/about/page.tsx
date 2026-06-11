import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getServerUser } from '@/lib/auth-server'

export const metadata: Metadata = {
  title: 'About',
  description:
    'What Are You Building is a showcase where indie builders and vibe coders post what they are shipping — the community upvotes and comments. Here is what it is, who it is for, and how it works.',
  alternates: { canonical: '/about' },
  openGraph: { type: 'article', title: 'About — What Are You Building', url: '/about' },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is it free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes.' } },
    { '@type': 'Question', name: 'Who can post?', acceptedAnswer: { '@type': 'Answer', text: 'Anyone with a Google or GitHub account.' } },
    { '@type': 'Question', name: 'How is the HOT feed ranked?', acceptedAnswer: { '@type': 'Answer', text: 'By a time-decay score — votes divided by age — so new products can climb and older ones drift down, rather than ranking on raw vote count alone.' } },
    { '@type': 'Question', name: 'Can I edit or remove my product?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Open your product and hit Edit, or find it under "My products" in the account menu.' } },
    { '@type': 'Question', name: 'Does my product have to be finished?', acceptedAnswer: { '@type': 'Answer', text: 'No. Half-built, just-shipped, or still an idea with a screenshot — all welcome.' } },
  ],
}

export default async function AboutPage() {
  const user = await getServerUser()
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header user={user} />

      <article className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="masthead text-3xl leading-tight text-balance sm:text-4xl">About What Are You Building</h1>
        <p className="mt-4 text-lg leading-relaxed">
          What Are You Building is a showcase for the things indie builders and vibe coders are shipping. Post your
          product — a name, a screenshot or three, one honest line about what it does — and the community sees it,
          upvotes it, and tells you what they think. A front page for work-in-progress: lighter than a formal launch,
          more durable than a tweet.
        </p>

        <h2 className="masthead mt-10 text-2xl">How it works</h2>
        <ul className="mt-3 space-y-2 leading-relaxed">
          <li><b>Sign in with Google or GitHub.</b> Browsing is open to everyone; posting, upvoting, and commenting need a free sign-in — that keeps the room full of builders, not bots.</li>
          <li><b>Post what you&apos;re building.</b> Name, cover image, a one-line pitch, optional screenshots and a link. It shows up immediately.</li>
          <li><b>Two feeds.</b> NEW is the latest. HOT is a time-decayed vote score, so fresh work surfaces and yesterday&apos;s settles down — nobody squats the top forever.</li>
          <li><b>Upvote and comment.</b> One vote per person. Comments are for feedback and encouragement — the thing makers actually want.</li>
        </ul>

        <h2 className="masthead mt-10 text-2xl">Why it exists</h2>
        <p className="mt-3 leading-relaxed">
          Builders want to be seen, and they want feedback more than applause. Most places make that heavy — a launch to
          orchestrate, a crowd to rally. This is the opposite: drop the thing you&apos;re working on, get eyes on it,
          move on. A few things we care about:
        </p>
        <ul className="mt-3 space-y-2 leading-relaxed">
          <li><b>Taste is the first filter.</b> The site looks the way it does on purpose. If it had no point of view, the people we want wouldn&apos;t post.</li>
          <li><b>Everyone gets seen.</b> The top spot gets a small nod, not a spotlight that buries everyone below it.</li>
          <li><b>Pure signal.</b> Sign-in-gated, one vote each, ranking that resists gaming. The feed should be worth trusting.</li>
        </ul>

        <h2 className="masthead mt-10 text-2xl">FAQ</h2>
        <dl className="mt-3 space-y-4 leading-relaxed">
          <div><dt className="font-bold">Is it free?</dt><dd className="text-[var(--muted)]">Yes.</dd></div>
          <div><dt className="font-bold">Who can post?</dt><dd className="text-[var(--muted)]">Anyone with a Google or GitHub account.</dd></div>
          <div><dt className="font-bold">How is HOT ranked?</dt><dd className="text-[var(--muted)]">By a time-decay score (votes divided by age), so new products can climb and old ones drift down — not by raw vote count alone.</dd></div>
          <div><dt className="font-bold">Can I edit or remove my product?</dt><dd className="text-[var(--muted)]">Yes — open your product and hit Edit, or find it under &ldquo;My products&rdquo; in the menu.</dd></div>
          <div><dt className="font-bold">Does it have to be finished?</dt><dd className="text-[var(--muted)]">No. Half-built, just-shipped, still-an-idea-with-a-screenshot — all welcome.</dd></div>
        </dl>

        <div className="mt-10">
          <Link href="/submit" className="rule mono inline-block px-5 py-2.5 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]">
            Post what you&apos;re building →
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  )
}
