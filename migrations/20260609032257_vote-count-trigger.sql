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
