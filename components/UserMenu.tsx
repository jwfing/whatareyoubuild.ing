'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signOutAction } from '@/app/auth/actions'

export default function UserMenu({ label }: { label: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        // No border around a person's name: a black frame around a name reads
        // as a memorial in some cultures (e.g. China). Affordance comes from the
        // caret + hover/focus highlight instead.
        className="mono inline-flex max-w-[10rem] items-center gap-1 px-2 py-1 text-xs transition-colors hover:bg-[var(--paper-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
      >
        <span className="truncate">{label}</span>
        <span aria-hidden className="text-[0.6rem] text-[var(--muted)]">▾</span>
      </button>
      {open && (
        <div
          role="menu"
          className="rule absolute right-0 z-30 mt-1 w-44 bg-[var(--paper)]"
        >
          <Link
            role="menuitem"
            href="/my-products"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm transition-colors hover:bg-[var(--paper-2)]"
          >
            My products
          </Link>
          <Link
            role="menuitem"
            href="/profile"
            onClick={() => setOpen(false)}
            className="block border-t border-[var(--line)] px-3 py-2 text-sm transition-colors hover:bg-[var(--paper-2)]"
          >
            Edit profile
          </Link>
          <form action={signOutAction} className="border-t border-[var(--line)]">
            <button
              role="menuitem"
              type="submit"
              className="mono block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
