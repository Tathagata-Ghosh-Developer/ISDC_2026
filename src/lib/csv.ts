/**
 * CSV for the treasurer and the auditors, shared by the server export
 * and the console's own "download what I am looking at".
 *
 * A spreadsheet evaluates a cell that begins with = + - or @ (and some
 * read a leading tab or line break the same way), so a vendor called
 * =HYPERLINK(...) would run the moment an auditor opened the file. Such
 * cells get an apostrophe in front, which every spreadsheet reads as
 * "this is text". Nothing else is changed.
 */

const RISKY_FIRST = /^[=+\-@\t\r\n]/;

/** RFC 4180 quoting, plus the guard against formula injection. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (RISKY_FIRST.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}

/**
 * A whole file. Rows are records; `columns` names the keys to take, in
 * order, and the header is the key unless a label is given.
 */
export function toCsv(
  rows: Record<string, unknown>[],
  columns: (string | { key: string; label: string })[],
): string {
  const cols = columns.map((c) => (typeof c === "string" ? { key: c, label: c } : c));
  const head = cols.map((c) => csvCell(c.label)).join(",");
  const body = rows.map((r) => cols.map((c) => csvCell(r[c.key])).join(",")).join("\r\n");
  // BOM so Excel opens Bengali names and the rupee sign correctly.
  return "﻿" + head + "\r\n" + body + "\r\n";
}
