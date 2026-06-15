-- User feedback about the product / GEO. Text + optional images. The site
-- owner is notified by email (with the sender's email as reply-to).
create table feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 4000),
  images     jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index feedback_created_idx on feedback (created_at desc);

alter table feedback enable row level security;

-- Signed-in users submit as themselves and can see their own submissions.
-- The owner reads everything server-side via the admin client (bypasses RLS).
create policy feedback_insert_own on feedback
  for insert with check (auth.uid() is not null and user_id = auth.uid());
create policy feedback_select_own on feedback
  for select using (user_id = auth.uid());

grant insert, select on feedback to authenticated;
