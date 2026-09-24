import "server-only";

/**
 * The fund raisers, with working numbers they have not published.
 *
 * Read from the FUNDRAISER_CONTACTS environment variable, never written
 * into the source: the repository is public, and a number committed to
 * it is published for good. The variable lives in Vercel beside the
 * passphrases.
 *
 *   FUNDRAISER_CONTACTS="asha|Asha|QT|9XXXXXXXXX;bikram|Bikram|CSA|8XXXXXXXXX"
 *
 * One person per ";", four fields per person: the account name they
 * sign in with, their name, their department and a ten-digit number.
 *
 * "server-only" makes the build fail if a browser component ever
 * imports this, so the list can only be rendered on the server, on the
 * contact sheet, behind a committee login.
 */
export type Fundraiser = {
  login: string;
  name: string;
  department: string;
  phone: string;
};

export function parseFundraisers(raw: string | undefined): Fundraiser[] {
  const out: Fundraiser[] = [];
  for (const entry of (raw ?? "").split(";")) {
    const [login, name, department, phone] = entry.split("|").map((s) => s.trim());
    if (!login || !name) continue;
    const digits = (phone ?? "").replace(/\D/g, "").slice(-10);
    out.push({
      login: login.toLowerCase(),
      name,
      department: department ?? "",
      phone: digits.length === 10 ? digits : "",
    });
  }
  return out;
}

/** Read on each call, so a change in Vercel needs no code change. */
export function fundraisers(): Fundraiser[] {
  return parseFundraisers(process.env.FUNDRAISER_CONTACTS);
}
