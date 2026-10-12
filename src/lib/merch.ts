/* ================================================================
   When the merchandise popup opens, kept free of React so the tests
   can hold it still.
   ================================================================ */

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
