/**
 * The faculty invitation tracker: who is inviting which professor,
 * whether the card went in person, and whether they have given.
 *
 * Shared by the server and the browser; nothing here touches the
 * database.
 */

export type Invite = {
  id: string;
  name: string;
  post: string | null;
  department: string | null;
  division: string | null;
  email: string | null;
  volunteer: string | null;
  invited: boolean;
  invited_at: string | null;
  paid: boolean;
  amount: number | null;
  remarks: string | null;
  updated_by: string | null;
  updated_at: string;
};

/** A row read from a pasted spreadsheet, before it has an id. */
export type NewInvite = Pick<Invite, "name" | "post" | "department" | "division" | "email">;

/** The fields a volunteer may change on their own faculty. */
export const VOLUNTEER_FIELDS = ["invited", "paid", "amount", "remarks"] as const;

/** Everything the committee may change. */
export const COMMITTEE_FIELDS = [
  ...VOLUNTEER_FIELDS,
  "volunteer",
  "name",
  "post",
  "department",
  "division",
  "email",
] as const;

/**
 * The first address in a cell, lower-cased, or null. Handles "a@b.in,",
 * "a@b.in, c@b.in" and cells that hold a name instead of an address.
 */
export function cleanEmail(raw: string | null | undefined): string | null {
  const first = (raw ?? "").split(/[,;\s]+/).find((x) => x.includes("@"));
  if (!first) return null;
  const e = first.trim().toLowerCase().replace(/[.,;]+$/, "");
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? e : null;
}

/** "prantika  bhowmik" and "Prantika Bhowmik" are the same person. */
export function nameKey(name: string): string {
  return name.toLowerCase().replace(/[^\p{L}]+/gu, " ").trim();
}

/**
 * Rows copied straight out of Google Sheets or Excel (tab-separated),
 * in either of the committee's two layouts:
 *
 *   Division | Department | Name | Email        (the Durga Puja list)
 *   Name | Post | Department | Email | Phone    (the faculty directory)
 *
 * A header row decides the layout; without one, the Puja layout is
 * assumed. Blank Division or Department cells repeat the one above, the
 * way the Puja list is written. Duplicates within the paste are dropped
 * by email, or by name when there is no email.
 */
export function parseSheet(text: string): NewInvite[] {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim());
  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase().split("\t").map((h) => h.trim());
  const hasHeader = header.includes("name");
  const col = (label: string, fallback: number) => {
    const i = header.indexOf(label);
    return hasHeader ? i : fallback;
  };
  const directory = hasHeader && header.includes("post");
  const at = {
    division: directory ? -1 : col("division", 0),
    department: col("department", directory ? 2 : 1),
    name: col("name", directory ? 0 : 2),
    post: directory ? col("post", 1) : -1,
    email: col("email", directory ? 3 : 3),
  };

  const out: NewInvite[] = [];
  const seen = new Set<string>();
  let division = "";
  let department = "";

  for (const line of hasHeader ? lines.slice(1) : lines) {
    const cells = line.split("\t").map((c) => c.trim());
    const cell = (i: number) => (i >= 0 ? (cells[i] ?? "") : "");
    if (cell(at.division)) division = cell(at.division);
    if (cell(at.department)) department = cell(at.department);

    const name = cell(at.name).replace(/\s+/g, " ");
    if (name.length < 2) continue;
    const email = cleanEmail(cell(at.email));
    const key = email ?? nameKey(name);
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      name,
      post: cell(at.post) || null,
      department: department || null,
      division: directory ? null : division || null,
      email,
    });
  }
  return out;
}

/**
 * Whether a signed-in volunteer owns a row. The committee writes the
 * volunteer's name the way they know them; it matches the volunteer's
 * account name or their name on the contact sheet, ignoring case.
 */
export function ownsInvite(
  volunteer: string | null | undefined,
  login: string,
  displayName?: string | null,
): boolean {
  const v = (volunteer ?? "").trim().toLowerCase();
  if (!v) return false;
  return v === login.trim().toLowerCase() || (!!displayName && v === displayName.trim().toLowerCase());
}

export type InviteStatus = "all" | "not-invited" | "invited-unpaid" | "paid";

export function matchesStatus(row: Pick<Invite, "invited" | "paid">, status: InviteStatus): boolean {
  if (status === "not-invited") return !row.invited && !row.paid;
  if (status === "invited-unpaid") return row.invited && !row.paid;
  if (status === "paid") return row.paid;
  return true;
}
