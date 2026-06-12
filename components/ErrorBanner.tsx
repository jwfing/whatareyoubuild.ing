const MESSAGES: Record<string, string> = {
  oauth_failed: 'Sign-in failed. Please try again.',
  missing_verifier: 'Sign-in session expired. Please try again.',
  exchange_failed: 'Could not complete sign-in. Please try again.',
}

export default function ErrorBanner({ code }: { code: string }) {
  const msg = MESSAGES[code] ?? 'Something went wrong. Please try again.'
  return (
    <div className="mx-auto max-w-2xl px-5 pt-4">
      <p className="mono border border-[var(--ink)] px-3 py-2 text-sm" role="alert">{msg}</p>
    </div>
  )
}
