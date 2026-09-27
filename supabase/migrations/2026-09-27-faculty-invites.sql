-- ============================================================
-- 27 September 2026: the faculty invitation tracker.
--
-- Adds one new table. Touches no existing table and no existing row.
-- Safe to run twice.
-- ============================================================

create table if not exists faculty_invites (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  post        text,
  department  text,
  division    text,
  email       text,
  -- who is carrying the card, as the committee knows them; matched to a
  -- volunteer's account name or contact-sheet name when they sign in
  volunteer   text,
  invited     boolean not null default false,   -- card handed over in person
  invited_at  timestamptz,
  paid        boolean not null default false,
  amount      numeric(12,2) check (amount is null or amount >= 0),
  remarks     text,                              -- special requests, sponsorship leads
  updated_by  text,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists faculty_invites_volunteer_idx on faculty_invites (lower(volunteer));
create unique index if not exists faculty_invites_email_unique
  on faculty_invites (lower(email)) where email is not null;

-- Same rule as every other table: the browser never reaches it.
alter table faculty_invites enable row level security;
revoke all on table faculty_invites from public, anon, authenticated;
grant all on table faculty_invites to service_role;
