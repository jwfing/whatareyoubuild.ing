-- Email-by-user-id lookup for the notification pipeline. SECURITY DEFINER so it
-- can read auth.users; execute restricted to project_admin so end-user roles
-- can never harvest emails.
create or replace function get_user_email(uid uuid) returns text
  language sql
  security definer
  set search_path = public, auth, pg_temp
as $$ select email from auth.users where id = uid $$;

revoke execute on function get_user_email(uuid) from public, anon, authenticated;
grant execute on function get_user_email(uuid) to project_admin;

-- Idempotency + light rate-limit ledger for sent notifications. Written only by
-- the server (project_admin via the admin key); RLS-locked from everyone else.
create table notification_log (
  id           bigserial primary key,
  recipient_id uuid not null,
  kind         text not null,
  ref          text not null,
  created_at   timestamptz not null default now(),
  unique (kind, ref)
);

create index notification_log_recipient_idx on notification_log (recipient_id, created_at desc);

alter table notification_log enable row level security;
-- No policies: end-user roles get nothing; project_admin bypasses RLS.
revoke all on notification_log from anon, authenticated;
grant select, insert on notification_log to project_admin;
grant usage, select on sequence notification_log_id_seq to project_admin;
