import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/insforge'

export default function ProductRow({ p, rank }: { p: Product; rank: number }) {
  return (
    <Link href={`/p/${p.id}`} className="hairline flex items-center gap-3 py-2.5">
      <span className="mono w-6 text-right text-sm">{rank}</span>
      <Image src={p.image_url} alt="" width={40} height={40} className="rule h-10 w-10 object-cover" />
      <span className="flex-1">
        <b>{p.name}</b>
        <span className="block text-sm text-[var(--muted)]">{p.tagline}</span>
      </span>
      <span className="rule mono px-2 py-1 text-center text-xs">▲<br />{p.vote_count}</span>
    </Link>
  )
}
