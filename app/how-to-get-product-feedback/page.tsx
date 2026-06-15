import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getServerUser } from '@/lib/auth-server'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'How to get honest feedback on your product',
  description:
    'A practical guide for indie hackers and SaaS makers on getting real, actionable product feedback instead of vanity praise: customer interviews, maker communities, showcase sites, in-app surveys, beta testers, asking specific non-leading questions, and reading behavior alongside words.',
  alternates: { canonical: '/how-to-get-product-feedback' },
  openGraph: {
    type: 'article',
    title: 'How to get honest feedback on your product',
    description: 'Get real, actionable product feedback instead of polite praise — interviews, communities, surveys, beta testers, and the questions that actually work.',
    url: '/how-to-get-product-feedback',
  },
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'How to get honest feedback on your product',
  description:
    'A practical guide to collecting honest, actionable product feedback: customer interviews, maker communities, showcase sites, in-app surveys, beta testers, asking specific non-leading questions, and reading behavior alongside words.',
  url: `${SITE_URL}/how-to-get-product-feedback`,
  about: 'Collecting honest, actionable product feedback for indie hackers and SaaS makers.',
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How many people do I need to talk to before the feedback is useful?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Five to eight focused conversations with your actual target users surface most of the big problems. You are looking for repeated patterns, not statistical significance — when the third person hits the same wall, that is your signal.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why does everyone tell me they love my product but nobody uses it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Politeness. People praise you to be kind and to end the conversation. Ignore compliments and weigh actions instead: did they sign up, return, pay, or refer someone? Behavior is honest in a way words rarely are.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the single best question to ask?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ask about the last time they faced the problem you solve: "Walk me through the last time you dealt with X." It pulls real stories and concrete behavior instead of hypothetical opinions about your product.',
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

export default async function ProductFeedbackPage() {
  const user = await getServerUser()
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header user={user} />

      <article className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="masthead text-3xl leading-tight text-balance sm:text-4xl">How to get honest feedback on your product</h1>
        <p className="mt-4 text-lg leading-relaxed">
          Most feedback you get is polite, and polite is useless. The goal isn&apos;t applause — it&apos;s the kind of
          specific, sometimes uncomfortable input that tells you what to build next. Here&apos;s where to find real users,
          how to ask so they tell you the truth, and how to separate signal from the noise of people being nice.
        </p>

        <Section n={1} title="Talk to actual users — one conversation at a time">
          <p>
            Nothing beats a real conversation with someone in your target audience. Customer interviews surface the
            <i> why</i> behind everything else. Keep them short (15–20 minutes), talk to <b>5–8 people</b>, and stop when
            you keep hearing the same thing.
          </p>
          <p>
            The trick: <b>ask about their past, not your product</b>. &ldquo;Walk me through the last time you dealt with
            X&rdquo; pulls a concrete story. &ldquo;Would you use a tool that does X?&rdquo; pulls a polite guess. Shut up
            and let silence do the work — most of the gold comes after the pause.
          </p>
        </Section>

        <Section n={2} title="Post in maker communities">
          <p>
            Communities are full of people who&apos;ll tell you what a friend won&apos;t. Match the venue to the audience
            and read each one&apos;s rules before you post:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li><b>Reddit</b> — niche subreddits where your users already hang out; lead with the problem, not the link.</li>
            <li><b>Indie Hackers</b> — builders who&apos;ll critique positioning, pricing, and onboarding.</li>
            <li><b>Discord / Slack groups</b> — fast, conversational feedback; great for a quick gut check.</li>
          </ul>
          <p>
            Don&apos;t drive-by spam. Show up, give feedback to others first, and ask one <b>specific</b> question rather
            than &ldquo;thoughts?&rdquo;
          </p>
        </Section>

        <Section n={3} title="Use showcase sites where people comment">
          <p>
            Showcase and &ldquo;launch&rdquo; sites put your product in front of other builders who upvote and leave
            comments. You get a public reaction, an early-adopter audience, and threads you can mine for objections.
          </p>
          <p>
            <Link href="/submit" className="underline">What Are You Building</Link> is one such place — post what
            you&apos;re shipping, collect upvotes, and get comments from other makers. It&apos;s one option among several
            (Product Hunt, Indie Hackers, and others all work); pick the rooms where your people actually are, and use more
            than one.
          </p>
        </Section>

        <Section n={4} title="Build feedback into the product">
          <p>
            The people using your product right now are your best source — catch them in the moment. Add a lightweight
            <b> in-app widget</b> or a one-question micro-survey at the spots that matter: right after onboarding, after a
            key action, or when someone hits cancel.
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>A persistent &ldquo;Feedback&rdquo; link or widget so it&apos;s always one click away.</li>
            <li>Trigger a short survey <i>after a behavior</i>, not on a timer that interrupts.</li>
            <li>Always ask a follow-up &ldquo;why?&rdquo; — a rating with no reason can&apos;t be acted on.</li>
            <li>On churn, ask the single most valuable question there is: <b>why are you leaving?</b></li>
          </ul>
        </Section>

        <Section n={5} title="Recruit a small group of beta testers">
          <p>
            A handful of committed testers beats a crowd of one-time visitors. Recruit from your waitlist, your
            interviews, or community replies — and <b>pick people who actually have the problem</b>, not friends who want
            to be supportive.
          </p>
          <p>
            Set expectations: tell them you want blunt critique, not encouragement, and that &ldquo;this is confusing&rdquo;
            is the most useful sentence they can send. Give them a clear task to attempt, then watch where they get stuck.
          </p>
        </Section>

        <Section n={6} title="Ask specific questions, not “what do you think?”">
          <p>
            &ldquo;What do you think?&rdquo; invites a compliment. Specific, behavior-anchored questions invite the truth.
            Avoid <b>leading questions</b> that smuggle in the answer you want, and never ask people to predict their own
            future behavior — they&apos;re bad at it.
          </p>
          <div className="mono overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="hairline text-left text-[var(--muted)]">
                  <th className="py-2 pr-4 font-normal">Bad question</th>
                  <th className="py-2 pr-4 font-normal">Better question</th>
                  <th className="py-2 font-normal">Why</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">“Do you like it?”</td>
                  <td className="py-2 pr-4">“What was confusing or annoying just now?”</td>
                  <td className="py-2">invites critique, not praise</td>
                </tr>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">“Would you pay for this?”</td>
                  <td className="py-2 pr-4">“What do you use today to solve this, and what does it cost you?”</td>
                  <td className="py-2">past behavior beats hypotheticals</td>
                </tr>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">“This is way faster, right?”</td>
                  <td className="py-2 pr-4">“How did this compare to how you do it now?”</td>
                  <td className="py-2">non-leading, no answer baked in</td>
                </tr>
                <tr className="hairline align-top">
                  <td className="py-2 pr-4">“Any feedback?”</td>
                  <td className="py-2 pr-4">“If you could change one thing, what would it be?”</td>
                  <td className="py-2">forces a concrete, rankable answer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section n={7} title="Read behavior alongside the words">
          <p>
            People lie politely; analytics don&apos;t. Pair every conversation with what the data says they actually did —
            and when the two disagree, <b>trust the behavior</b>.
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Watch <b>activation and retention</b>: do they come back, or just sign up and vanish?</li>
            <li>Find the <b>drop-off step</b> in your funnel — that&apos;s your loudest piece of feedback.</li>
            <li>Use session replays to see where real users hesitate or rage-click.</li>
            <li>The honest signals are <b>signups, repeat use, payment, and referrals</b> — not compliments.</li>
          </ul>
        </Section>

        <section className="mt-10">
          <h2 className="masthead text-2xl">FAQ</h2>
          <dl className="mt-3 space-y-4">
            <div>
              <dt className="font-bold">How many people do I need to talk to?</dt>
              <dd className="mt-1 leading-relaxed text-[var(--muted)]">
                Five to eight focused conversations with real target users surface most of the big problems. You&apos;re
                hunting for repeated patterns, not statistical significance — when the third person hits the same wall,
                that&apos;s your signal.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Everyone says they love it but nobody uses it — why?</dt>
              <dd className="mt-1 leading-relaxed text-[var(--muted)]">
                Politeness. People praise you to be kind and to end the conversation. Ignore the compliments and weigh the
                actions: did they sign up, return, pay, or refer someone? Behavior is honest in a way words rarely are.
              </dd>
            </div>
            <div>
              <dt className="font-bold">What&apos;s the single best question to ask?</dt>
              <dd className="mt-1 leading-relaxed text-[var(--muted)]">
                &ldquo;Walk me through the last time you dealt with [the problem].&rdquo; It pulls a real story and concrete
                behavior instead of a hypothetical opinion about your product.
              </dd>
            </div>
          </dl>
        </section>

        <div className="rule mt-12 px-6 py-8 text-center">
          <p className="masthead text-xl">Want feedback from other builders?</p>
          <p className="mt-2 text-[var(--muted)]">Post your product and collect upvotes and comments from people who ship.</p>
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
