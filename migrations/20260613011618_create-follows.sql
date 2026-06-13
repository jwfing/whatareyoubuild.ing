-- Social graph: who follows whom. One row per (follower, following).
create table follows (
  follower_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index follows_following_idx on follows (following_id);

alter table follows enable row level security;

-- World-readable (follower counts are public).
create policy follows_select_all on follows for select using (true);
-- You can only follow as yourself, and only remove your own follows.
create policy follows_insert_own on follows
  for insert with check (auth.uid() is not null and follower_id = auth.uid());
create policy follows_delete_own on follows
  for delete using (follower_id = auth.uid());

grant select on follows to anon, authenticated;
grant insert, delete on follows to authenticated;
