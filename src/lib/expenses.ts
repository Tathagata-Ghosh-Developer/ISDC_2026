/**
 * The expense ledger: what the Puja spent, who paid the vendor, the
 * bill, and whether a member who paid from their own pocket has been
 * repaid.
 *
 * Shared by the server, which enforces every rule here at the trust
 * boundary, and the browser, which runs the same rules to explain a
 * mistake before anything is sent. Nothing here touches the database.
 *
 * Payer names, contacts, bills and repayments never leave the committee
 * console. The one public read of this table (getBoard in src/lib/db.ts)
 * names head, amount and spent_on and takes nothing else.
 */

import { toCsv } from "@/lib/csv";

/* ------------------------------------------------------------------
   Vocabulary
   ------------------------------------------------------------------ */

export const PAID_FROM = ["committee_account", "member", "sponsor", "other"] as const;
export type PaidFrom = (typeof PAID_FROM)[number];

export const PAID_FROM_LABEL: Record<PaidFrom, string> = {
  committee_account: "The committee account",
  member: "A member, from their own pocket",
  sponsor: "A sponsor, directly",
  other: "Someone else",
};

export const PAID_FROM_SHORT: Record<PaidFrom, string> = {
  committee_account: "Committee account",
  member: "Member",
  sponsor: "Sponsor",
  other: "Other",
};

export const PAYMENT_MODES = ["upi", "cash", "bank", "card", "cheque", "other"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const PAYMENT_MODE_LABEL: Record<PaymentMode, string> = {
  upi: "UPI",
  cash: "Cash",
  bank: "Bank transfer",
  card: "Card",
  cheque: "Cheque",
  other: "Other",
};

export const REIMBURSEMENT = ["not_needed", "pending", "reimbursed"] as const;
export type Reimbursement = (typeof REIMBURSEMENT)[number];

export const REIMBURSEMENT_LABEL: Record<Reimbursement, string> = {
  not_needed: "No refund needed",
  pending: "Still owed",
  reimbursed: "Reimbursed",
};

/** The heads the committee has used before, offered as suggestions. */
export const HEADS = [
  "Pratima",
  "Pandal",
  "Decoration",
  "Priest and rituals",
  "Bhog and prasad",
  "Dhaki and musicians",
  "Sound and lighting",
  "Cultural programme",
  "Magazine",
  "Permissions",
  "Transport",
  "Printing",
  "Food and refreshments",
  "Miscellaneous",
];

/* ------------------------------------------------------------------
   The row
   ------------------------------------------------------------------ */

export type Expense = {
  id: string;
  head: string;
  description: string | null;
  amount: number;
  spent_on: string | null;
  vendor: string | null;
  bill_url: string | null;
  published: boolean;
  created_at: string;
  // Added by supabase/migrations/2026-10-12-expense-ledger.sql. Absent
  // until that has been run, so every reader treats them as optional.
  invoice_no?: string | null;
  paid_from?: PaidFrom | null;
  paid_by_name?: string | null;
  paid_by_contact?: string | null;
  payment_mode?: PaymentMode | null;
  payment_ref?: string | null;
  reimbursement_status?: Reimbursement | null;
  reimbursed_amount?: number | null;
  reimbursed_on?: string | null;
  reimbursed_mode?: PaymentMode | null;
  reimbursed_ref?: string | null;
  reimbursed_by?: string | null;
  approved_by?: string | null;
  receipt_keys?: string[] | null;
  notes?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
};

/** What the table had before the ledger migration. */
export const LEGACY_COLUMNS = [
  "id",
  "head",
  "description",
  "amount",
  "spent_on",
  "vendor",
  "bill_url",
  "published",
  "created_at",
] as const;

/** Everything the console reads once the migration has run. */
export const LEDGER_COLUMNS = [
  ...LEGACY_COLUMNS,
  "invoice_no",
  "paid_from",
  "paid_by_name",
  "paid_by_contact",
  "payment_mode",
  "payment_ref",
  "reimbursement_status",
  "reimbursed_amount",
  "reimbursed_on",
  "reimbursed_mode",
  "reimbursed_ref",
  "reimbursed_by",
  "approved_by",
  "receipt_keys",
  "notes",
  "created_by",
  "updated_by",
  "updated_at",
] as const;

export const MIGRATION_MESSAGE =
  "The expense ledger needs its database update: run supabase/migrations/2026-10-12-expense-ledger.sql in the Supabase SQL editor.";

/**
 * True when Postgres or PostgREST says a column does not exist: 42703 on
 * a read that names it, PGRST204 on a write that sets it. Either means
 * the ledger migration has not been run yet.
 */
export function missingColumn(
  error: { code?: string | null; message?: string | null } | null | undefined,
): boolean {
  if (!error) return false;
  if (error.code === "42703" || error.code === "PGRST204") return true;
  return /column .* does not exist|could not find the '[a-z_]+' column/i.test(error.message ?? "");
}

/** The status a row is in, reading a pre-migration row as "not needed". */
export function statusOf(e: Pick<Expense, "reimbursement_status">): Reimbursement {
  return e.reimbursement_status ?? "not_needed";
}

/** Postgres hands numerics back as strings; the console wants numbers. */
export function normaliseExpense(row: Record<string, unknown>): Expense {
  const e = row as unknown as Expense;
  return {
    ...e,
    amount: Number(e.amount),
    reimbursed_amount:
      e.reimbursed_amount === null || e.reimbursed_amount === undefined
        ? (e.reimbursed_amount ?? null)
        : Number(e.reimbursed_amount),
    receipt_keys: Array.isArray(e.receipt_keys) ? e.receipt_keys : e.receipt_keys === undefined ? undefined : [],
  };
}

/* ------------------------------------------------------------------
   Validation, at the trust boundary
   ------------------------------------------------------------------ */

export const LIMITS = {
  head: 80,
  description: 300,
  vendor: 120,
  invoice_no: 60,
  bill_url: 400,
  paid_by_name: 120,
  paid_by_contact: 160,
  payment_ref: 80,
  reimbursed_ref: 80,
  notes: 2000,
} as const;

/** Above this an amount is taken to be a typo, as on the donations side. */
export const MAX_AMOUNT = 10_000_000;

export function isUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

/** Thrown inside the readers and turned into the sentence they return. */
class Invalid extends Error {}

// Control characters other than a line break; Postgres refuses NUL outright.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * One text field: absent or blank is null, anything that is not text is
 * refused, and anything longer than the column is meant to hold is
 * refused rather than quietly cut, because a truncated invoice number is
 * worse than none.
 */
function text(
  body: Record<string, unknown>,
  key: string,
  label: string,
  max: number,
  multiline = false,
): string | null {
  const v = body[key];
  if (v === undefined || v === null) return null;
  if (typeof v !== "string" && typeof v !== "number") throw new Invalid(`${label} must be text.`);
  let s = String(v).replace(CONTROL, "");
  s = multiline ? s.replace(/\r\n?/g, "\n") : s.replace(/[\r\n\t]+/g, " ");
  s = s.trim();
  if (s.length > max) throw new Invalid(`${label} is too long. Keep it to ${max} characters.`);
  return s || null;
}

function oneOf<T extends string>(
  v: unknown,
  allowed: readonly T[],
  message: string,
): T | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string" || !(allowed as readonly string[]).includes(v)) throw new Invalid(message);
  return v as T;
}

/**
 * An amount in rupees: a number, or a string of digits from a form.
 * Refuses blank, NaN, Infinity, negatives and anything past MAX_AMOUNT,
 * and rounds to the paisa.
 */
export function readAmount(v: unknown, label = "The amount"): number | string {
  if (typeof v === "string") v = v.trim();
  if (v === "" || v === undefined || v === null) return `${label} is missing.`;
  if (typeof v !== "number" && typeof v !== "string") return `${label} must be a number.`;
  if (typeof v === "string" && !/^-?\d+(\.\d+)?$/.test(v)) {
    return `${label} must be a number in rupees, like 1250 or 1250.50.`;
  }
  const n = Number(v);
  if (!Number.isFinite(n)) return `${label} must be a number.`;
  if (n < 0) return `${label} cannot be negative.`;
  if (n > MAX_AMOUNT) return `${label} looks like a typo: it is over one crore.`;
  return Math.round(n * 100) / 100;
}

/**
 * A calendar date written YYYY-MM-DD, or null. Rejects shapes that are
 * not dates, dates the calendar does not have (31 April, 30 February)
 * and years outside 2000 to 2100, which are always slips of the finger.
 */
export function isoDate(v: unknown): string | null {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  if (y < 2000 || y > 2100) return null;
  const t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return null;
  return v;
}

/** A phone number (8 to 15 digits, spaces and dashes allowed) or an email. */
export function contactLooksRight(s: string): boolean {
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) return true;
  if (!/^\+?[\d\s()-]+$/.test(s)) return false;
  const digits = s.replace(/\D/g, "").length;
  return digits >= 8 && digits <= 15;
}

export type ExpenseFields = {
  head: string;
  description: string | null;
  amount: number;
  spent_on: string | null;
  vendor: string | null;
  invoice_no: string | null;
  bill_url: string | null;
  published: boolean;
  paid_from: PaidFrom;
  paid_by_name: string | null;
  paid_by_contact: string | null;
  payment_mode: PaymentMode | null;
  payment_ref: string | null;
  reimbursement_status: Reimbursement;
  notes: string | null;
};

/**
 * The details of one expense, for entering and for editing. Returns the
 * clean fields or a sentence saying what is wrong.
 *
 * `settled` says the row has already been marked reimbursed. Its status
 * then stays "reimbursed": a repayment is recorded and undone only with
 * its own actions, so that who settled it is never lost in an edit.
 */
export function readExpense(
  body: Record<string, unknown> | null | undefined,
  opts: { settled?: boolean } = {},
): ExpenseFields | string {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Could not read that.";
  try {
    const head = text(body, "head", "The head", LIMITS.head);
    if (!head) return "Give the expense a head, like Pandal or Bhog.";

    const amount = readAmount(body.amount);
    if (typeof amount === "string") return amount;

    let spent_on: string | null = null;
    if (body.spent_on !== undefined && body.spent_on !== null && body.spent_on !== "") {
      spent_on = isoDate(body.spent_on);
      if (!spent_on) return "The date paid is not a real date.";
    }

    let bill_url = text(body, "bill_url", "The bill link", LIMITS.bill_url);
    if (bill_url) {
      let ok = false;
      try {
        const u = new URL(bill_url);
        ok = u.protocol === "https:" || u.protocol === "http:";
      } catch {
        ok = false;
      }
      if (!ok) return "The bill link must be a web address starting with https://.";
      bill_url = bill_url.slice(0, LIMITS.bill_url);
    }

    const paid_from =
      oneOf(body.paid_from, PAID_FROM, "Say who paid the vendor: the committee account, a member, a sponsor or someone else.") ??
      "committee_account";

    const paid_by_name = text(body, "paid_by_name", "The payer's name", LIMITS.paid_by_name);
    const paid_by_contact = text(body, "paid_by_contact", "The payer's contact", LIMITS.paid_by_contact);
    if (paid_by_contact && !contactLooksRight(paid_by_contact)) {
      return "The payer's contact should be a phone number or an email address.";
    }

    const payment_mode = oneOf(body.payment_mode, PAYMENT_MODES, "Unknown payment mode.");

    let reimbursement_status: Reimbursement;
    if (opts.settled) {
      if (paid_from === "committee_account") {
        return "This one is already marked reimbursed. Undo the reimbursement before saying the committee account paid.";
      }
      reimbursement_status = "reimbursed";
    } else {
      const asked = oneOf(body.reimbursement_status, REIMBURSEMENT, "Unknown reimbursement status.");
      if (asked === "reimbursed") {
        return "Save the expense first, then use “Mark reimbursed” to record the repayment.";
      }
      reimbursement_status = asked ?? (paid_from === "member" ? "pending" : "not_needed");
    }

    if (paid_from === "committee_account" && reimbursement_status === "pending") {
      return "The committee account paid, so nobody is owed a refund.";
    }
    if (paid_from === "member" && !paid_by_name) {
      return "Say which member paid, so the committee knows whom to repay.";
    }
    if (reimbursement_status === "pending" && !paid_by_name) {
      return "Say who paid, so the committee knows whom to repay.";
    }

    return {
      head,
      description: text(body, "description", "The detail", LIMITS.description, true),
      amount,
      spent_on,
      vendor: text(body, "vendor", "The vendor", LIMITS.vendor),
      invoice_no: text(body, "invoice_no", "The bill number", LIMITS.invoice_no),
      bill_url,
      published: !(body.published === false || body.published === "false"),
      paid_from,
      paid_by_name,
      paid_by_contact,
      payment_mode,
      payment_ref: text(body, "payment_ref", "The payment reference", LIMITS.payment_ref),
      reimbursement_status,
      notes: text(body, "notes", "The notes", LIMITS.notes, true),
    };
  } catch (e) {
    if (e instanceof Invalid) return e.message;
    throw e;
  }
}

export type Settlement = {
  reimbursed_amount: number;
  reimbursed_on: string;
  reimbursed_mode: PaymentMode;
  reimbursed_ref: string | null;
};

/**
 * A repayment to whoever paid from their own pocket. The amount defaults
 * to the whole expense and may be less (the rest is then taken as given
 * to the Puja) but never more. `today` is the date in India, so a
 * repayment cannot be dated tomorrow.
 */
export function readSettlement(
  body: Record<string, unknown> | null | undefined,
  expenseAmount: number,
  today: string,
): Settlement | string {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Could not read that.";
  try {
    let amount: number;
    const raw = body.reimbursed_amount;
    if (raw === undefined || raw === null || raw === "") {
      amount = expenseAmount;
    } else {
      const n = readAmount(raw, "The amount repaid");
      if (typeof n === "string") return n;
      amount = n;
    }
    if (!(amount > 0)) return "Enter the amount repaid.";
    if (amount > expenseAmount) return "That is more than the expense itself.";

    const on = isoDate(body.reimbursed_on);
    if (!on) return "Give the date they were repaid.";
    if (on > today) return "The repayment date is in the future.";

    const mode = oneOf(body.reimbursed_mode, PAYMENT_MODES, "Unknown payment mode.");
    if (!mode) return "Say how they were repaid: UPI, cash, bank transfer and so on.";

    return {
      reimbursed_amount: amount,
      reimbursed_on: on,
      reimbursed_mode: mode,
      reimbursed_ref: text(body, "reimbursed_ref", "The repayment reference", LIMITS.reimbursed_ref),
    };
  } catch (e) {
    if (e instanceof Invalid) return e.message;
    throw e;
  }
}

/* ------------------------------------------------------------------
   Bills and receipts, in the private proofs bucket
   ------------------------------------------------------------------ */

/**
 * Four megabytes a file. Vercel refuses a request body over 4.5 MB
 * before this code ever sees it, so the console sends one file per
 * request and checks the size in the browser first.
 */
export const MAX_RECEIPT_BYTES = 4 * 1024 * 1024;
export const MAX_RECEIPTS = 12;

export const RECEIPT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
};

export const RECEIPT_ACCEPT = [...Object.keys(RECEIPT_TYPES), ".heic", ".heif"].join(",");

const EXTENSION_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

/**
 * The type a file claims, falling back to its extension: Windows hands
 * an iPhone's .heic photo over with no type at all.
 */
export function claimedType(type: string | null | undefined, name: string | null | undefined): string | null {
  if (type && RECEIPT_TYPES[type]) return type;
  if (type && type !== "application/octet-stream") return null;
  const ext = (name ?? "").split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TYPES[ext] ?? null;
}

export function megabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

/** A plain sentence if the file cannot be a bill, or null if it can. */
export function checkReceiptFile(file: { size: number; type?: string | null; name?: string | null }): string | null {
  if (!Number.isFinite(file.size) || file.size <= 0) return "That file is empty.";
  if (file.size > MAX_RECEIPT_BYTES) {
    return `${file.name ? `“${file.name}”` : "That file"} is ${megabytes(file.size)} MB. Each bill can be at most 4 MB: take the photo again at a lower resolution, or save the PDF at a smaller size.`;
  }
  if (!claimedType(file.type, file.name)) {
    return "Upload a photo of the bill (JPEG, PNG, WebP or HEIC) or a PDF.";
  }
  return null;
}

/**
 * What the first bytes of a file say it is. The browser's word for the
 * type is the uploader's word, so the server checks the bytes too.
 */
export function sniffType(head: Uint8Array): string | null {
  const b = head;
  const at = (i: number, s: string) => [...s].every((c, j) => b[i + j] === c.charCodeAt(0));
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && at(1, "PNG")) return "image/png";
  if (b.length >= 12 && at(0, "RIFF") && at(8, "WEBP")) return "image/webp";
  if (b.length >= 5 && at(0, "%PDF-")) return "application/pdf";
  // ISO base media (HEIC/HEIF): a box size, then "ftyp".
  if (b.length >= 12 && at(4, "ftyp")) return "image/heic";
  return null;
}

/** The type to store a file as, or null when its bytes disagree with its claim. */
export function receiptType(claimed: string | null, head: Uint8Array): string | null {
  const sniffed = sniffType(head);
  if (!claimed || !sniffed) return null;
  const family = (t: string) => (t === "image/heif" ? "image/heic" : t);
  return family(claimed) === family(sniffed) ? claimed : null;
}

/** Where a bill for this expense lives in the bucket. */
export function receiptKey(expenseId: string, type: string, stamp = Date.now(), nonce = crypto.randomUUID()): string {
  return `expenses/${expenseId}/${stamp}-${nonce}.${RECEIPT_TYPES[type] ?? "bin"}`;
}

/** The file's type, read back from its key, for choosing an icon. */
export function receiptKind(key: string): "image" | "pdf" | "heic" {
  const ext = key.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "heic" || ext === "heif") return "heic";
  return "image";
}

/* ------------------------------------------------------------------
   Totals, people owed, filters and sorting, for the console
   ------------------------------------------------------------------ */

/** "Arnab  Ghosh" and "arnab ghosh" are the same person. */
export function payerKey(name: string | null | undefined): string {
  return (name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function repaidAmount(e: Expense): number {
  if (statusOf(e) !== "reimbursed") return 0;
  return e.reimbursed_amount ?? e.amount;
}

export type LedgerTotals = {
  count: number;
  spent: number;
  committee: number;
  members: number;
  sponsors: number;
  others: number;
  unrecorded: number;
  reimbursed: number;
  owed: number;
  owedCount: number;
  withoutBill: number;
};

export function ledgerTotals(rows: Expense[]): LedgerTotals {
  const t: LedgerTotals = {
    count: rows.length,
    spent: 0,
    committee: 0,
    members: 0,
    sponsors: 0,
    others: 0,
    unrecorded: 0,
    reimbursed: 0,
    owed: 0,
    owedCount: 0,
    withoutBill: 0,
  };
  for (const e of rows) {
    t.spent += e.amount;
    if (e.paid_from === "committee_account") t.committee += e.amount;
    else if (e.paid_from === "member") t.members += e.amount;
    else if (e.paid_from === "sponsor") t.sponsors += e.amount;
    else if (e.paid_from === "other") t.others += e.amount;
    else t.unrecorded += e.amount;
    t.reimbursed += repaidAmount(e);
    if (statusOf(e) === "pending") {
      t.owed += e.amount;
      t.owedCount += 1;
    }
    if (!(e.receipt_keys?.length || e.bill_url)) t.withoutBill += 1;
  }
  // Sums of paise in floating point drift; the ledger is in paise.
  for (const k of Object.keys(t) as (keyof LedgerTotals)[]) t[k] = Math.round(t[k] * 100) / 100;
  return t;
}

export type OwedPerson = {
  key: string;
  name: string;
  contact: string | null;
  count: number;
  owed: number;
  repaid: number;
};

/** Everyone still owed money, most owed first. */
export function owedByPerson(rows: Expense[]): OwedPerson[] {
  const people = new Map<string, OwedPerson>();
  for (const e of rows) {
    const key = payerKey(e.paid_by_name);
    if (!key) continue;
    const status = statusOf(e);
    if (status === "not_needed") continue;
    const p = people.get(key) ?? {
      key,
      name: e.paid_by_name!.trim().replace(/\s+/g, " "),
      contact: null,
      count: 0,
      owed: 0,
      repaid: 0,
    };
    p.contact ??= e.paid_by_contact ?? null;
    if (status === "pending") {
      p.count += 1;
      p.owed += e.amount;
    } else {
      p.repaid += repaidAmount(e);
    }
    people.set(key, p);
  }
  return [...people.values()]
    .filter((p) => p.count > 0)
    .map((p) => ({ ...p, owed: Math.round(p.owed * 100) / 100, repaid: Math.round(p.repaid * 100) / 100 }))
    .sort((a, b) => b.owed - a.owed || a.name.localeCompare(b.name));
}

export type LedgerFilter = {
  head?: string;
  paidFrom?: PaidFrom | "unrecorded" | "";
  status?: Reimbursement | "";
  payer?: string;
  from?: string;
  to?: string;
  q?: string;
};

export function filterLedger(rows: Expense[], f: LedgerFilter): Expense[] {
  const q = (f.q ?? "").trim().toLowerCase();
  const head = (f.head ?? "").trim().toLowerCase();
  const payer = payerKey(f.payer);
  const from = isoDate(f.from);
  const to = isoDate(f.to);
  return rows.filter((e) => {
    if (head && e.head.trim().toLowerCase() !== head) return false;
    if (f.paidFrom === "unrecorded") {
      if (e.paid_from) return false;
    } else if (f.paidFrom && e.paid_from !== f.paidFrom) {
      return false;
    }
    if (f.status && statusOf(e) !== f.status) return false;
    if (payer && payerKey(e.paid_by_name) !== payer) return false;
    if (from && (!e.spent_on || e.spent_on < from)) return false;
    if (to && (!e.spent_on || e.spent_on > to)) return false;
    if (q) {
      const hay = [
        e.head,
        e.description,
        e.vendor,
        e.invoice_no,
        e.paid_by_name,
        e.payment_ref,
        e.reimbursed_ref,
        e.notes,
        e.approved_by,
        e.created_by,
        String(e.amount),
      ]
        .filter(Boolean)
        .join(" \u0001 ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export type SortKey = "spent_on" | "amount" | "head" | "vendor" | "payer" | "status" | "created_at";
export type SortDir = "asc" | "desc";

const STATUS_ORDER: Record<Reimbursement, number> = { pending: 0, reimbursed: 1, not_needed: 2 };

export function sortLedger(rows: Expense[], key: SortKey, dir: SortDir): Expense[] {
  const sign = dir === "asc" ? 1 : -1;
  const text = (s: string | null | undefined) => (s ?? "").toLowerCase();
  const cmp = (a: Expense, b: Expense): number => {
    switch (key) {
      case "amount":
        return a.amount - b.amount;
      case "head":
        return text(a.head).localeCompare(text(b.head));
      case "vendor":
        return text(a.vendor).localeCompare(text(b.vendor));
      case "payer":
        return text(a.paid_by_name).localeCompare(text(b.paid_by_name));
      case "status":
        return STATUS_ORDER[statusOf(a)] - STATUS_ORDER[statusOf(b)];
      case "created_at":
        return a.created_at.localeCompare(b.created_at);
      case "spent_on":
      default:
        // Undated lines sort as the oldest.
        return (a.spent_on ?? "").localeCompare(b.spent_on ?? "");
    }
  };
  // Ties fall back to the order they were entered, newest first, so the
  // list does not shuffle between refreshes.
  return [...rows].sort((a, b) => cmp(a, b) * sign || b.created_at.localeCompare(a.created_at));
}

/* ------------------------------------------------------------------
   The auditors' file
   ------------------------------------------------------------------ */

const CSV_COLUMNS: { label: string; value: (e: Expense) => unknown }[] = [
  { label: "Date paid", value: (e) => e.spent_on },
  { label: "Head", value: (e) => e.head },
  { label: "Detail", value: (e) => e.description },
  { label: "Vendor", value: (e) => e.vendor },
  { label: "Bill number", value: (e) => e.invoice_no },
  { label: "Amount (INR)", value: (e) => e.amount.toFixed(2) },
  { label: "Paid from", value: (e) => (e.paid_from ? PAID_FROM_SHORT[e.paid_from] : "") },
  { label: "Paid by", value: (e) => e.paid_by_name },
  { label: "Payer contact", value: (e) => e.paid_by_contact },
  { label: "Payment mode", value: (e) => (e.payment_mode ? PAYMENT_MODE_LABEL[e.payment_mode] : "") },
  { label: "Payment reference", value: (e) => e.payment_ref },
  { label: "Reimbursement", value: (e) => REIMBURSEMENT_LABEL[statusOf(e)] },
  { label: "Amount repaid (INR)", value: (e) => (statusOf(e) === "reimbursed" ? repaidAmount(e).toFixed(2) : "") },
  { label: "Repaid on", value: (e) => e.reimbursed_on },
  { label: "Repaid by", value: (e) => (e.reimbursed_mode ? PAYMENT_MODE_LABEL[e.reimbursed_mode] : "") },
  { label: "Repayment reference", value: (e) => e.reimbursed_ref },
  { label: "Repayment recorded by", value: (e) => e.reimbursed_by },
  { label: "Approved by", value: (e) => e.approved_by },
  { label: "Bills attached", value: (e) => e.receipt_keys?.length ?? 0 },
  { label: "Bill link", value: (e) => e.bill_url },
  { label: "Published", value: (e) => (e.published ? "yes" : "no") },
  { label: "Notes", value: (e) => e.notes },
  { label: "Entered by", value: (e) => e.created_by },
  { label: "Entered at", value: (e) => e.created_at },
  { label: "Last changed by", value: (e) => e.updated_by },
  { label: "Last changed at", value: (e) => e.updated_at },
  { label: "Id", value: (e) => e.id },
];

export function expensesCsv(rows: Expense[]): string {
  const records = rows.map((e) =>
    Object.fromEntries(CSV_COLUMNS.map((c, i) => [String(i), c.value(e)])),
  );
  return toCsv(
    records,
    CSV_COLUMNS.map((c, i) => ({ key: String(i), label: c.label })),
  );
}
