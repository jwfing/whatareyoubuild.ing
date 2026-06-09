-- Fix 1: Pin search_path on the SECURITY DEFINER function to prevent
-- shadow-table hijacking attacks against the privileged UPDATE.
create or replace function sync_vote_count() returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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

-- Fix 2: Replace blanket UPDATE on products with column-level UPDATE that
-- excludes vote_count (and id, author_id, created_at) for end-user API roles.
-- Discovered roles with blanket UPDATE: anon, authenticated (project_admin is admin, untouched).

-- Role: anon
revoke update on products from anon;
grant update (name, tagline, image_url, image_key, link, description) on products to anon;

-- Role: authenticated
revoke update on products from authenticated;
grant update (name, tagline, image_url, image_key, link, description) on products to authenticated;
