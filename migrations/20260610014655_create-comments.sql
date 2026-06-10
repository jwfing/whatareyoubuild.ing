-- Feedback/encouragement comments on products. Flat list, signed-in only.
create table comments (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index comments_product_created_idx on comments (product_id, created_at desc);

alter table comments enable row level security;

-- World-readable.
create policy comments_select_all on comments
  for select using (true);

-- Signed-in users insert as themselves.
create policy comments_insert_own on comments
  for insert with check (auth.uid() is not null and user_id = auth.uid());

-- Delete if you wrote it, or if you own the product it's on.
create policy comments_delete_own_or_owner on comments
  for delete using (
    user_id = auth.uid()
    or exists (select 1 from products p where p.id = product_id and p.author_id = auth.uid())
  );

grant select on comments to anon, authenticated;
grant insert, delete on comments to authenticated;
