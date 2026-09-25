-- ============================================================
-- 24 September 2026: fund raisers, receipt tracking, edit history.
--
-- Safe to run on the live database, and safe to run twice.
--   * Only ADDS columns and one table. Nothing is dropped, renamed,
--     rewritten or backfilled. Every existing row keeps every value.
--   * Every statement is "if not exists", so a second run does nothing.
--
-- Paste into Supabase, SQL Editor, New query, and press Run:
-- https://supabase.com/dashboard/project/eezzihdpembgnukgdmqd/sql/new
-- ============================================================

-- Who typed the entry in. Before this it lived only in admin_note,
-- which the receipt sender used to overwrite.
alter table donations add column if not exists entered_by      text;
-- Who ticked "WhatsApp receipt sent". receipt_sent_at already exists.
alter table donations add column if not exists receipt_sent_by text;
-- The last edit to the donor's details.
alter table donations add column if not exists updated_at      timestamptz;
alter table donations add column if not exists updated_by      text;
-- The time of payment, filled from the server clock (2026-09-26).
alter table donations add column if not exists paid_at         timestamptz;

create index if not exists donations_entered_by_idx
  on donations (entered_by, created_at desc);

-- Every change to a donor's details, before and after, so the
-- treasurer can always see what a row said when the receipt went out.
create table if not exists donation_edits (
  id           uuid primary key default gen_random_uuid(),
  donation_id  uuid not null references donations(id) on delete cascade,
  edited_by    text not null,
  edited_at    timestamptz not null default now(),
  before       jsonb not null,
  after        jsonb not null
);

create index if not exists donation_edits_donation_idx
  on donation_edits (donation_id, edited_at desc);

-- Same rule as every other table: the browser never reaches it.
alter table donation_edits enable row level security;
revoke all on table donation_edits from public, anon, authenticated;
grant all on table donation_edits to service_role;

-- Check: should print five column names and one table name.
select column_name from information_schema.columns
 where table_name = 'donations'
   and column_name in ('entered_by','receipt_sent_by','updated_at','updated_by','paid_at')
union all
select table_name from information_schema.tables where table_name = 'donation_edits';
