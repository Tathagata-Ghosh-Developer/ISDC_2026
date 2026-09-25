/**
 * Who may do what in the committee console.
 *
 * Shared by the server, which enforces it, and the browser, which uses
 * it only to avoid offering a button that would be refused. A hidden
 * button is a courtesy and never a control: every route checks again.
 *
 *   admin       one person. Everything, including deciding that an
 *               online declaration counts, deleting, exporting, and the
 *               site's copy.
 *   committee   the core committee. Enters donations, edits their
 *               details, sends WhatsApp receipts and ticks them off,
 *               sees the totals and the contact sheet.
 *   fundraiser  volunteers at a desk. Enters donations, which land
 *               verified with a receipt number, and sees their own
 *               entries. Nothing else.
 *   viewer      the donation board, which needs a login.
 */

export type Role = "admin" | "committee" | "fundraiser" | "viewer";

export const ROLES: readonly Role[] = ["viewer", "fundraiser", "committee", "admin"];

/** Higher number, more power. Used for at-least comparisons. */
export const RANK: Record<Role, number> = {
  viewer: 1,
  fundraiser: 2,
  committee: 3,
  admin: 4,
};

export function isRole(v: unknown): v is Role {
  return v === "admin" || v === "committee" || v === "fundraiser" || v === "viewer";
}

export function atLeast(role: Role | null | undefined, min: Role): boolean {
  return Boolean(role) && RANK[role as Role] >= RANK[min];
}

/** The weakest role that may do each thing. */
export const CAN = {
  enterDonation: "fundraiser",
  seeAllDonations: "committee",
  seeTotals: "committee",
  editDonation: "committee",
  sendReceipt: "committee",
  markReceiptSent: "committee",
  openProof: "committee",
  readEnquiries: "committee",
  contactSheet: "committee",
  verifyDeclared: "admin",
  deleteDonation: "admin",
  exportLedger: "admin",
  manageExpenses: "admin",
  editContent: "admin",
  seeVisits: "admin",
} as const satisfies Record<string, Role>;

export type Capability = keyof typeof CAN;

export function can(role: Role | null | undefined, what: Capability): boolean {
  return atLeast(role, CAN[what]);
}

/** What the header calls each account, so nobody guesses at their reach. */
export const ROLE_LABEL: Record<Role, string> = {
  admin: "Committee console",
  committee: "Committee desk",
  fundraiser: "Fund raiser desk",
  viewer: "Reading room",
};
