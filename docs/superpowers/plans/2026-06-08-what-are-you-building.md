# What Are You Building — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the MVP of *What Are You Building* — a builder showcase where users sign in with Google/GitHub, post products, and upvote, ranked by NEW and a time-decay HOT feed, with shareable SSR product pages and dynamic OG cards.

**Architecture:** Next.js (App Router, TypeScript, Tailwind) frontend talking to an InsForge backend (Auth OAuth, Postgres + RLS, Storage). HOT ordering and vote-count integrity live in Postgres (an RPC function + a trigger) so they can't be forged client-side. Product detail pages are server-rendered so social crawlers read OG meta; the share card is generated per-product via Next's file-based `opengraph-image`. Deployed to Vercel through `insforge deployments deploy`.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · `@insforge/sdk` · Postgres (via InsForge migrations) · `posthog-js` · Vitest · Vercel (via InsForge deployments)

**Spec:** `docs/superpowers/specs/2026-06-08-what-are-you-building-design.md`

---

## Conventions

- **CLI:** always `npx @insforge/cli <command>` (never global, never bare `insforge`).
- **Backend host:** `https://fci49uk9.us-west.insforge.app` (linked project `Whatareyoubuilding`).
- **Schema changes:** only via `db migrations` (never ad-hoc `db query` for DDL). Inspect live schema before each migration.
- **Commits:** small and frequent, one per task step group. End commit messages with the Co-Authored-By trailer.
- **Env files:** `.env.local` (gitignored via `.env*`) holds the InsForge URL + anon key + PostHog key.

## File Structure

```
app/
  layout.tsx                  # Root layout: fonts (serif+mono), theme, PostHog provider, global header
  page.tsx                    # Homepage: NEW/HOT tabs, magazine hybrid feed (SSR)
  globals.css                 # Tailwind + editorial theme tokens
  submit/page.tsx             # Submit form (client, auth-gated)
  p/[id]/page.tsx             # Product detail (SSR) + OG meta
  p/[id]/opengraph-image.tsx  # Dynamic magazine-cover OG card (1200x630)
  auth/callback/page.tsx      # OAuth return landing — SDK exchanges insforge_code, then redirects
  api/health/route.ts         # trivial route to confirm SSR works
lib/
  insforge.ts                 # createClient factory (browser + server variants)
  posthog.ts                  # PostHog init + typed event helpers
  vote.ts                     # pure optimistic vote-toggle reducer (unit-tested)
  format.ts                   # timeAgo + rank formatting helpers (unit-tested)
components/
  Header.tsx                  # WHAT ARE YOU BUILDING masthead + auth state + Submit CTA
  Feed.tsx                    # Featured headline + ranked list (server component)
  ProductRow.tsx              # One ranked list row
  VoteButton.tsx              # Client upvote control (optimistic, auth-gated)
  SubmitForm.tsx              # Client form with image upload
  AuthButtons.tsx             # Google/GitHub sign-in buttons
migrations/                   # InsForge migration files (timestamped)
test/
  vote.test.ts
  format.test.ts
```

---

## Phase A — Backend (InsForge)

### Task A1: Create the storage bucket for product images

**Files:** none (CLI state change)

- [ ] **Step 1: Inspect current buckets**

Run: `npx @insforge/cli storage buckets`
Expected: empty list (no buckets yet).

- [ ] **Step 2: Create a public bucket**

Product images must be publicly readable (they appear in feeds, detail pages, and OG cards).

Run: `npx @insforge/cli storage create-bucket product-images`
Expected: success; bucket `product-images` created as public (public is the default).

- [ ] **Step 3: Verify**

Run: `npx @insforge/cli storage buckets`
Expected: `product-images` listed.

---

### Task A2: Create `products` and `votes` tables with RLS

**Files:**
- Create: `migrations/<timestamp>_create-products-and-votes.sql`

- [ ] **Step 1: Sync migration history and inspect live schema**

Run:
```bash
npx @insforge/cli db migrations fetch
npx @insforge/cli db tables
npx @insforge/cli db migrations list
```
Expected: no `products`/`votes` tables; note any existing migration versions.

- [ ] **Step 2: Create the migration file**

Run: `npx @insforge/cli db migrations new create-products-and-votes`
This creates `migrations/<timestamp>_create-products-and-votes.sql`.

- [ ] **Step 3: Write the migration**

Put this exact SQL in the new file (no `BEGIN`/`COMMIT` — migrations run in a managed transaction):

```sql
-- products: one row per submitted product
create table products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  tagline     text not null check (char_length(tagline) between 1 and 60),
  image_url   text not null,
  image_key   text not null,
  link        text,
  description text,
  author_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vote_count  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index products_created_at_idx on products (created_at desc);
create index products_vote_count_idx on products (vote_count desc);

-- votes: one row per (user, product); unique constraint blocks double-voting
create table votes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index votes_product_id_idx on votes (product_id);

-- RLS
alter table products enable row level security;
alter table votes enable row level security;

-- products: world-readable; only signed-in users insert, and only as themselves
create policy products_select_all on products
  for select using (true);
create policy products_insert_own on products
  for insert with check (author_id = auth.uid());
create policy products_update_own on products
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy products_delete_own on products
  for delete using (author_id = auth.uid());

-- votes: readable by all (needed to show "did I vote"); insert/delete only your own
create policy votes_select_all on votes
  for select using (true);
create policy votes_insert_own on votes
  for insert with check (user_id = auth.uid());
create policy votes_delete_own on votes
  for delete using (user_id = auth.uid());
```

- [ ] **Step 4: Apply the migration**

Run: `npx @insforge/cli db migrations up --all`
Expected: migration applies without error.

- [ ] **Step 5: Verify tables, policies, indexes exist**

Run:
```bash
npx @insforge/cli db tables
npx @insforge/cli db policies
npx @insforge/cli db indexes
```
Expected: `products` and `votes` present; the 7 policies above present; the 4 indexes present.

- [ ] **Step 6: Commit**

```bash
git add migrations/
git commit -m "feat(db): products + votes tables with RLS

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task A3: Trigger to keep `products.vote_count` in sync

**Files:**
- Create: `migrations/<timestamp>_vote-count-trigger.sql`

- [ ] **Step 1: Create the migration file**

Run: `npx @insforge/cli db migrations new vote-count-trigger`

- [ ] **Step 2: Write the trigger**

```sql
create or replace function sync_vote_count() returns trigger
language plpgsql security definer as $$
begin
  if (tg_op = 'INSERT') then
    update products set vote_count = vote_count + 1 where id = new.product_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update products set vote_count = greatest(vote_count - 1, 0) where id = old.product_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger votes_sync_count
  after insert or delete on votes
  for each row execute function sync_vote_count();
```

- [ ] **Step 3: Apply**

Run: `npx @insforge/cli db migrations up --all`
Expected: applies cleanly.

- [ ] **Step 4: Verify the trigger maintains the count (this is the test)**

Run this end-to-end check with raw SQL (runs as project_admin, bypassing RLS — fine for a backend assertion):

```bash
npx @insforge/cli db query "
  insert into products (name, tagline, image_url, image_key, author_id)
  values ('TriggerTest', 'checking the counter', 'http://x/i.png', 'k', gen_random_uuid())
  returning id;"
```
Copy the returned `id` into the next command as `<PID>`, and use any uuid as `<UID>`:

```bash
npx @insforge/cli db query "insert into votes (user_id, product_id) values ('<UID>', '<PID>');"
npx @insforge/cli db query "select vote_count from products where id = '<PID>';"
```
Expected: `vote_count = 1`.

```bash
npx @insforge/cli db query "delete from votes where user_id = '<UID>' and product_id = '<PID>';"
npx @insforge/cli db query "select vote_count from products where id = '<PID>';"
```
Expected: `vote_count = 0`.

- [ ] **Step 5: Verify the unique constraint blocks double-voting**

```bash
npx @insforge/cli db query "insert into votes (user_id, product_id) values ('<UID>', '<PID>');"
npx @insforge/cli db query "insert into votes (user_id, product_id) values ('<UID>', '<PID>');"
```
Expected: the **second** insert fails with a unique-violation error.

- [ ] **Step 6: Clean up the test rows**

```bash
npx @insforge/cli db query "delete from products where name = 'TriggerTest';"
```
Expected: deletes the test product (votes cascade).

- [ ] **Step 7: Commit**

```bash
git add migrations/
git commit -m "feat(db): trigger to maintain products.vote_count

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task A4: `list_products` RPC for NEW + time-decay HOT ordering

**Files:**
- Create: `migrations/<timestamp>_list-products-rpc.sql`

PostgREST can't `ORDER BY` a computed decay expression, so HOT ordering lives in a SQL function. Formula (HN-style): `score = vote_count / (age_hours + 2)^1.8`.

- [ ] **Step 1: Create the migration file**

Run: `npx @insforge/cli db migrations new list-products-rpc`

- [ ] **Step 2: Write the function**

```sql
create or replace function list_products(
  p_sort text default 'new',
  p_limit integer default 30,
  p_offset integer default 0
) returns setof products
language sql stable as $$
  select *
  from products
  order by
    case when p_sort = 'hot'
      then vote_count / power(extract(epoch from (now() - created_at)) / 3600.0 + 2, 1.8)
    end desc nulls last,
    case when p_sort = 'new' then created_at end desc nulls last,
    created_at desc
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
$$;
```

- [ ] **Step 3: Apply**

Run: `npx @insforge/cli db migrations up --all`
Expected: applies cleanly.

- [ ] **Step 4: Verify HOT beats NEW correctly (the test)**

Seed two products: an OLD popular one and a NEW unpopular one, then confirm ordering flips between sorts.

```bash
npx @insforge/cli db query "
  insert into products (name, tagline, image_url, image_key, author_id, vote_count, created_at)
  values
    ('OldPopular', 'old but loved', 'http://x/a.png', 'a', gen_random_uuid(), 50, now() - interval '5 days'),
    ('NewQuiet',   'brand new',     'http://x/b.png', 'b', gen_random_uuid(), 1,  now());"
```

```bash
npx @insforge/cli db query "select name from list_products('new', 10, 0);"
```
Expected: `NewQuiet` appears **before** `OldPopular` (newest first).

```bash
npx @insforge/cli db query "select name from list_products('hot', 10, 0);"
```
Expected: `OldPopular` still outranks `NewQuiet` here (50 votes over 5 days still beats 1 fresh vote) — but confirm the function returns without error and orders by the decay score. (If you instead seed `NewQuiet` with e.g. 8 votes, it should leapfrog `OldPopular` under `hot` but not under `new` — optional extra check.)

- [ ] **Step 5: Clean up**

```bash
npx @insforge/cli db query "delete from products where name in ('OldPopular','NewQuiet');"
```

- [ ] **Step 6: Commit**

```bash
git add migrations/
git commit -m "feat(db): list_products RPC with NEW + time-decay HOT ordering

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Phase B — Frontend scaffold

### Task B1: Scaffold Next.js + Tailwind + SDK, wire env

**Files:**
- Create: project scaffold (`package.json`, `tsconfig.json`, `next.config.ts`, `app/`, `app/globals.css`, `tailwind` config)
- Create: `.env.local`, `.env.example`
- Create: `lib/insforge.ts`
- Create: `app/api/health/route.ts`

- [ ] **Step 1: Scaffold the app**

Run (from the project root; the dir already contains `docs/` and `migrations/` — scaffold in place):
```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm
```
If prompted about a non-empty directory, accept keeping existing files.
Expected: Next.js app created; `npm run dev` would serve on :3000.

- [ ] **Step 2: Install runtime deps**

```bash
npm install @insforge/sdk posthog-js
npm install -D vitest
```

- [ ] **Step 3: Retrieve the anon key and write env**

The browser SDK needs the project's **anon** key (NOT the `ik_` admin key in `.insforge/project.json`). Get it from the dashboard: open `https://insforge.dev/dashboard/project/90077357-b21d-49a7-9d4a-1439c090a897` → API keys → copy the anon/publishable key.

Create `.env.local`:
```
NEXT_PUBLIC_INSFORGE_URL=https://fci49uk9.us-west.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=<anon-key-from-dashboard>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Create `.env.example` with the same keys but empty values (commit this one).

- [ ] **Step 4: Write the SDK client factory**

Create `lib/insforge.ts`:
```ts
import { createClient } from '@insforge/sdk'

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY

// Browser singleton (carries the signed-in user session).
let browserClient: ReturnType<typeof createClient> | null = null
export function getBrowserClient() {
  if (!browserClient) browserClient = createClient({ baseUrl, anonKey })
  return browserClient
}

// Fresh stateless client for server components / route handlers (public reads via RLS).
export function getServerClient() {
  return createClient({ baseUrl, anonKey })
}

export type Product = {
  id: string
  name: string
  tagline: string
  image_url: string
  image_key: string
  link: string | null
  description: string | null
  author_id: string
  vote_count: number
  created_at: string
}
```

- [ ] **Step 5: Add a health route to prove SSR works**

Create `app/api/health/route.ts`:
```ts
export async function GET() {
  return Response.json({ ok: true })
}
```

- [ ] **Step 6: Verify build + health route**

```bash
npm run build
```
Expected: build succeeds.
```bash
npm run dev &  # then in another shell:
curl -s http://localhost:3000/api/health
```
Expected: `{"ok":true}`. Stop the dev server afterward.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with InsForge client + env

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task B2: Editorial theme (fonts, tokens, globals)

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Wire fonts in the root layout**

Use a serif display face + a monospace accent (matches the approved Editorial direction). Edit `app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const serif = Fraunces({ subsets: ['latin'], variable: '--font-serif', weight: ['400','600','800'] })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','700'] })

export const metadata: Metadata = {
  title: 'What Are You Building',
  description: 'A showcase of what vibe coders are building. Post yours, upvote others.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Define theme tokens + base styles**

Replace `app/globals.css` body of custom styles with the editorial palette (paper `#f4f1ea`, ink `#111`, hard borders). Append after the Tailwind directives:
```css
:root {
  --paper: #f4f1ea;
  --ink: #111111;
  --muted: #555555;
  --line: #dddddd;
}
body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-serif), Georgia, serif;
}
.mono { font-family: var(--font-mono), ui-monospace, monospace; }
.hairline { border-bottom: 1px solid var(--line); }
.rule { border: 2px solid var(--ink); }
.masthead { font-weight: 800; letter-spacing: -0.5px; }
```

- [ ] **Step 3: Verify**

```bash
npm run build
```
Expected: build succeeds, no font import errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(ui): editorial theme — Fraunces serif, mono accents, paper/ink palette

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task B3: PostHog provider + typed event helpers

**Files:**
- Create: `lib/posthog.ts`
- Create: `components/PostHogProvider.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Run the InsForge PostHog setup (ensures dashboard connection)**

Run: `npx @insforge/cli posthog setup`
This ensures the InsForge dashboard has a PostHog connection and prints the official wizard command. **The printed `npx -y @posthog/wizard@latest` command is interactive — ask the user to run it in their own terminal.** From its output, copy the `phc_...` project key into `NEXT_PUBLIC_POSTHOG_KEY` in `.env.local`.

- [ ] **Step 2: Write typed event helpers**

Create `lib/posthog.ts`:
```ts
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key || posthog.__loaded) return
  posthog.init(key, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST, capture_pageview: true })
}

// The funnel events from the spec. One place, typed, so names never drift.
export const track = {
  productPageViewed: (productId: string) => posthog.capture('product_page_viewed', { productId }),
  signupCompleted: (provider: string) => posthog.capture('signup_completed', { provider }),
  productSubmitted: (productId: string) => posthog.capture('product_submitted', { productId }),
  voteCast: (productId: string) => posthog.capture('vote_cast', { productId }),
  shareClicked: (productId: string) => posthog.capture('share_clicked', { productId }),
}
```

- [ ] **Step 3: Provider component**

Create `components/PostHogProvider.tsx`:
```tsx
'use client'
import { useEffect } from 'react'
import { initPostHog } from '@/lib/posthog'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => { initPostHog() }, [])
  return <>{children}</>
}
```

- [ ] **Step 4: Mount it in the layout**

In `app/layout.tsx`, wrap `{children}` with `<PostHogProvider>` (import it). The `<body>` becomes:
```tsx
<body><PostHogProvider>{children}</PostHogProvider></body>
```

- [ ] **Step 5: Verify**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(analytics): PostHog provider + typed funnel events

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Phase C — Pure logic (TDD) + core UI

### Task C1: Pure helpers with unit tests (vote toggle, formatting)

**Files:**
- Create: `lib/vote.ts`, `lib/format.ts`
- Create: `test/vote.test.ts`, `test/format.test.ts`
- Modify: `package.json` (test script)

- [ ] **Step 1: Add the test script**

In `package.json` `"scripts"`, add: `"test": "vitest run"`.

- [ ] **Step 2: Write the failing tests**

Create `test/vote.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { toggleVote } from '@/lib/vote'

describe('toggleVote', () => {
  it('adds a vote when not yet voted', () => {
    expect(toggleVote({ voted: false, count: 4 })).toEqual({ voted: true, count: 5 })
  })
  it('removes a vote when already voted', () => {
    expect(toggleVote({ voted: true, count: 5 })).toEqual({ voted: false, count: 4 })
  })
  it('never drops below zero', () => {
    expect(toggleVote({ voted: true, count: 0 })).toEqual({ voted: false, count: 0 })
  })
})
```

Create `test/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { timeAgo } from '@/lib/format'

describe('timeAgo', () => {
  const now = new Date('2026-06-08T12:00:00Z').getTime()
  it('shows minutes', () => {
    expect(timeAgo('2026-06-08T11:30:00Z', now)).toBe('30m ago')
  })
  it('shows hours', () => {
    expect(timeAgo('2026-06-08T09:00:00Z', now)).toBe('3h ago')
  })
  it('shows days', () => {
    expect(timeAgo('2026-06-06T12:00:00Z', now)).toBe('2d ago')
  })
})
```

- [ ] **Step 3: Run tests, verify they FAIL**

Run: `npm test`
Expected: FAIL — `toggleVote` / `timeAgo` not defined.

- [ ] **Step 4: Implement the helpers**

Create `lib/vote.ts`:
```ts
export type VoteState = { voted: boolean; count: number }

export function toggleVote(s: VoteState): VoteState {
  return s.voted
    ? { voted: false, count: Math.max(s.count - 1, 0) }
    : { voted: true, count: s.count + 1 }
}
```

Create `lib/format.ts`:
```ts
export function timeAgo(iso: string, now: number = Date.now()): string {
  const mins = Math.floor((now - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${Math.max(mins, 0)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
```

- [ ] **Step 5: Run tests, verify they PASS**

Run: `npm test`
Expected: all 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(lib): tested vote-toggle + timeAgo helpers

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task C2: Auth — Google/GitHub sign-in, callback, session

**Files:**
- Create: `components/AuthButtons.tsx`, `components/Header.tsx`
- Create: `app/auth/callback/page.tsx`
- Modify: `app/page.tsx` (mount Header — temporary placeholder feed is fine until C3)
- Config: InsForge allowed redirect URLs

- [ ] **Step 1: Register allowed redirect URLs**

OAuth `redirectTo` must be allow-listed. Configure via `insforge.toml`:
```bash
npx @insforge/cli --json config export
```
In `insforge.toml`, set `[auth].allowedRedirectUrls` to include `http://localhost:3000/auth/callback` (and later the production URL). Then:
```bash
npx @insforge/cli --json config plan
npx @insforge/cli --json --yes config apply
```
If `apply` returns `skipped[]`, surface it verbatim and ask the user to upgrade the backend.

- [ ] **Step 2: Auth buttons**

Create `components/AuthButtons.tsx`:
```tsx
'use client'
import { getBrowserClient } from '@/lib/insforge'

export default function AuthButtons() {
  const insforge = getBrowserClient()
  const signIn = (provider: 'google' | 'github') =>
    insforge.auth.signInWithOAuth(provider, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    })
  return (
    <div className="flex gap-2">
      <button className="rule mono px-3 py-1 text-sm" onClick={() => signIn('google')}>Google</button>
      <button className="rule mono px-3 py-1 text-sm" onClick={() => signIn('github')}>GitHub</button>
    </div>
  )
}
```

- [ ] **Step 3: OAuth callback page**

The SDK auto-detects `insforge_code` on load and saves the session. Create `app/auth/callback/page.tsx`:
```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/insforge'
import { track } from '@/lib/posthog'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    const run = async () => {
      const insforge = getBrowserClient()
      const { data } = await insforge.auth.getCurrentUser()
      if (data.user) track.signupCompleted(data.user.providers?.[0] ?? 'oauth')
      router.replace('/')
    }
    run()
  }, [router])
  return <p className="mono p-8">Signing you in…</p>
}
```

- [ ] **Step 4: Header with auth state**

Create `components/Header.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/insforge'
import AuthButtons from './AuthButtons'

export default function Header() {
  const [name, setName] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const insforge = getBrowserClient()
  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      setName(data.user?.profile?.name ?? data.user?.email ?? null)
      setReady(true)
    })
  }, [])
  return (
    <header className="rule border-x-0 border-t-0 flex items-baseline justify-between px-5 py-3">
      <Link href="/" className="masthead text-lg">WHAT ARE YOU BUILDING</Link>
      <div className="flex items-center gap-3">
        <Link href="/submit" className="rule mono text-xs px-2 py-1">+ SUBMIT</Link>
        {ready && (name
          ? <span className="mono text-xs">{name}</span>
          : <AuthButtons />)}
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Mount Header on the homepage (placeholder body)**

Edit `app/page.tsx`:
```tsx
import Header from '@/components/Header'

export default function Home() {
  return (
    <main>
      <Header />
      <div className="mono p-8">Feed coming in C3.</div>
    </main>
  )
}
```

- [ ] **Step 6: Verify the OAuth round-trip manually**

```bash
npm run dev
```
Open `http://localhost:3000`, click **Google** (and again with **GitHub**). Expected: real OAuth consent → redirect to `/auth/callback` → land back on `/` with your name/email shown in the header instead of the sign-in buttons. Confirm a `signup_completed` event appears in PostHog (or in the browser network tab to `i.posthog.com`).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(auth): Google/GitHub OAuth sign-in, callback, header session

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task C3: Homepage feed — magazine hybrid, NEW/HOT (SSR)

**Files:**
- Create: `components/Feed.tsx`, `components/ProductRow.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Product row component**

Create `components/ProductRow.tsx`:
```tsx
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
```

- [ ] **Step 2: Feed (server component) — featured headline + ranked list**

Create `components/Feed.tsx`:
```tsx
import Link from 'next/link'
import Image from 'next/image'
import { getServerClient, type Product } from '@/lib/insforge'
import ProductRow from './ProductRow'

export default async function Feed({ sort }: { sort: 'new' | 'hot' }) {
  const insforge = getServerClient()
  const { data } = await insforge.database.rpc('list_products', { p_sort: sort, p_limit: 30, p_offset: 0 })
  const products = (data ?? []) as Product[]

  if (products.length === 0) {
    return <p className="mono p-8 text-[var(--muted)]">Nothing here yet. Be the first to ship.</p>
  }
  const [featured, ...rest] = products
  return (
    <div className="mx-auto max-w-2xl px-5 py-4">
      <nav className="mono mb-4 text-xs">
        <Link href="/?sort=new" className={sort === 'new' ? 'font-bold' : 'text-[var(--muted)]'}>NEW</Link>
        {' · '}
        <Link href="/?sort=hot" className={sort === 'hot' ? 'font-bold' : 'text-[var(--muted)]'}>HOT</Link>
      </nav>

      <Link href={`/p/${featured.id}`} className="rule mb-4 flex gap-4 p-4">
        <Image src={featured.image_url} alt="" width={120} height={90} className="h-[90px] w-[120px] object-cover" />
        <span className="flex-1">
          <span className="mono block text-[10px] tracking-widest">★ TODAY'S TOP</span>
          <span className="masthead block text-2xl">{featured.name}</span>
          <span className="block text-sm text-[var(--muted)]">{featured.tagline}</span>
        </span>
        <span className="rule mono self-center px-2.5 py-1.5 text-center">▲<br /><b>{featured.vote_count}</b></span>
      </Link>

      {rest.map((p, i) => <ProductRow key={p.id} p={p} rank={i + 2} />)}
    </div>
  )
}
```

- [ ] **Step 3: Homepage reads `?sort=` and renders the feed**

Edit `app/page.tsx`:
```tsx
import Header from '@/components/Header'
import Feed from '@/components/Feed'

export default async function Home({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams
  const s = sort === 'hot' ? 'hot' : 'new'
  return (
    <main>
      <Header />
      <Feed sort={s} />
    </main>
  )
}
```

- [ ] **Step 4: Allow remote images from the InsForge host**

Edit `next.config.ts` to whitelist the storage host:
```ts
import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: 'fci49uk9.us-west.insforge.app' }] },
}
export default nextConfig
```

- [ ] **Step 5: Seed one product via SQL so the feed isn't empty, then verify**

```bash
npx @insforge/cli db query "
  insert into products (name, tagline, image_url, image_key, author_id, vote_count)
  values ('Cron.fyi','A friendlier way to write cron jobs',
          'https://placehold.co/120x90/111/f4f1ea?text=cron','seed', gen_random_uuid(), 12);"
```
```bash
npm run build && npm run dev
```
Open `http://localhost:3000`. Expected: masthead, NEW/HOT tabs, the seeded product as the featured headline. Click **HOT** → URL `?sort=hot`, feed re-renders without error.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(feed): SSR magazine-hybrid homepage with NEW/HOT tabs

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task C4: Submit form with image upload (auth-gated)

**Files:**
- Create: `components/SubmitForm.tsx`
- Create: `app/submit/page.tsx`

- [ ] **Step 1: Submit form component**

Create `components/SubmitForm.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/insforge'
import { track } from '@/lib/posthog'
import AuthButtons from './AuthButtons'

export default function SubmitForm() {
  const router = useRouter()
  const insforge = getBrowserClient()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => setAuthed(!!data.user))
  }, [])

  if (authed === null) return <p className="mono p-8">…</p>
  if (!authed) return (
    <div className="p-8">
      <p className="mb-3">Sign in to post your product.</p>
      <AuthButtons />
    </div>
  )

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setErr(null)
    const form = new FormData(e.currentTarget)
    const file = form.get('image') as File
    if (!file || file.size === 0) { setErr('An image is required.'); setBusy(false); return }

    const up = await insforge.storage.from('product-images').uploadAuto(file)
    if (up.error || !up.data) { setErr('Image upload failed.'); setBusy(false); return }

    const { data, error } = await insforge.database.from('products').insert({
      name: String(form.get('name') || '').trim(),
      tagline: String(form.get('tagline') || '').trim(),
      link: String(form.get('link') || '').trim() || null,
      description: String(form.get('description') || '').trim() || null,
      image_url: up.data.url,
      image_key: up.data.key,
    }).select().single()

    if (error || !data) { setErr('Could not save. Check name (≤80) and tagline (≤60).'); setBusy(false); return }
    track.productSubmitted((data as { id: string }).id)
    router.push(`/p/${(data as { id: string }).id}`)
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-3 p-6">
      <input name="name" required maxLength={80} placeholder="Product name" className="rule w-full px-3 py-2" />
      <input name="tagline" required maxLength={60} placeholder="One line (≤60 chars)" className="rule w-full px-3 py-2" />
      <input name="link" type="url" placeholder="Link (optional)" className="rule w-full px-3 py-2" />
      <textarea name="description" placeholder="Details (optional, markdown)" className="rule w-full px-3 py-2" rows={4} />
      <input name="image" type="file" accept="image/*" required className="mono block text-sm" />
      {err && <p className="mono text-sm text-red-700">{err}</p>}
      <button disabled={busy} className="rule mono px-4 py-2">{busy ? 'Posting…' : 'Post it'}</button>
    </form>
  )
}
```

- [ ] **Step 2: Submit page**

Create `app/submit/page.tsx`:
```tsx
import Header from '@/components/Header'
import SubmitForm from '@/components/SubmitForm'

export default function SubmitPage() {
  return <main><Header /><SubmitForm /></main>
}
```

- [ ] **Step 3: Verify end-to-end (manual)**

```bash
npm run dev
```
Signed out: open `/submit` → expect the sign-in prompt. Sign in, reload `/submit`, fill the form, attach an image, **Post it**. Expected: redirect to `/p/<id>`; the product appears on the homepage NEW feed; `product_submitted` fires in PostHog. Try submitting a 70-char tagline → expect the inline error (the DB check constraint rejects it).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(submit): auth-gated product submission with image upload

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task C5: Product detail page (SSR) + upvote

**Files:**
- Create: `components/VoteButton.tsx`
- Create: `app/p/[id]/page.tsx`

- [ ] **Step 1: Vote button (client, optimistic, auth-gated)**

Create `components/VoteButton.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { getBrowserClient } from '@/lib/insforge'
import { toggleVote } from '@/lib/vote'
import { track } from '@/lib/posthog'
import AuthButtons from './AuthButtons'

export default function VoteButton({ productId, initialCount }: { productId: string; initialCount: number }) {
  const insforge = getBrowserClient()
  const [state, setState] = useState({ voted: false, count: initialCount })
  const [userId, setUserId] = useState<string | null>(null)
  const [needAuth, setNeedAuth] = useState(false)

  useEffect(() => {
    insforge.auth.getCurrentUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      const { data: rows } = await insforge.database
        .from('votes').select('id').eq('product_id', productId).eq('user_id', data.user.id)
      setState(s => ({ ...s, voted: !!(rows && rows.length) }))
    })
  }, [productId])

  async function onClick() {
    if (!userId) { setNeedAuth(true); return }
    const next = toggleVote(state)
    setState(next) // optimistic
    if (next.voted) {
      const { error } = await insforge.database.from('votes').insert({ product_id: productId })
      if (error) setState(state); else track.voteCast(productId)
    } else {
      const { error } = await insforge.database.from('votes').delete()
        .eq('product_id', productId).eq('user_id', userId)
      if (error) setState(state)
    }
  }

  return (
    <div>
      <button onClick={onClick} className={`rule mono px-4 py-3 text-center ${state.voted ? 'bg-[var(--ink)] text-[var(--paper)]' : ''}`}>
        ▲<br /><b>{state.count}</b>
      </button>
      {needAuth && <div className="mt-2"><p className="mono mb-1 text-xs">Sign in to vote:</p><AuthButtons /></div>}
    </div>
  )
}
```

- [ ] **Step 2: Detail page (SSR) with OG metadata**

Create `app/p/[id]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import VoteButton from '@/components/VoteButton'
import { getServerClient, type Product } from '@/lib/insforge'

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await getServerClient().database.from('products').select().eq('id', id).maybeSingle()
  return (data as Product) ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const p = await getProduct(id)
  if (!p) return { title: 'Not found' }
  return {
    title: `${p.name} — What Are You Building`,
    description: p.tagline,
    openGraph: { title: p.name, description: p.tagline },
    twitter: { card: 'summary_large_image', title: p.name, description: p.tagline },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await getProduct(id)
  if (!p) notFound()
  return (
    <main>
      <Header />
      <article className="mx-auto max-w-2xl px-5 py-6">
        <div className="rule flex gap-4 p-4">
          <Image src={p.image_url} alt="" width={160} height={120} className="h-[120px] w-[160px] object-cover" />
          <div className="flex-1">
            <h1 className="masthead text-3xl">{p.name}</h1>
            <p className="text-[var(--muted)]">{p.tagline}</p>
            {p.link && <a href={p.link} target="_blank" rel="noopener" className="mono mt-2 inline-block text-sm underline">Visit →</a>}
          </div>
          <VoteButton productId={p.id} initialCount={p.vote_count} />
        </div>
        {p.description && <div className="mt-4 whitespace-pre-wrap">{p.description}</div>}
      </article>
    </main>
  )
}
```

- [ ] **Step 3: Verify SSR + voting (manual)**

```bash
npm run dev
```
Open a product at `/p/<id>`. View source (Cmd-U) → confirm `<meta property="og:title">` is present in the **server HTML** (proves SSR, crawlers will see it). Signed out, click ▲ → expect the inline "Sign in to vote". Sign in, click ▲ → count increments and persists on reload; click again → decrements. Confirm `vote_cast` fires in PostHog.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(product): SSR detail page with OG meta + optimistic upvote

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task C6: Dynamic OG card (magazine-cover layout)

**Files:**
- Create: `app/p/[id]/opengraph-image.tsx`

- [ ] **Step 1: Implement the dynamic OG image**

Next renders this to a 1200×630 PNG and auto-wires it as `og:image` for `/p/[id]`. Create `app/p/[id]/opengraph-image.tsx` reproducing the approved magazine-cover (left text / right image, hard border):
```tsx
import { ImageResponse } from 'next/og'
import { getServerClient, type Product } from '@/lib/insforge'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG({ params }: { params: { id: string } }) {
  const { data } = await getServerClient().database.from('products').select().eq('id', params.id).maybeSingle()
  const p = data as Product | null
  const name = p?.name ?? 'What Are You Building'
  const tagline = p?.tagline ?? 'A showcase of what vibe coders are building'
  const votes = p?.vote_count ?? 0

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#f4f1ea', color: '#111', border: '12px solid #111', fontFamily: 'serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1.2, padding: 56, borderRight: '12px solid #111' }}>
          <div style={{ fontSize: 22, letterSpacing: 2 }}>WHAT ARE YOU BUILDING</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 24, color: '#666' }}>★ FEATURED</div>
            <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1, marginTop: 8 }}>{name}</div>
            <div style={{ fontSize: 32, color: '#555', marginTop: 16 }}>{tagline}</div>
          </div>
          <div style={{ fontSize: 22, color: '#666' }}>whatareyoubuilding</div>
        </div>
        <div style={{ display: 'flex', flex: 0.8, background: '#111', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
          {p?.image_url
            ? <img src={p.image_url} width={480} height={630} style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', opacity: 0.85 }} />
            : null}
          <div style={{ display: 'flex', margin: 40, padding: '16px 28px', border: '4px solid #f4f1ea', color: '#f4f1ea', fontSize: 40, zIndex: 1 }}>▲ {votes}</div>
        </div>
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 2: Verify the OG image renders**

```bash
npm run dev
```
Open `http://localhost:3000/p/<id>/opengraph-image` directly. Expected: a 1200×630 PNG showing the magazine-cover card with the product name as the headline and the live vote count. Then paste a product URL into a crawler preview tool (e.g. opengraph.xyz) after deploy to confirm the card shows in social previews.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(og): dynamic magazine-cover OG card per product

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task C7: Wire the share action + funnel events

**Files:**
- Create: `components/ShareButton.tsx`
- Modify: `app/p/[id]/page.tsx` (add ShareButton; add product_page_viewed capture)

- [ ] **Step 1: Share button**

Create `components/ShareButton.tsx`:
```tsx
'use client'
import { track } from '@/lib/posthog'

export default function ShareButton({ productId }: { productId: string }) {
  async function onShare() {
    track.shareClicked(productId)
    const url = window.location.href
    if (navigator.share) { try { await navigator.share({ url }) } catch {} }
    else { await navigator.clipboard.writeText(url) }
  }
  return <button onClick={onShare} className="rule mono px-3 py-1 text-xs">Share ↗</button>
}
```

- [ ] **Step 2: Capture `product_page_viewed` on the detail page**

Create a tiny client component `components/PageView.tsx`:
```tsx
'use client'
import { useEffect } from 'react'
import { track } from '@/lib/posthog'
export default function PageView({ productId }: { productId: string }) {
  useEffect(() => { track.productPageViewed(productId) }, [productId])
  return null
}
```
In `app/p/[id]/page.tsx`, import and render `<PageView productId={p.id} />` and `<ShareButton productId={p.id} />` (place Share next to the title block).

- [ ] **Step 3: Verify**

```bash
npm run dev
```
Open a product page → confirm `product_page_viewed` fires. Click **Share** → confirm `share_clicked` fires and the URL is copied/shared.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(analytics): share action + product_page_viewed funnel events

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Phase D — Ship

### Task D1: Production env, build, deploy to Vercel via InsForge

**Files:** none (deploy)

- [ ] **Step 1: Final local build gate**

```bash
npm run build && npm test
```
Expected: build succeeds; all unit tests pass.

- [ ] **Step 2: Set persistent deployment env vars**

```bash
npx @insforge/cli deployments env list
npx @insforge/cli deployments env set NEXT_PUBLIC_INSFORGE_URL https://fci49uk9.us-west.insforge.app
npx @insforge/cli deployments env set NEXT_PUBLIC_INSFORGE_ANON_KEY <anon-key>
npx @insforge/cli deployments env set NEXT_PUBLIC_POSTHOG_KEY <phc_key>
npx @insforge/cli deployments env set NEXT_PUBLIC_POSTHOG_HOST https://us.i.posthog.com
# NEXT_PUBLIC_SITE_URL is set after first deploy when the URL is known (Step 4)
```

- [ ] **Step 3: Deploy**

```bash
npx @insforge/cli deployments deploy .
```
Expected: deployment succeeds; note the returned production URL.

- [ ] **Step 4: Point SITE_URL + OAuth redirects at production**

```bash
npx @insforge/cli deployments env set NEXT_PUBLIC_SITE_URL https://<prod-url>
```
Add `https://<prod-url>/auth/callback` to `[auth].allowedRedirectUrls` in `insforge.toml`, then:
```bash
npx @insforge/cli --json --yes config apply
```
Redeploy so `NEXT_PUBLIC_SITE_URL` takes effect:
```bash
npx @insforge/cli deployments deploy .
```

- [ ] **Step 5: Production smoke test**

On the live URL: sign in with Google and GitHub; submit a product with an image; upvote from a second account; open a product page and confirm the OG card renders in a social preview tool; confirm all five funnel events land in PostHog. Remove any leftover seed rows:
```bash
npx @insforge/cli db query "delete from products where image_key = 'seed';"
```

- [ ] **Step 6: Commit any config changes**

```bash
git add -A
git commit -m "chore(deploy): production env + OAuth redirect URLs

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (completed by author)

- **Spec coverage:** Auth Google/GitHub only (C2) ✓ · submit name/tagline/image/link/description (C4) ✓ · NEW + time-decay HOT (A4, C3) ✓ · upvote, one-per-user, toggle (A2/A3, C5) ✓ · SSR detail page + OG meta (C5) ✓ · dynamic magazine-cover share card (C6) ✓ · magazine-hybrid editorial homepage (B2, C3) ✓ · vote_count integrity via trigger (A3) ✓ · RLS (A2) ✓ · Storage bucket (A1) ✓ · PostHog funnel events `product_page_viewed`/`signup_completed`/`product_submitted`/`vote_cast`/`share_clicked` (B3, C2/C4/C5/C7) ✓ · UTM tracking is automatic via PostHog `$pageview` referrer/UTM capture ✓ · Vercel deploy via InsForge (D1) ✓.
- **Explicitly deferred (per spec YAGNI):** comments, follows/profiles, weekly/today badges, notifications, search — not in this plan.
- **Type consistency:** `Product` type defined once in `lib/insforge.ts` and reused; `toggleVote`/`VoteState` consistent across `lib/vote.ts`, tests, and `VoteButton`; `track.*` event names defined once in `lib/posthog.ts` and referenced everywhere; RPC name `list_products` and params `p_sort`/`p_limit`/`p_offset` consistent between A4 and C3.
- **Open item flagged for execution:** the anon key (B1 Step 3) and the PostHog `phc_` key (B3 Step 1) must be fetched interactively by the user; both are called out as explicit steps rather than placeholders.
