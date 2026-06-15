import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthButtons from '@/components/AuthButtons'
import FeedbackForm from '@/components/FeedbackForm'
import { getServerUser } from '@/lib/auth-server'

export const metadata: Metadata = {
  title: 'Feedback',
  description: 'Share ideas, requests, or bugs about What Are You Building and the GEO report.',
  alternates: { canonical: '/feedback' },
  robots: { index: false, follow: true },
}

export default async function FeedbackPage() {
  const user = await getServerUser()
  return (
    <main>
      <Header user={user} />
      <div className="mx-auto max-w-xl px-5 pt-8">
        <h1 className="masthead text-3xl">Feedback</h1>
        <p className="mt-2 text-[var(--muted)]">
          Ideas, requests, bugs — about the product or your GEO report. It comes straight to me, and I can reply to the
          email on your account.
        </p>
      </div>
      {user ? (
        <FeedbackForm />
      ) : (
        <div className="mx-auto max-w-xl px-6 py-8">
          <p className="mb-3">Sign in to send feedback — that way I can reply to you.</p>
          <AuthButtons />
        </div>
      )}
      <Footer />
    </main>
  )
}
