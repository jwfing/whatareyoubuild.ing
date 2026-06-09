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
