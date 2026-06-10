import Link from 'next/link'
import { redirect } from 'next/navigation'
import AuthButtons from '@/components/AuthButtons'
import LogoMark from '@/components/LogoMark'
import { getServerUser } from '@/lib/auth-server'

export default async function SignInPage() {
  // Already signed in? Nothing to do here.
  if (await getServerUser()) redirect('/')

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="rule flex items-center justify-between border-x-0 border-t-0 px-5 py-3">
        <Link href="/" aria-label="What Are You Building — home" className="flex items-center gap-2">
          <LogoMark className="h-9 w-9 shrink-0" />
          <span className="masthead text-lg leading-none">WHAT ARE YOU BUILDING</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <h1 className="masthead text-3xl leading-[1.05] text-balance">Sign in to upvote what builders ship.</h1>
          <p className="mt-2 text-[var(--muted)]">
            Builders only — sign in with Google or GitHub to vote and post.
          </p>
          <div className="mt-6">
            <AuthButtons />
          </div>
          <Link href="/" className="mono mt-8 inline-block text-xs text-[var(--muted)] underline">
            ← back to the feed
          </Link>
        </div>
      </div>
    </main>
  )
}
