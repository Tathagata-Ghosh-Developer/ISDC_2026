/**
 * The server's clock, for forms that fill in "when did you pay".
 *
 * A phone's clock can be minutes or hours wrong. The browser asks once,
 * works out how far off it is, and ticks from there, so the date and
 * time on a desk entry are the real ones whatever the phone thinks.
 */
export const runtime = "edge";

export function GET() {
  return Response.json({ now: Date.now() }, { headers: { "cache-control": "no-store" } });
}
