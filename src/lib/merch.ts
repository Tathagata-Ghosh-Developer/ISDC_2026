/* ================================================================
   The merchandise's two pieces of logic, kept free of React and
   three.js so the tests can hold them still.
   ================================================================ */

/**
 * The height field scripts/merch-assets.py writes: columns, rows, its
 * tallest point in shirt widths, and the textured plane's height over
 * width. They change only if the script's resolution does, and a test
 * checks them against public/media/merch/shirt.bin.
 */
export const SHIRT = { nx: 256, ny: 235, hmax: 0.1248, aspect: 0.9185 } as const;

/**
 * Pages the popup leaves alone: someone paying, reading a receipt,
 * working the console, or already looking at the shirt.
 */
const QUIET = ["/admin", "/receipt", "/daan", "/merch"];

/** Whether the popup should open on this path, given what this visit has seen. */
export function shouldOffer(pathname: string | null, seen: boolean): boolean {
  if (seen || !pathname) return false;
  return !QUIET.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
