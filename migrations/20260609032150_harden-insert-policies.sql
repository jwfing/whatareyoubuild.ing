drop policy products_insert_own on products;
create policy products_insert_own on products
  for insert with check (auth.uid() is not null and author_id = auth.uid());

drop policy votes_insert_own on votes;
create policy votes_insert_own on votes
  for insert with check (auth.uid() is not null and user_id = auth.uid());
