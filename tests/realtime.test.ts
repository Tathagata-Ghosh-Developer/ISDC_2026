/**
 * The server clock helpers, the write that survives a missing column,
 * and the guide's guards.
 */
import { describe, expect, it } from "vitest";
import { istParts, istToIso } from "@/lib/format";
import { tolerant } from "@/lib/db";
import { MONEY, MONEY_REPLY, cacheKey, grounded } from "@/lib/guide";

describe("istParts", () => {
  it("reads an instant on an Indian clock", () => {
    // 2026-10-16 13:00 UTC is 18:30 in Kolkata
    expect(istParts(Date.UTC(2026, 9, 16, 13, 0))).toEqual({ date: "2026-10-16", time: "18:30" });
  });

  it("rolls the date over at Indian midnight, not UTC midnight", () => {
    // 2026-10-20 19:00 UTC is 00:30 on the 21st in Kolkata
    expect(istParts(Date.UTC(2026, 9, 20, 19, 0))).toEqual({ date: "2026-10-21", time: "00:30" });
  });

  it("writes midnight as 00, not 24", () => {
    expect(istParts(Date.UTC(2026, 9, 16, 18, 30)).time).toBe("00:00");
  });
});

describe("istToIso", () => {
  it("turns an Indian date and time into the right instant", () => {
    expect(istToIso("2026-10-16", "18:30")).toBe("2026-10-16T13:00:00.000Z");
  });

  it("round-trips with istParts", () => {
    const ms = Date.UTC(2026, 9, 19, 4, 45);
    const p = istParts(ms);
    expect(Date.parse(istToIso(p.date, p.time)!)).toBe(ms);
  });

  it("refuses anything malformed", () => {
    for (const [d, t] of [["2026-10-16", ""], ["", "18:30"], ["16/10/2026", "18:30"], ["2026-10-16", "24:00"], ["2026-10-16", "6pm"]]) {
      expect(istToIso(d, t)).toBeNull();
    }
  });
});

describe("tolerant", () => {
  const missing = (col: string) => ({
    error: { code: "PGRST204", message: `Could not find the '${col}' column of 'donations' in the schema cache` },
  });

  it("drops a column the database does not know and writes the rest", async () => {
    const seen: Record<string, unknown>[] = [];
    const res = await tolerant({ name: "A", paid_at: "x", amount: 1 }, async (r) => {
      seen.push(r);
      return "paid_at" in r ? missing("paid_at") : { error: null, ok: true };
    });
    expect(res.error).toBeNull();
    expect(seen).toHaveLength(2);
    expect(seen[1]).toEqual({ name: "A", amount: 1 });
  });

  it("drops several missing columns one at a time", async () => {
    const res = await tolerant({ a: 1, b: 2, c: 3 }, async (r) =>
      "b" in r ? missing("b") : "c" in r ? missing("c") : { error: null },
    );
    expect(res.error).toBeNull();
  });

  it("passes any other error straight back without retrying", async () => {
    let calls = 0;
    const res = await tolerant({ reference: "UTR1" }, async () => {
      calls += 1;
      return { error: { code: "23505", message: "duplicate key value" } };
    });
    expect(calls).toBe(1);
    expect(res.error?.code).toBe("23505");
  });

  it("never drops a column it was not given", async () => {
    let calls = 0;
    const res = await tolerant({ name: "A" }, async () => {
      calls += 1;
      return missing("status");
    });
    expect(calls).toBe(1);
    expect(res.error?.code).toBe("PGRST204");
  });

  it("does not change the caller's object", async () => {
    const row = { name: "A", paid_at: "x" };
    await tolerant(row, async (r) => ("paid_at" in r ? missing("paid_at") : { error: null }));
    expect(row).toEqual({ name: "A", paid_at: "x" });
  });
});

describe("MONEY", () => {
  const money = [
    "Did my donation go through?",
    "I paid 500 yesterday, is it received?",
    "What is the UPI id?",
    "where is my receipt",
    "refund please",
    "Has my money reached you?",
    "I sent ₹501 last night",
    "what amount did I give",
    "how do I donate",
    "\u09a6\u09be\u09a8 \u0995\u09c0\u09ad\u09be\u09ac\u09c7 \u0995\u09b0\u09ac",
    "\u099f\u09be\u0995\u09be \u09aa\u09be\u09a0\u09bf\u09af\u09bc\u09c7\u099b\u09bf",
  ];
  const other = [
    "When is Sandhi Puja?",
    "Where is the pandal?",
    "What is Sindoor Khela?",
    "Tell me about the dhak",
    "When does Bisarjan start?",
  ];
  for (const q of money) it(`routes "${q}" to the fixed reply`, () => expect(MONEY.test(q)).toBe(true));
  for (const q of other) it(`lets "${q}" through to the guide`, () => expect(MONEY.test(q)).toBe(false));

  it("the fixed reply points to the donate page and confirms nothing", () => {
    expect(MONEY_REPLY).toContain("/daan");
    expect(MONEY_REPLY).not.toMatch(/\d{6,}/); // no account number
    expect(MONEY_REPLY).not.toMatch(/(received|confirmed|verified|credited)/i);
  });
});

describe("grounded", () => {
  const context = "SCHEDULE. Sandhi Puja begins at 12:45 PM on 19 October 2026. Bhog is served from 1:30 PM.";

  it("keeps a reply whose numbers are all in the context", () => {
    expect(grounded("Sandhi Puja begins at 12:45 PM on 19 October 2026.", context)).toBe(true);
  });

  it("keeps a reply with no numbers", () => {
    expect(grounded("It is the most intense moment of the Puja.", context)).toBe(true);
  });

  it("rejects a reply that invents a time", () => {
    expect(grounded("Sandhi Puja begins at 11:15 AM.", context)).toBe(false);
  });

  it("rejects a reply that invents an amount", () => {
    expect(grounded("Bhog costs 150 rupees.", context)).toBe(false);
  });

  it("rejects any reply that says a payment went through", () => {
    expect(grounded("Your donation has been received.", context)).toBe(false);
    expect(grounded("Yes, it was verified.", context)).toBe(false);
  });

  it("rejects an invented number that is only part of a real one", () => {
    // "26" is inside "2026" but is not a number the context states
    expect(grounded("Bisarjan is on the 26th.", context)).toBe(false);
    expect(grounded("Arrive by 12.", context)).toBe(false);
  });

  it("ignores digit grouping and a trailing full stop", () => {
    expect(grounded("Over 10,000 visitors.", "expected 10000 visitors")).toBe(true);
    expect(grounded("On 19.", context)).toBe(true);
  });
});

describe("cacheKey", () => {
  it("treats case, spacing and punctuation as the same question", () => {
    expect(cacheKey("When is Sandhi Puja?")).toBe(cacheKey("  when is sandhi   puja "));
  });

  it("keeps Bengali letters", () => {
    expect(cacheKey("\u09b8\u09a8\u09cd\u09a7\u09bf\u09aa\u09c2\u099c\u09be \u0995\u0996\u09a8?")).toBe("\u09b8\u09a8\u09cd\u09a7\u09bf\u09aa\u09c2\u099c\u09be \u0995\u0996\u09a8");
  });
});
