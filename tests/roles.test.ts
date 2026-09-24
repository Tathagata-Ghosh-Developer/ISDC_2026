/**
 * The four-role hierarchy and what each role may do.
 *
 * Written out in full rather than derived, so that a change to RANK or
 * CAN that quietly hands a fund raiser the power to send receipts or
 * edit a donor's details fails here first.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { atLeast, can, isRole, RANK, ROLES, type Capability, type Role } from "@/lib/roles";
import { accountCounts, checkCredentials } from "@/lib/auth";

describe("RANK", () => {
  it("orders viewer < fundraiser < committee < admin", () => {
    expect(RANK.viewer).toBeLessThan(RANK.fundraiser);
    expect(RANK.fundraiser).toBeLessThan(RANK.committee);
    expect(RANK.committee).toBeLessThan(RANK.admin);
  });

  it("lists every role once, weakest first", () => {
    expect([...ROLES]).toEqual(["viewer", "fundraiser", "committee", "admin"]);
  });
});

describe("atLeast, every ordered pair", () => {
  const order: Role[] = ["viewer", "fundraiser", "committee", "admin"];
  for (const held of order) {
    for (const needed of order) {
      const expected = order.indexOf(held) >= order.indexOf(needed);
      it(`${held} ${expected ? "meets" : "does not meet"} ${needed}`, () => {
        expect(atLeast(held, needed)).toBe(expected);
      });
    }
  }

  it("refuses a missing role", () => {
    expect(atLeast(null, "viewer")).toBe(false);
    expect(atLeast(undefined, "viewer")).toBe(false);
  });
});

describe("isRole", () => {
  it("accepts the four roles and nothing else", () => {
    for (const r of ["admin", "committee", "fundraiser", "viewer"]) expect(isRole(r)).toBe(true);
    for (const r of ["Admin", "fund-raiser", "", null, 3, "root"]) expect(isRole(r)).toBe(false);
  });
});

describe("can", () => {
  // The whole matrix. Y = allowed.
  const matrix: Record<Capability, [viewer: boolean, fundraiser: boolean, committee: boolean, admin: boolean]> = {
    enterDonation:   [false, true,  true,  true],
    seeAllDonations: [false, false, true,  true],
    seeTotals:       [false, false, true,  true],
    editDonation:    [false, false, true,  true],
    sendReceipt:     [false, false, true,  true],
    markReceiptSent: [false, false, true,  true],
    openProof:       [false, false, true,  true],
    readEnquiries:   [false, false, true,  true],
    contactSheet:    [false, false, true,  true],
    verifyDeclared:  [false, false, false, true],
    deleteDonation:  [false, false, false, true],
    exportLedger:    [false, false, false, true],
    manageExpenses:  [false, false, false, true],
    editContent:     [false, false, false, true],
    seeVisits:       [false, false, false, true],
  };
  const order: Role[] = ["viewer", "fundraiser", "committee", "admin"];

  for (const [what, row] of Object.entries(matrix) as [Capability, boolean[]][]) {
    order.forEach((role, i) => {
      it(`${role} ${row[i] ? "may" : "may not"} ${what}`, () => {
        expect(can(role, what)).toBe(row[i]);
      });
    });
  }

  it("a fund raiser can enter a donation but cannot send or tick a receipt", () => {
    expect(can("fundraiser", "enterDonation")).toBe(true);
    expect(can("fundraiser", "sendReceipt")).toBe(false);
    expect(can("fundraiser", "markReceiptSent")).toBe(false);
    expect(can("fundraiser", "editDonation")).toBe(false);
  });
});

describe("fund raiser accounts", () => {
  const KEYS = ["ADMIN_USERS", "COMMITTEE_USERS", "FUNDRAISER_USERS", "VIEWER_USERS", "ADMIN_PASSWORD"];
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => {
    for (const k of KEYS) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  });
  afterEach(() => {
    for (const k of KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("reads FUNDRAISER_USERS", () => {
    process.env.FUNDRAISER_USERS = "sourav:one-two-three-four,rohit:five-six-seven-eight";
    expect(checkCredentials("sourav", "one-two-three-four")).toBe("fundraiser");
    expect(checkCredentials("ROHIT", "five-six-seven-eight")).toBe("fundraiser");
    expect(checkCredentials("sourav", "five-six-seven-eight")).toBeNull();
    expect(accountCounts().fundraiser).toBe(2);
  });

  it("a name in both committee and fund raiser lists is committee", () => {
    process.env.COMMITTEE_USERS = "arnab:pass-committee";
    process.env.FUNDRAISER_USERS = "arnab:pass-fundraiser";
    expect(checkCredentials("arnab", "pass-committee")).toBe("committee");
    expect(checkCredentials("arnab", "pass-fundraiser")).toBeNull();
  });

  it("a fund raiser can never outrank the administrator", () => {
    process.env.ADMIN_USERS = "tathagata:the-admin-phrase";
    process.env.FUNDRAISER_USERS = "tathagata:a-lesser-phrase";
    expect(checkCredentials("tathagata", "the-admin-phrase")).toBe("admin");
    expect(checkCredentials("tathagata", "a-lesser-phrase")).toBeNull();
  });
});

describe("parseFundraisers", () => {
  it("reads login, name, department and number", async () => {
    const { parseFundraisers } = await import("@/lib/people.server");
    expect(parseFundraisers("a|Asha|QT|+91 55501 00001;b|Bikram|CSA|5550100002")).toEqual([
      { login: "a", name: "Asha", department: "QT", phone: "5550100001" },
      { login: "b", name: "Bikram", department: "CSA", phone: "5550100002" },
    ]);
  });

  it("keeps a person with a bad number but drops the number", async () => {
    const { parseFundraisers } = await import("@/lib/people.server");
    expect(parseFundraisers("c|Chandni|UG|123")).toEqual([
      { login: "c", name: "Chandni", department: "UG", phone: "" },
    ]);
  });

  it("skips empty and malformed entries, and survives an unset variable", async () => {
    const { parseFundraisers } = await import("@/lib/people.server");
    expect(parseFundraisers(";;|x|y|z;d")).toEqual([]);
    expect(parseFundraisers(undefined)).toEqual([]);
  });
});
