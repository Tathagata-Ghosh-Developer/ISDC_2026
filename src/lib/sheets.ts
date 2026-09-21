import "server-only";

/**
 * External tally.
 *
 * The committee wanted to audit donations outside this application,
 * so every row is also pushed to a Google Sheet through an Apps Script
 * web app. Set SHEETS_WEBHOOK_URL to switch it on; without it the
 * function is a no-op and the site behaves exactly as before.
 *
 * Deliberately fire-and-forget: a spreadsheet being slow, rate limited
 * or misconfigured must never block or fail a donation.
 *
 * Apps Script to paste at script.google.com, deployed as a web app
 * that anyone can access:
 *
 *   function doPost(e) {
 *     var body = JSON.parse(e.postData.contents);
 *     if (body.secret !== 'YOUR_SECRET') return ContentService.createTextOutput('no');
 *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Donations');
 *     var d = body.donation;
 *     sheet.appendRow([
 *       new Date(), d.id, d.receipt_no || '', d.name, d.category,
 *       d.amount, d.method,
 *       d.reference || '', d.paid_on || '', d.status, d.verified_by || ''
 *     ]);
 *     return ContentService.createTextOutput('ok');
 *   }
 */

export type SheetRow = Record<string, unknown> & { id: string };

/**
 * Google Sheets evaluates a cell beginning with = + - or @, so a donor
 * name of =IMPORTXML(...) would exfiltrate the sheet the moment the
 * treasurer opened it. The CSV export guards the same way.
 */
const RISKY_FIRST = new Set(["=", "+", "-", "@", "\t", "\r", "\n"]);

function defuse(value: unknown): unknown {
  if (typeof value !== "string" || value.length === 0) return value;
  return RISKY_FIRST.has(value[0]) ? "'" + value : value;
}

function defuseRow(row: SheetRow): SheetRow {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[k] = defuse(v);
  return out as SheetRow;
}

export async function mirrorToSheet(donation: SheetRow): Promise<void> {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret: process.env.SHEETS_WEBHOOK_SECRET ?? "",
        donation: defuseRow(donation),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (err) {
    console.error(
      "[sheets] mirror failed",
      err instanceof Error ? err.message : err,
    );
  }
}
