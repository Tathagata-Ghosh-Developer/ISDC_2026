import { getConfig } from "@/lib/config";
import { buildCalendar } from "@/lib/calendar";
import { SITE } from "@/lib/site";

/**
 * The Puja in a calendar file: the Mahalaya broadcast with a reminder,
 * and each of the five days. Rebuilt hourly so a schedule edit in the
 * console reaches it without a deploy.
 */
export const revalidate = 3600;

export async function GET() {
  const config = await getConfig();
  const body = buildCalendar({
    dates: config.dates,
    schedule: config.schedule,
    venue: config.venue.address,
    siteUrl: SITE.url,
    now: Date.now(),
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="iisc-durga-puja-2026.ics"',
    },
  });
}
