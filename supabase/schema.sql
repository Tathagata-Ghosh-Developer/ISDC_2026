-- ============================================================
-- IISc Sharodiya Durgotsab — database schema
-- Run this once in the Supabase SQL editor.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Donations
-- ------------------------------------------------------------
create table if not exists donations (
  id               uuid primary key default gen_random_uuid(),
  -- The public receipt link uses this, never the primary key, so that
  -- anything the board exposes can never be turned into a lookup.
  receipt_token    uuid not null unique default gen_random_uuid(),
  receipt_no       text unique,
  sr_number        text,
  name             text not null,
  email            text not null,
  phone            text not null,
  category         text not null default 'guest'
                     check (category in ('student','faculty','alumni','guest')),
  amount           numeric(12,2) not null check (amount > 0),
  method           text not null default 'upi'
                     check (method in ('upi','neft','imps','cash','cheque','other')),
  reference        text,
  paid_on          date,
  message          text,
  display_name     text,
  anonymous        boolean not null default false,
  proof_url        text,
  status           text not null default 'pending'
                     check (status in ('pending','verified','rejected')),
  admin_note       text,
  verified_at      timestamptz,
  verified_by      text,
  receipt_sent_at  timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists donations_status_idx  on donations (status, created_at desc);
create index if not exists donations_created_idx on donations (created_at desc);
create index if not exists donations_ref_idx     on donations (reference);
create unique index if not exists donations_token_idx on donations (receipt_token);

-- Existing installations: add the column and backfill.
alter table donations
  add column if not exists receipt_token uuid not null default gen_random_uuid();

-- Sequential, human-readable receipt numbers: ISDC/2026/0001
create sequence if not exists receipt_seq start 1;

-- ------------------------------------------------------------
-- Expenses — the other half of financial transparency
-- ------------------------------------------------------------
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  head        text not null,
  description text,
  amount      numeric(12,2) not null check (amount >= 0),
  spent_on    date,
  vendor      text,
  bill_url    text,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists expenses_head_idx on expenses (head);

-- ------------------------------------------------------------
-- Verify a donation and mint its receipt number atomically.
-- nextval() is race-free, so two admins clicking at once is safe.
-- ------------------------------------------------------------
create or replace function verify_donation(p_id uuid, p_by text)
returns donations
language plpgsql
security definer
set search_path = public
as $$
declare
  row donations;
begin
  update donations
     set status      = 'verified',
         verified_at = coalesce(verified_at, now()),
         verified_by = p_by,
         receipt_no  = coalesce(
           receipt_no,
           'ISDC/' || to_char(now() at time zone 'Asia/Kolkata', 'YYYY') || '/' ||
           lpad(nextval('receipt_seq')::text, 4, '0')
         )
   where id = p_id
   returning * into row;

  return row;
end;
$$;

-- ------------------------------------------------------------
-- Row Level Security
--
-- Nothing reaches the database from the browser. Every read and
-- write goes through a Next.js route handler holding the service
-- role key, so anon/authenticated roles are denied outright.
-- ------------------------------------------------------------
alter table donations enable row level security;
alter table expenses  enable row level security;

drop policy if exists "no anon access" on donations;
drop policy if exists "no anon access" on expenses;

-- No permissive policy is created on purpose. RLS with zero
-- policies denies every request that is not made with the
-- service role key.

-- ------------------------------------------------------------
-- Storage bucket for payment screenshots (private).
-- Create in the dashboard, or run:
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', false)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Settings — every committee-editable piece of the public site.
-- One row per top-level group; the app merges these over the
-- defaults compiled into the code.
-- ------------------------------------------------------------
create table if not exists settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;

-- ------------------------------------------------------------
-- Enquiries — sponsors, sister institutes, feedback.
--
-- One table for every message the site can send us, tagged by
-- kind, so the committee reads one inbox instead of four.
-- ------------------------------------------------------------
create table if not exists enquiries (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('sponsor','institute','feedback','general')),
  name         text not null,
  organisation text,
  email        text,
  phone        text,
  subject      text,
  message      text not null,
  -- Where on the site they were standing when they wrote.
  page         text,
  status       text not null default 'new' check (status in ('new','seen','done','spam')),
  admin_note   text,
  handled_by   text,
  created_at   timestamptz not null default now()
);

create index if not exists enquiries_kind_created
  on enquiries (kind, created_at desc);
create index if not exists enquiries_status_created
  on enquiries (status, created_at desc);

alter table enquiries enable row level security;

-- ------------------------------------------------------------
-- Visits — counts, and nothing that is about a person.
--
-- There is no cookie, no device id, no address and no fingerprint
-- anywhere in this table. A row is a day, a path, the host that
-- sent the visitor and whether the screen was a phone, and it
-- carries two numbers. Nothing here can be traced back to anyone,
-- which is the reason the site needs no consent banner to keep it.
--
-- Rows are upserted rather than appended, so a year of traffic is
-- a few thousand rows rather than a few million, and it fits in
-- the free tier with room to spare.
-- ------------------------------------------------------------
create table if not exists visits (
  day       date not null,
  path      text not null,
  referrer  text not null default 'direct',
  device    text not null default 'unknown',
  views     integer not null default 0,
  sessions  integer not null default 0,
  primary key (day, path, referrer, device)
);

create index if not exists visits_day on visits (day desc);

alter table visits enable row level security;

-- Upsert one visit. Called only by this site's own route handler.
create or replace function bump_visit(
  p_day      date,
  p_path     text,
  p_referrer text,
  p_device   text,
  p_first    boolean
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into visits (day, path, referrer, device, views, sessions)
  values (p_day, p_path, p_referrer, p_device, 1, case when p_first then 1 else 0 end)
  on conflict (day, path, referrer, device) do update
    set views    = visits.views + 1,
        sessions = visits.sessions + case when p_first then 1 else 0 end;
end;
$$;

-- ------------------------------------------------------------
-- Events — the few clicks worth counting, by name only.
--
-- Same rule as visits: a name, a day and a number. No identity.
-- ------------------------------------------------------------
create table if not exists events (
  day   date not null,
  name  text not null,
  count integer not null default 0,
  primary key (day, name)
);

alter table events enable row level security;

create or replace function bump_event(p_day date, p_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into events (day, name, count) values (p_day, p_name, 1)
  on conflict (day, name) do update set count = events.count + 1;
end;
$$;

-- ------------------------------------------------------------
-- Who may call the functions.
--
-- This block is the most important twenty lines in the file and it
-- was missing from the first version, so it is worth explaining.
--
-- Postgres grants EXECUTE on a new function to PUBLIC by default.
-- Supabase then exposes every function in the public schema through
-- PostgREST as an RPC endpoint reachable with the anon key, which is
-- the key that ships in any browser. Three of the functions here are
-- SECURITY DEFINER, which means they run as their owner and ignore
-- row level security entirely.
--
-- Put together, that meant anybody holding the anon key could have
-- called verify_donation with a guessed uuid and marked a donation
-- verified, minting a receipt number from the committee's own
-- sequence. The tables were locked and the back door was standing
-- open next to them. RLS on a table says nothing about who may call
-- a function that bypasses it.
--
-- So: revoke from everybody, then grant only to service_role, which
-- is the key this site's own server holds and the browser never sees.
-- ------------------------------------------------------------

revoke all on function verify_donation(uuid, text) from public, anon, authenticated;
revoke all on function bump_visit(date, text, text, text, boolean) from public, anon, authenticated;
revoke all on function bump_event(date, text) from public, anon, authenticated;

grant execute on function verify_donation(uuid, text) to service_role;
grant execute on function bump_visit(date, text, text, text, boolean) to service_role;
grant execute on function bump_event(date, text) to service_role;

-- Same reasoning for the sequence. Nothing but the server should be
-- able to advance the receipt numbering.
revoke all on sequence receipt_seq from public, anon, authenticated;
grant usage, select on sequence receipt_seq to service_role;

-- And for the tables themselves. RLS with no policy already denies
-- anon, but a future policy added carelessly would not be able to
-- grant more than the table privileges allow, which makes this a
-- second lock rather than a duplicate of the first.
revoke all on donations, expenses, settings, enquiries, visits, events
  from public, anon, authenticated;

-- ------------------------------------------------------------
-- One bank credit, one receipt.
--
-- The unbroken receipt sequence proves the console issued every
-- number it said it did. It proves nothing about the bank account.
-- Two people can declare the same UTR, both get verified, and two
-- receipt numbers are issued against one credit. The sequence stays
-- unbroken and the books do not balance, which is the failure the
-- sequence was supposed to prevent.
--
-- Rejected rows are excluded so that a mistyped reference can be
-- rejected and entered again correctly.
-- ------------------------------------------------------------
create unique index if not exists donations_reference_unique
  on donations (reference)
  where reference is not null
    and length(btrim(reference)) > 0
    and status <> 'rejected';

-- ------------------------------------------------------------
-- The screenshots bucket.
--
-- Creating the bucket with "on conflict do nothing" means that if a
-- bucket called proofs already existed and was public, it stayed
-- public and this file said nothing about it. These are pictures of
-- people's banking apps, frequently showing an account balance, and
-- they were the only sensitive thing in the system whose protection
-- was not in version control.
--
-- Force it private, and deny every browser-facing role outright. The
-- site reads these through a route that mints a two-minute signed URL
-- for a signed-in committee member, using the service role key.
-- ------------------------------------------------------------
update storage.buckets set public = false where id = 'proofs';

alter table storage.objects enable row level security;

drop policy if exists "proofs are not readable by anyone" on storage.objects;
drop policy if exists "proofs are not writable by anyone" on storage.objects;

-- No permissive policy is created, on purpose. With RLS enabled and no
-- policy, anon and authenticated are denied and only the service role
-- gets through.

-- ============================================================
-- Analytics, the consented tier.
--
-- The committee wants as much as it can get about who visits. There
-- are two ways to do that and only one of them is available to a body
-- that already holds donor names, phone numbers and SR numbers.
--
-- Taking it covertly means it has to stay anonymous to be defensible,
-- which caps what may be collected at roughly what `visits` already
-- holds. Asking for it means far more may be collected, kept longer,
-- and joined into a journey, because the visitor agreed.
--
-- So: `visits` stays as it is and needs no consent, because nothing in
-- it is about a person. Everything below only ever fills when someone
-- has said yes, and empties when they say no.
-- ============================================================

create table if not exists visitor_sessions (
  id            uuid primary key default gen_random_uuid(),
  started_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),

  -- how they arrived
  landing_path  text,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,

  -- what they are reading on
  device        text,
  screen_w      integer,
  screen_h      integer,
  viewport_w    integer,
  viewport_h    integer,
  pixel_ratio   numeric(4,2),
  language      text,
  languages     text,
  timezone      text,
  platform      text,
  browser       text,
  connection    text,
  touch         boolean,
  prefers_dark  boolean,
  reduced_motion boolean,

  -- shape of the visit
  page_count    integer not null default 0,
  duration_ms   integer not null default 0,
  max_scroll    integer not null default 0,
  is_returning  boolean not null default false,

  -- the only thing that matters commercially
  donated       boolean not null default false,

  -- when this row must be deleted, and by whom
  expires_on    date not null default (current_date + interval '180 days')
);

create index if not exists visitor_sessions_started on visitor_sessions (started_at desc);
create index if not exists visitor_sessions_campaign on visitor_sessions (utm_campaign);
create index if not exists visitor_sessions_expires on visitor_sessions (expires_on);

-- Every page and every action, in order, so a journey can be read end
-- to end rather than guessed at from totals.
create table if not exists session_events (
  id          bigserial primary key,
  session_id  uuid not null references visitor_sessions (id) on delete cascade,
  at          timestamptz not null default now(),
  seq         integer not null,
  kind        text not null check (kind in ('view', 'action', 'exit')),
  path        text,
  name        text,
  dwell_ms    integer,
  scroll_pct  integer
);

create index if not exists session_events_session on session_events (session_id, seq);
create index if not exists session_events_at on session_events (at desc);

alter table visitor_sessions enable row level security;
alter table session_events   enable row level security;

revoke all on visitor_sessions, session_events from public, anon, authenticated;

-- Forget them when the time is up. A committee that rotates every year
-- will not remember to do this, so it is a function they can call from
-- one button rather than a habit they have to keep.
create or replace function forget_expired_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  gone integer;
begin
  delete from visitor_sessions where expires_on < current_date;
  get diagnostics gone = row_count;
  return gone;
end;
$$;

revoke all on function forget_expired_sessions() from public, anon, authenticated;
grant execute on function forget_expired_sessions() to service_role;

-- ------------------------------------------------------------
-- Fund raisers, receipt tracking and edit history (2026-09-24).
-- Also in supabase/migrations/2026-09-24-roles.sql.
-- ------------------------------------------------------------
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
