'use client'
import { signInGoogle, signInGitHub } from '@/app/auth/actions'

export default function AuthButtons() {
  return (
    <form className="flex gap-2">
      <button formAction={signInGoogle} className="rule mono px-3 py-1 text-sm transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]">Google</button>
      <button formAction={signInGitHub} className="rule mono px-3 py-1 text-sm transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]">GitHub</button>
    </form>
  )
}
