import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/insforge'
import VoteButton from './VoteButton'

export default function ProductRow({
  p,
  rank,
  userId,
  index = 0,
}: {
  p: Product
  rank: number
  userId: string | null
  index?: number
}) {
  return (
    <li
      className="feed-row feed-rise hairline relative flex items-center gap-4 px-2 py-3"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <span className="mono w-6 shrink-0 text-right text-sm text-[var(--muted)]">{rank}</span>
      <Image
        src={p.image_url}
        alt=""
        width={64}
        height={64}
        className="feed-thumb rule h-16 w-16 shrink-0 object-cover"
      />
      <span className="min-w-0 flex-1">
        <b className="block truncate">{p.name}</b>
        <span className="block truncate text-sm text-[var(--muted)]">{p.tagline}</span>
      </span>
      <VoteButton productId={p.id} initialCount={p.vote_count} userId={userId} size="sm" />
      {/* Stretched link: the whole row navigates to the detail page; the vote
          button (z-10) stays independently tappable above this overlay. */}
      <Link href={`/p/${p.id}`} aria-label={p.name} className="absolute inset-0 z-0" />
    </li>
  )
}
