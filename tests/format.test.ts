/**
 * Money and dates, in Indian digit grouping.
 *
 * Every rupee figure on the board, on a receipt and in the console
 * goes through formatINR, so a change here is a change to a printed
 * receipt.
 */
import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatINR,
  formatNumber,
  normalisePhone,
} from "@/lib/format";

describe("formatINR", () => {
  it("prints zero as a rupee figure, not as an empty string", () => {
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(0, true)).toBe("₹0.00");
  });

  it("groups in lakhs and crores, not in thousands", () => {
    expect(formatINR(1000)).toBe("₹1,000");
    expect(formatINR(100000)).toBe("₹1,00,000");
    expect(formatINR(1234567)).toBe("₹12,34,567");
    expect(formatINR(10000000)).toBe("₹1,00,00,000");
  });

  it("hides paise by default and rounds to the nearest rupee", () => {
    expect(formatINR(0.4)).toBe("₹0");
    expect(formatINR(0.5)).toBe("₹1");
    expect(formatINR(1234.56)).toBe("₹1,235");
  });

  it("shows exactly two paise digits when asked", () => {
    expect(formatINR(0.5, true)).toBe("₹0.50");
    expect(formatINR(1234.56, true)).toBe("₹1,234.56");
    expect(formatINR(2500, true)).toBe("₹2,500.00");
  });

  it("prints a negative as a negative, for a refund line", () => {
    expect(formatINR(-500)).toBe("-₹500");
  });

  it("always starts with the rupee sign and never a currency code", () => {
    for (const n of [0, 1, 999, 100000, 12345678]) {
      expect(formatINR(n).startsWith("₹"), String(n)).toBe(true);
      expect(formatINR(n)).not.toContain("INR");
    }
  });
});

describe("formatNumber", () => {
  it("groups the Indian way without a currency sign", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(1234567)).toBe("12,34,567");
    expect(formatNumber(999)).toBe("999");
  });
});

describe("formatDate", () => {
  it("prints a date in Kolkata", () => {
    expect(formatDate("2026-10-16T08:30:00+05:30")).toBe("16 Oct 2026");
  });

  it("uses the Kolkata day, not the UTC one", () => {
    // 20:00 UTC on the 15th is 01:30 on the 16th in Kolkata.
    expect(formatDate("2026-10-15T20:00:00Z")).toBe("16 Oct 2026");
  });

  it("is empty rather than 'Invalid Date' for anything unusable", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
    expect(formatDate("not a date")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("prints a date and a time in Kolkata", () => {
    expect(formatDateTime("2026-10-16T08:30:00+05:30")).toMatch(/^16 Oct 2026/);
    expect(formatDateTime("2026-10-16T08:30:00+05:30")).toMatch(/8:30/);
  });

  it("is empty for anything unusable", () => {
    expect(formatDateTime(null)).toBe("");
    expect(formatDateTime("not a date")).toBe("");
  });
});

describe("normalisePhone", () => {
  it("keeps a plain ten-digit number", () => {
    expect(normalisePhone("7890825610")).toBe("7890825610");
  });

  it("strips a country code, spaces, dashes and brackets", () => {
    expect(normalisePhone("+91 78908 25610")).toBe("7890825610");
    expect(normalisePhone("+91-789-082-5610")).toBe("7890825610");
    expect(normalisePhone("(+91) 7890 825 610")).toBe("7890825610");
    expect(normalisePhone("0091 7890825610")).toBe("7890825610");
    expect(normalisePhone("07890825610")).toBe("7890825610");
  });

  it("leaves a short number short, so the form can refuse it", () => {
    expect(normalisePhone("12345")).toBe("12345");
    expect(normalisePhone("")).toBe("");
    expect(normalisePhone("no digits here")).toBe("");
  });
});
