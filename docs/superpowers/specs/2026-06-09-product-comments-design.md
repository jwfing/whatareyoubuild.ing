# Product Comments — Design

**Date**: 2026-06-09
**Status**: Confirmed, building

## Goal

Let signed-in builders leave short **feedback/encouragement** on a product's detail page. Deepens the "being seen" value (makers want feedback, not just votes) while staying low-moderation and dodging the empty-feed-feels-dead trap.

## Decisions

| Decision | Choice |
|---|---|
| Job of comments | Builder feedback / encouragement (not threaded discussion) |
| Structure | Flat list, newest first. No replies/threading. |
| Auth | Signed-in only (OAuth-gated). Logged-out tap → `/signin` (same as voting). |
| Maker's voice | Product author's comments get a **MAKER** tag (no threading needed). |
| Moderation | Delete allowed if you're the **commenter OR the product's author**. Enforced in RLS, not just UI. No report queue v1. |
| Content | Plain text, ≤500 chars, rendered escaped (no markdown/HTML, no auto-linked URLs). No editing. |
| Name display | Resolved from the **trusted auth profile**, never client-supplied (no name spoofing). |
| Empty state | An invitation ("Be the first to cheer this on →") with the composer present — not a barren "No comments yet". |

## Out of scope (v1)

Threaded replies, notifications/emails, comment counts on feed rows, reporting/flagging, comment editing.

## Data model

`comments`
- `id` uuid pk default gen_random_uuid()
- `product_id` uuid not null → products(id) on delete cascade
- `user_id` uuid not null default auth.uid() → auth.users(id) on delete cascade
- `body` text not null check (char_length(body) between 1 and 500)
- `created_at` timestamptz not null default now()
- index on (product_id, created_at desc)

### RLS
- **select**: `using (true)` (public read)
- **insert**: `with check (auth.uid() is not null and user_id = auth.uid())` (the body length is enforced by the column CHECK)
- **delete**: `using (user_id = auth.uid() OR exists (select 1 from products p where p.id = product_id and p.author_id = auth.uid()))`
- Grants: `select` to anon + authenticated; `insert, delete` to authenticated.

## UI (product detail page)

A **Comments** section below the description.

- **Composer** (client): signed-in → textarea (maxLength 500) + Post. Logged-out → "Sign in to comment" → `/signin`. Optimistic prepend on post (using the current user's resolved name).
- **List** (SSR initial, client-interactive): each item = commenter name (+ MAKER tag if `user_id === product.author_id`), relative time, escaped body, and a **Delete** control shown when `userId === comment.user_id || userId === product.author_id`. Optimistic remove; RLS is the real gate.
- **Empty state**: inviting copy + the composer.

### Name resolution
The detail page (server) loads comments, resolves each distinct `user_id` to a display name via the trusted profile lookup, and passes `{ id, userId, name, body, createdAt }[]` to the client `CommentsSection`. New comments posted in-session use the current user's name (passed from `getServerUser()`).

## Components / files
- Migration: `comments` table + RLS + grants.
- `components/CommentsSection.tsx` (client): list + composer + delete, optimistic.
- `app/p/[id]/page.tsx`: fetch comments + resolve names + render `<CommentsSection>`.
- Reuse `lib/format.ts` `timeAgo`, the editorial styling, and the `/signin` redirect pattern.
