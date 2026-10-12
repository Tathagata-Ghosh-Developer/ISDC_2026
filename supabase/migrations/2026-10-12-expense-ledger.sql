-- ============================================================
-- 12 October 2026: the expense ledger.
--
-- Turns the expenses table into a ledger the audit can be done from:
-- the bill or invoice number, who actually paid the vendor, how and
-- with what reference, whether a member who paid from their own pocket
-- has been repaid (when, how, by whom), who approved the line, the
-- scanned bills themselves, and who entered and last changed it.
--
-- Safe to run on the live database, and safe to run twice.
--   * Only ADDS columns and indexes. Nothing is dropped, renamed,
--     rewritten or backfilled, and no row policy is loosened. Every
--     existing row keeps every value. The two columns with a default
--     (reimbursement_status and receipt_keys) read as "no refund
--     needed" and "no files" on the rows that are already there.
--   * Every statement is "if not exists", so a second run does nothing.
--   * The bills go into the private "proofs" bucket that the donation
--     screenshots already use, under expenses/<expense id>/. No new
--     bucket, and the bucket stays private: the console opens a file
--     on a signed link that dies in two minutes.
--
-- Paste into Supabase, SQL Editor, New query, and press Run.
-- ============================================================

-- The bill, as the vendor numbered it.
alter table expenses add column if not exists invoice_no text;

-- Who actually paid the vendor.
alter table expenses add column if not exists paid_from text
  check (paid_from is null or paid_from in ('committee_account', 'member', 'sponsor', 'other'));
-- The person, and how to reach them to repay them. Console only; never
-- read by any public page.
alter table expenses add column if not exists paid_by_name    text;
alter table expenses add column if not exists paid_by_contact text;

-- How the vendor was paid, and the UTR or cheque number.
alter table expenses add column if not exists payment_mode text
  check (payment_mode is null or payment_mode in ('upi', 'cash', 'bank', 'card', 'cheque', 'other'));
alter table expenses add column if not exists payment_ref text;

-- Whether somebody is owed their money back, and the repayment itself.
alter table expenses add column if not exists reimbursement_status text not null default 'not_needed'
  check (reimbursement_status in ('not_needed', 'pending', 'reimbursed'));
alter table expenses add column if not exists reimbursed_amount numeric(12,2)
  check (reimbursed_amount is null or reimbursed_amount >= 0);
alter table expenses add column if not exists reimbursed_on   date;
alter table expenses add column if not exists reimbursed_mode text
  check (reimbursed_mode is null or reimbursed_mode in ('upi', 'cash', 'bank', 'card', 'cheque', 'other'));
alter table expenses add column if not exists reimbursed_ref  text;
-- The console account that recorded the repayment.
alter table expenses add column if not exists reimbursed_by   text;

-- The console account that approved the line.
alter table expenses add column if not exists approved_by text;

-- Storage keys of the scanned bills and receipts, in the proofs bucket.
alter table expenses add column if not exists receipt_keys text[] not null default '{}';

alter table expenses add column if not exists notes      text;
alter table expenses add column if not exists created_by text;
alter table expenses add column if not exists updated_by text;
alter table expenses add column if not exists updated_at timestamptz;

create index if not exists expenses_spent_on_idx on expenses (spent_on desc);
create index if not exists expenses_reimbursement_idx
  on expenses (reimbursement_status) where reimbursement_status = 'pending';

-- Same rule as every other table, said again: the browser never reaches
-- it. These only ever tighten; nothing here grants anything new.
alter table expenses enable row level security;
revoke all on table expenses from public, anon, authenticated;

-- Check: should print eighteen column names.
select column_name from information_schema.columns
 where table_name = 'expenses'
   and column_name in (
     'invoice_no', 'paid_from', 'paid_by_name', 'paid_by_contact',
     'payment_mode', 'payment_ref', 'reimbursement_status',
     'reimbursed_amount', 'reimbursed_on', 'reimbursed_mode',
     'reimbursed_ref', 'reimbursed_by', 'approved_by', 'receipt_keys',
     'notes', 'created_by', 'updated_by', 'updated_at'
   );
