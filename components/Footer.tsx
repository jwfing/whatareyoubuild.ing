import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="rule mt-12 border-x-0 border-b-0 px-5 py-6">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <Link href="/" className="masthead text-sm">WHAT ARE YOU BUILDING</Link>
        <nav className="mono flex gap-4 text-xs text-[var(--muted)]">
          <Link href="/about" className="transition-colors hover:text-[var(--ink)]">About</Link>
          <Link href="/how-hot-works" className="transition-colors hover:text-[var(--ink)]">How HOT works</Link>
          <Link href="/geo-guide" className="transition-colors hover:text-[var(--ink)]">GEO guide</Link>
          <Link href="/feedback" className="transition-colors hover:text-[var(--ink)]">Feedback</Link>
          <Link href="/submit" className="transition-colors hover:text-[var(--ink)]">Submit</Link>
        </nav>
      </div>
      <div className="mx-auto mt-4 max-w-2xl">
        <p className="mono text-xs text-[var(--muted)]">
          Powered by{' '}
          <a
            href="https://insforge.dev"
            target="_blank"
            rel="noopener"
            className="underline transition-colors hover:text-[var(--ink)]"
          >
            InsForge
          </a>
        </p>
      </div>
    </footer>
  )
}
