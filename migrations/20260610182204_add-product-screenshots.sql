-- A gallery of additional screenshots per product (the existing image_url stays
-- the cover used by the feed + OG card). Array of { url, key }.
alter table products add column screenshots jsonb not null default '[]'::jsonb;

-- Owners may set/update the gallery (matches the existing editable-column grant;
-- vote_count stays non-writable).
grant update (screenshots) on products to authenticated;
