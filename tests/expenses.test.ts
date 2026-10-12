/**
 * The expense ledger's rules: what the server accepts at its edge, the
 * totals the committee reads, and the auditors' spreadsheet.
 *
 * Every name and number here is invented.
 */
import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "@/lib/csv";
import {
  LIMITS,
  MAX_RECEIPT_BYTES,
  MIGRATION_MESSAGE,
  checkReceiptFile,
  claimedType,
  contactLooksRight,
  expensesCsv,
  filterLedger,
  isUuid,
  isoDate,
  ledgerTotals,
  missingColumn,
  normaliseExpense,
  owedByPerson,
  readAmount,
  readExpense,
  readSettlement,
  receiptKey,
  receiptType,
  sniffType,
  sortLedger,
  type Expense,
} from "@/lib/expenses";

const VALID = {
  head: "Pandal",
  amount: 12500,
  spent_on: "2026-10-10",
  vendor: "Test Decorators",
  paid_from: "committee_account",
};

const MEMBER = {
  ...VALID,
  paid_from: "member",
  paid_by_name: "Test Member",
  paid_by_contact: "5550100009",
};

/* ================================================================
   Amounts
   ================================================================ */

describe("readAmount", () => {
  it("takes numbers and digit strings, rounded to the paisa", () => {
    expect(readAmount(1250)).toBe(1250);
    expect(readAmount("1250.50")).toBe(1250.5);
    expect(readAmount("  99 ")).toBe(99);
    expect(readAmount(10.005)).toBe(10.01);
    expect(readAmount(0)).toBe(0);
  });

  it("refuses negatives", () => {
    expect(readAmount(-1)).toMatch(/negative/);
    expect(readAmount("-500")).toMatch(/negative/);
  });

  it("refuses NaN, Infinity and things that are not numbers", () => {
    for (const v of [NaN, Infinity, -Infinity, "NaN", "Infinity", "abc", "1e5", "1,200", "12.5.1", true, {}, []]) {
      expect(typeof readAmount(v), String(v)).toBe("string");
    }
  });

  it("refuses a blank amount rather than reading it as zero", () => {
    for (const v of ["", "   ", null, undefined]) expect(readAmount(v)).toMatch(/missing/);
  });

  it("calls anything over a crore a typo", () => {
    expect(readAmount(10_000_000)).toBe(10_000_000);
    expect(readAmount(10_000_001)).toMatch(/typo/);
  });
});

/* ================================================================
   Dates
   ================================================================ */

describe("isoDate", () => {
  it("accepts real calendar dates", () => {
    expect(isoDate("2026-10-12")).toBe("2026-10-12");
    expect(isoDate("2028-02-29")).toBe("2028-02-29");
  });

  it("refuses dates the calendar does not have", () => {
    for (const d of ["2026-02-29", "2026-02-30", "2026-04-31", "2026-13-01", "2026-00-10", "2026-10-00"]) {
      expect(isoDate(d), d).toBeNull();
    }
  });

  it("refuses other shapes and other types", () => {
    for (const d of ["12-10-2026", "2026/10/12", "2026-1-5", "20261012", "", " 2026-10-12", 20261012, null, undefined]) {
      expect(isoDate(d), String(d)).toBeNull();
    }
  });

  it("refuses years that can only be slips of the finger", () => {
    expect(isoDate("1999-12-31")).toBeNull();
    expect(isoDate("2101-01-01")).toBeNull();
    expect(isoDate("0026-10-12")).toBeNull();
  });
});

/* ================================================================
   One line of the ledger
   ================================================================ */

describe("readExpense", () => {
  it("accepts a plain line paid from the committee account", () => {
    const f = readExpense(VALID);
    expect(typeof f).toBe("object");
    if (typeof f === "string") return;
    expect(f).toMatchObject({
      head: "Pandal",
      amount: 12500,
      spent_on: "2026-10-10",
      paid_from: "committee_account",
      reimbursement_status: "not_needed",
      published: true,
    });
  });

  it("takes a member who paid from their pocket as owed, unless told otherwise", () => {
    const f = readExpense(MEMBER);
    if (typeof f === "string") throw new Error(f);
    expect(f.reimbursement_status).toBe("pending");
    expect(f.paid_by_name).toBe("Test Member");

    const waived = readExpense({ ...MEMBER, reimbursement_status: "not_needed" });
    if (typeof waived === "string") throw new Error(waived);
    expect(waived.reimbursement_status).toBe("not_needed");
  });

  it("needs to know which member paid", () => {
    expect(readExpense({ ...MEMBER, paid_by_name: "" })).toMatch(/which member/);
    expect(readExpense({ ...VALID, paid_from: "other", reimbursement_status: "pending" })).toMatch(/who paid/);
  });

  it("refuses a refund owed on money the committee account paid", () => {
    expect(readExpense({ ...VALID, reimbursement_status: "pending" })).toMatch(/nobody is owed/);
  });

  it("refuses setting 'reimbursed' through an edit: that has its own action", () => {
    expect(readExpense({ ...MEMBER, reimbursement_status: "reimbursed" })).toMatch(/Mark reimbursed/);
  });

  it("keeps a settled line settled, and will not hand it to the committee account", () => {
    const f = readExpense({ ...MEMBER, reimbursement_status: "pending" }, { settled: true });
    if (typeof f === "string") throw new Error(f);
    expect(f.reimbursement_status).toBe("reimbursed");
    expect(readExpense(VALID, { settled: true })).toMatch(/Undo the reimbursement/);
  });

  it("refuses unknown enums", () => {
    expect(readExpense({ ...VALID, paid_from: "bank" })).toMatch(/who paid the vendor/);
    expect(readExpense({ ...VALID, paid_from: "COMMITTEE_ACCOUNT" })).toMatch(/who paid the vendor/);
    expect(readExpense({ ...VALID, payment_mode: "crypto" })).toMatch(/payment mode/);
    expect(readExpense({ ...MEMBER, reimbursement_status: "maybe" })).toMatch(/reimbursement status/);
    expect(readExpense({ ...VALID, payment_mode: 3 })).toMatch(/payment mode/);
  });

  it("refuses bad amounts and dates", () => {
    expect(readExpense({ ...VALID, amount: -5 })).toMatch(/negative/);
    expect(readExpense({ ...VALID, amount: NaN })).toMatch(/number/);
    expect(readExpense({ ...VALID, amount: "" })).toMatch(/missing/);
    expect(readExpense({ ...VALID, spent_on: "2026-02-30" })).toMatch(/not a real date/);
    expect(readExpense({ ...VALID, spent_on: "yesterday" })).toMatch(/not a real date/);
  });

  it("allows no date at all", () => {
    const f = readExpense({ ...VALID, spent_on: "" });
    if (typeof f === "string") throw new Error(f);
    expect(f.spent_on).toBeNull();
  });

  it("refuses over-long text rather than cutting it", () => {
    expect(readExpense({ ...VALID, head: "x".repeat(LIMITS.head + 1) })).toMatch(/too long/);
    expect(readExpense({ ...VALID, invoice_no: "9".repeat(LIMITS.invoice_no + 1) })).toMatch(/too long/);
    expect(readExpense({ ...VALID, notes: "n".repeat(LIMITS.notes + 1) })).toMatch(/too long/);
    expect(readExpense({ ...MEMBER, paid_by_name: "m".repeat(LIMITS.paid_by_name + 1) })).toMatch(/too long/);
    const f = readExpense({ ...VALID, head: "x".repeat(LIMITS.head) });
    expect(typeof f).toBe("object");
  });

  it("refuses text fields that are not text", () => {
    expect(readExpense({ ...VALID, vendor: { $ne: 1 } })).toMatch(/must be text/);
    expect(readExpense({ ...VALID, head: ["Pandal"] })).toMatch(/must be text/);
  });

  it("needs a head, and refuses a body that is not an object", () => {
    expect(readExpense({ ...VALID, head: "   " })).toMatch(/head/);
    expect(readExpense(null)).toMatch(/Could not read/);
    expect(readExpense([] as unknown as Record<string, unknown>)).toMatch(/Could not read/);
  });

  it("strips control characters and folds single-line fields", () => {
    const f = readExpense({ ...VALID, head: "Pan\u0000dal", vendor: "Test\r\nDecorators", notes: "line one\r\nline two" });
    if (typeof f === "string") throw new Error(f);
    expect(f.head).toBe("Pandal");
    expect(f.vendor).toBe("Test Decorators");
    expect(f.notes).toBe("line one\nline two");
  });

  it("checks the payer's contact is a phone number or an email", () => {
    expect(readExpense({ ...MEMBER, paid_by_contact: "not a contact" })).toMatch(/phone number or an email/);
    expect(typeof readExpense({ ...MEMBER, paid_by_contact: "member@example.org" })).toBe("object");
    expect(typeof readExpense({ ...MEMBER, paid_by_contact: "+91 55501 00009" })).toBe("object");
    expect(contactLooksRight("123")).toBe(false);
    expect(contactLooksRight("javascript:alert(1)")).toBe(false);
  });

  it("only takes a web address as the bill link", () => {
    expect(readExpense({ ...VALID, bill_url: "javascript:alert(1)" })).toMatch(/web address/);
    expect(readExpense({ ...VALID, bill_url: "not a url" })).toMatch(/web address/);
    const f = readExpense({ ...VALID, bill_url: "https://example.org/bill.pdf" });
    if (typeof f === "string") throw new Error(f);
    expect(f.bill_url).toBe("https://example.org/bill.pdf");
  });

  it("unpublishes only when told to", () => {
    const off = readExpense({ ...VALID, published: false });
    const on = readExpense({ ...VALID });
    if (typeof off === "string" || typeof on === "string") throw new Error("unexpected");
    expect(off.published).toBe(false);
    expect(on.published).toBe(true);
  });
});

/* ================================================================
   Repaying a member
   ================================================================ */

describe("readSettlement", () => {
  const today = "2026-10-12";

  it("defaults to the whole amount", () => {
    expect(readSettlement({ reimbursed_on: today, reimbursed_mode: "upi" }, 500, today)).toEqual({
      reimbursed_amount: 500,
      reimbursed_on: today,
      reimbursed_mode: "upi",
      reimbursed_ref: null,
    });
  });

  it("allows less than the whole amount, never more, never nothing", () => {
    const part = readSettlement({ reimbursed_amount: "300", reimbursed_on: today, reimbursed_mode: "cash" }, 500, today);
    expect(part).toMatchObject({ reimbursed_amount: 300 });
    expect(readSettlement({ reimbursed_amount: 501, reimbursed_on: today, reimbursed_mode: "upi" }, 500, today)).toMatch(
      /more than the expense/,
    );
    expect(readSettlement({ reimbursed_amount: 0, reimbursed_on: today, reimbursed_mode: "upi" }, 500, today)).toMatch(
      /amount repaid/,
    );
    expect(readSettlement({ reimbursed_amount: -1, reimbursed_on: today, reimbursed_mode: "upi" }, 500, today)).toMatch(
      /negative/,
    );
    expect(readSettlement({ reimbursed_amount: "NaN", reimbursed_on: today, reimbursed_mode: "upi" }, 500, today)).toMatch(
      /number/,
    );
  });

  it("needs a real date that is not in the future", () => {
    expect(readSettlement({ reimbursed_mode: "upi" }, 500, today)).toMatch(/date/);
    expect(readSettlement({ reimbursed_on: "2026-02-30", reimbursed_mode: "upi" }, 500, today)).toMatch(/date/);
    expect(readSettlement({ reimbursed_on: "2026-10-13", reimbursed_mode: "upi" }, 500, today)).toMatch(/future/);
  });

  it("needs a known mode", () => {
    expect(readSettlement({ reimbursed_on: today }, 500, today)).toMatch(/how they were repaid/);
    expect(readSettlement({ reimbursed_on: today, reimbursed_mode: "barter" }, 500, today)).toMatch(/payment mode/);
  });

  it("refuses an over-long reference", () => {
    expect(
      readSettlement({ reimbursed_on: today, reimbursed_mode: "upi", reimbursed_ref: "r".repeat(LIMITS.reimbursed_ref + 1) }, 500, today),
    ).toMatch(/too long/);
  });
});

/* ================================================================
   Bills
   ================================================================ */

describe("checkReceiptFile", () => {
  it("accepts photos and PDFs up to four megabytes", () => {
    expect(checkReceiptFile({ size: MAX_RECEIPT_BYTES, type: "image/jpeg", name: "bill.jpg" })).toBeNull();
    expect(checkReceiptFile({ size: 1000, type: "application/pdf", name: "bill.pdf" })).toBeNull();
    // Windows hands over an iPhone photo with no type.
    expect(checkReceiptFile({ size: 1000, type: "", name: "IMG_0001.HEIC" })).toBeNull();
  });

  it("refuses an oversize file in plain words", () => {
    const msg = checkReceiptFile({ size: MAX_RECEIPT_BYTES + 1, type: "image/jpeg", name: "big.jpg" });
    expect(msg).toMatch(/at most 4 MB/);
    expect(msg).toMatch(/big\.jpg/);
    expect(checkReceiptFile({ size: 9 * 1024 * 1024, type: "application/pdf" })).toMatch(/9\.0 MB/);
  });

  it("refuses empty files and anything that is not a photo or a PDF", () => {
    expect(checkReceiptFile({ size: 0, type: "image/png" })).toMatch(/empty/);
    expect(checkReceiptFile({ size: NaN, type: "image/png" })).toMatch(/empty/);
    for (const [type, name] of [
      ["application/x-msdownload", "setup.exe"],
      ["image/svg+xml", "bill.svg"],
      ["text/html", "bill.html"],
      ["", "bill.exe"],
      ["application/octet-stream", "bill"],
    ]) {
      expect(checkReceiptFile({ size: 10, type, name }), name).toMatch(/photo of the bill/);
    }
  });

  it("does not let an extension override a type the browser did give", () => {
    expect(claimedType("text/html", "bill.pdf")).toBeNull();
    expect(claimedType("", "bill.pdf")).toBe("application/pdf");
  });
});

describe("sniffType and receiptType", () => {
  const bytes = (...xs: (number | string)[]) =>
    new Uint8Array(xs.flatMap((x) => (typeof x === "number" ? [x] : [...x].map((c) => c.charCodeAt(0)))));

  it("knows the formats by their first bytes", () => {
    expect(sniffType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffType(bytes(0x89, "PNG", 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(sniffType(bytes("RIFF", 0, 0, 0, 0, "WEBP"))).toBe("image/webp");
    expect(sniffType(bytes("%PDF-1.7"))).toBe("application/pdf");
    expect(sniffType(bytes(0, 0, 0, 24, "ftypheic"))).toBe("image/heic");
    expect(sniffType(bytes("<html>"))).toBeNull();
    expect(sniffType(bytes("MZ"))).toBeNull();
  });

  it("refuses a file whose bytes disagree with its claimed type", () => {
    expect(receiptType("image/png", bytes("%PDF-1.4"))).toBeNull();
    expect(receiptType("application/pdf", bytes("<html><script>"))).toBeNull();
    expect(receiptType("application/pdf", bytes("%PDF-1.4"))).toBe("application/pdf");
    expect(receiptType("image/heif", bytes(0, 0, 0, 24, "ftypmif1"))).toBe("image/heif");
    expect(receiptType(null, bytes("%PDF-1.4"))).toBeNull();
  });

  it("files a bill under its expense, named by its type and never by the uploader", () => {
    const id = "00000000-0000-4000-8000-000000000001";
    expect(receiptKey(id, "application/pdf", 1, "n")).toBe(`expenses/${id}/1-n.pdf`);
    expect(receiptKey(id, "image/jpeg", 2, "n")).toBe(`expenses/${id}/2-n.jpg`);
    expect(isUuid(id)).toBe(true);
    expect(isUuid("../proofs/x")).toBe(false);
  });
});

/* ================================================================
   Before the migration
   ================================================================ */

describe("missingColumn", () => {
  it("recognises both ways of saying the migration has not run", () => {
    expect(missingColumn({ code: "42703", message: "column expenses.invoice_no does not exist" })).toBe(true);
    expect(
      missingColumn({ code: "PGRST204", message: "Could not find the 'invoice_no' column of 'expenses' in the schema cache" }),
    ).toBe(true);
    expect(missingColumn({ message: "column expenses.notes does not exist" })).toBe(true);
    expect(missingColumn({ code: "23505", message: "duplicate key" })).toBe(false);
    expect(missingColumn(null)).toBe(false);
    expect(MIGRATION_MESSAGE).toContain("supabase/migrations/2026-10-12-expense-ledger.sql");
  });

  it("reads a pre-migration row with its numbers as numbers", () => {
    const e = normaliseExpense({ id: "x", head: "Pandal", amount: "100.50", published: true, created_at: "2026-10-01T00:00:00Z" });
    expect(e.amount).toBe(100.5);
    expect(e.receipt_keys).toBeUndefined();
  });
});

/* ================================================================
   Totals, people owed, filters
   ================================================================ */

function row(over: Partial<Expense>): Expense {
  return {
    id: Math.random().toString(36).slice(2),
    head: "Pandal",
    description: null,
    amount: 100,
    spent_on: "2026-10-10",
    vendor: null,
    bill_url: null,
    published: true,
    created_at: "2026-10-10T10:00:00Z",
    receipt_keys: [],
    ...over,
  };
}

const LEDGER: Expense[] = [
  row({ amount: 1000, paid_from: "committee_account", receipt_keys: ["k1"] }),
  row({ amount: 300, paid_from: "member", paid_by_name: "Test Member", reimbursement_status: "pending", spent_on: "2026-10-05" }),
  row({ amount: 200, paid_from: "member", paid_by_name: "test  member", reimbursement_status: "pending", head: "Bhog" }),
  row({
    amount: 400,
    paid_from: "member",
    paid_by_name: "Other Member",
    reimbursement_status: "reimbursed",
    reimbursed_amount: 350,
    reimbursed_on: "2026-10-11",
  }),
  row({ amount: 50.25, paid_from: "sponsor", paid_by_name: "Test Sponsor" }),
  row({ amount: 75, spent_on: null }),
];

describe("ledgerTotals", () => {
  it("adds up who paid, what was repaid and what is still owed", () => {
    const t = ledgerTotals(LEDGER);
    expect(t.spent).toBe(2025.25);
    expect(t.committee).toBe(1000);
    expect(t.members).toBe(900);
    expect(t.sponsors).toBe(50.25);
    expect(t.unrecorded).toBe(75);
    expect(t.reimbursed).toBe(350);
    expect(t.owed).toBe(500);
    expect(t.owedCount).toBe(2);
    expect(t.withoutBill).toBe(5);
  });
});

describe("owedByPerson", () => {
  it("groups by person whatever the spacing and case, most owed first", () => {
    const owed = owedByPerson(LEDGER);
    expect(owed).toHaveLength(1);
    expect(owed[0]).toMatchObject({ name: "Test Member", count: 2, owed: 500 });
  });
});

describe("filterLedger and sortLedger", () => {
  it("filters by head, payer, status, who paid and dates", () => {
    expect(filterLedger(LEDGER, { head: "bhog" })).toHaveLength(1);
    expect(filterLedger(LEDGER, { payer: "TEST MEMBER" })).toHaveLength(2);
    expect(filterLedger(LEDGER, { status: "reimbursed" })).toHaveLength(1);
    expect(filterLedger(LEDGER, { status: "not_needed" })).toHaveLength(3);
    expect(filterLedger(LEDGER, { paidFrom: "unrecorded" })).toHaveLength(1);
    expect(filterLedger(LEDGER, { paidFrom: "member" })).toHaveLength(3);
    expect(filterLedger(LEDGER, { from: "2026-10-06", to: "2026-10-31" })).toHaveLength(4);
    expect(filterLedger(LEDGER, { q: "sponsor" })).toHaveLength(1);
    expect(filterLedger(LEDGER, { from: "not-a-date" })).toHaveLength(LEDGER.length);
  });

  it("sorts without losing a row, undated lines oldest", () => {
    const byAmount = sortLedger(LEDGER, "amount", "desc").map((e) => e.amount);
    expect(byAmount).toEqual([1000, 400, 300, 200, 75, 50.25]);
    const byDate = sortLedger(LEDGER, "spent_on", "asc");
    expect(byDate[0].spent_on).toBeNull();
    expect(sortLedger(LEDGER, "status", "asc")[0].reimbursement_status).toBe("pending");
  });
});

/* ================================================================
   The auditors' file
   ================================================================ */

describe("CSV", () => {
  it("defuses every cell a spreadsheet would run as a formula", () => {
    expect(csvCell("=SUM(A1:A9)")).toBe(`"'=SUM(A1:A9)"`);
    expect(csvCell("+91 55501")).toBe(`"'+91 55501"`);
    expect(csvCell("-2+3")).toBe(`"'-2+3"`);
    expect(csvCell("@cmd")).toBe(`"'@cmd"`);
    expect(csvCell("\t=1")).toBe(`"'\t=1"`);
    expect(csvCell("\r=1")).toBe(`"'\r=1"`);
    expect(csvCell("\n=1")).toBe(`"'\n=1"`);
    expect(csvCell('=HYPERLINK("http://x","y")')).toBe(`"'=HYPERLINK(""http://x"",""y"")"`);
  });

  it("leaves ordinary cells alone, quoted", () => {
    expect(csvCell("Pandal")).toBe(`"Pandal"`);
    expect(csvCell('say "hi"')).toBe(`"say ""hi"""`);
    expect(csvCell(12.5)).toBe(`"12.5"`);
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
  });

  it("writes a header, a BOM for Excel, and one line a row", () => {
    const out = toCsv([{ a: 1, b: "=x" }], ["a", { key: "b", label: "Bee" }]);
    expect(out.startsWith("﻿")).toBe(true);
    expect(out).toBe(`﻿"a","Bee"\r\n"1","'=x"\r\n`);
  });

  it("exports the ledger with a vendor's formula defused", () => {
    const csv = expensesCsv([row({ vendor: "=IMPORTXML(1)", amount: 10, paid_from: "member", paid_by_name: "@Test" })]);
    expect(csv).toContain(`"'=IMPORTXML(1)"`);
    expect(csv).toContain(`"'@Test"`);
    expect(csv).toContain(`"10.00"`);
    expect(csv.split("\r\n")[0]).toContain(`"Date paid","Head"`);
  });
});
