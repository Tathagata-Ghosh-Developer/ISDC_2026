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
