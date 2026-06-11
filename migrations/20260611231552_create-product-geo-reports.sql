-- Owner-only GEO/AEO reports for a builder's own products. Append-only history:
-- each run inserts a new dated row so makers can track progress over time.
-- Never overwrite — the history IS the value (watch your AI footprint climb).
create table product_geo_reports (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products(id) on delete cascade,
  owner_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  report          jsonb not null,
  health_score    int not null default 0,
  footprint_score int not null default 0,
  checked_at      timestamptz not null default now()
);

create index product_geo_reports_product_checked_idx
  on product_geo_reports (product_id, checked_at desc);

alter table product_geo_reports enable row level security;

-- Owner-only: a maker can read and create reports only for products they own.
-- Not granted to anon, so public visitors never see a product's GEO report.
create policy product_geo_reports_select_own on product_geo_reports
  for select using (owner_id = auth.uid());

create policy product_geo_reports_insert_own on product_geo_reports
  for insert with check (
    owner_id = auth.uid()
    and exists (select 1 from products p where p.id = product_id and p.author_id = auth.uid())
  );

grant select, insert on product_geo_reports to authenticated;
