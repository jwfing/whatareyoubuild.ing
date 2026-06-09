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
