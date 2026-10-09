import { getConfig } from "@/lib/config";
import { pujaFaq } from "@/lib/faq";
import { istClock, istDate } from "@/lib/season";
import { SITE, TITLE_SPONSOR } from "@/lib/site";

/**
 * llms.txt: the site summarised for AI assistants, in the shape the
 * llmstxt.org proposal describes. An assistant asked about "Durga Puja
 * at IISc" reads this instead of piecing it together from the pages.
 * Built from the same config as the pages, rebuilt hourly.
 */
export const revalidate = 3600;

const PAGES: [string, string, string][] = [
  ["/utsab", "Utsab, the five days", "Every ritual of the five days with its time: Bodhon, Nabapatrika, Anjali, Sandhi Puja, Kumari Puja, Bhog, Sindoor Khela and Bisarjan."],
  ["/mahalaya", "Mahalaya", "Mahishasuramardini, the pre-dawn broadcast that has opened Durga Puja since the 1930s, with the 1966 recording from the rights holder's upload."],
  ["/thikana", "Thikana, finding the pandal", "Walking directions to the TMC Ground from every gate of the IISc campus, on the official campus map."],
  ["/daan", "Donate", "UPI and bank details of the committee account, and the form that turns a payment into a numbered receipt on WhatsApp. No payment gateway, no fees."],
  ["/jogdan", "Jogdan, volunteer", "Volunteer teams for decoration, puja arrangements, bhog, logistics, sponsorship, content, fundraising and the magazine. No experience needed."],
  ["/probash", "Probash, the magazine", "The committee's annual Sharodiya magazine, with submissions and the cover competition."],
  ["/gaan", "Gaan, the listening room", "Two hundred Bengali songs of the Puja and a sound desk of dhak, conch, rain, adda and river."],
  ["/gallery", "Chhobi, the gallery", "Photographs and film from the 2025 Puja on this ground, and the paintings that shaped how Bengal pictures the goddess."],
  ["/shilpa", "Shilpa, the art forms", "Twenty-four art forms Durga Puja commissions every year, from Kumartuli clay to Chandannagar light."],
  ["/itihash", "Itihash, the history", "The history of Durga Puja from the Devi Mahatmya to the UNESCO inscription, in sourced facts."],
  ["/sponsors", "Sponsors", "Sponsorship tiers and the 2026 title sponsor."],
];

export async function GET() {
  const config = await getConfig();
  const broadcast = Date.parse(config.dates.mahalaya);
  const days = config.schedule.filter((d) => d.id !== "mahalaya");
  const first = days[0];
  const last = days[days.length - 1];

  const out: string[] = [
    `# ${SITE.name} ${SITE.year}`,
    "",
    `> The Durga Puja of the Indian Institute of Science (IISc), Bengaluru: ${SITE.nameBangla}. Run by students, funded by the campus community, powered by ${TITLE_SPONSOR.name}. Free and open to everyone.`,
    "",
    `- Venue: ${config.venue.address} (${config.venue.mapRef})`,
    `- Mahalaya: ${istDate(broadcast)} ${SITE.year}. Mahishasuramardini is broadcast at ${istClock(broadcast)} IST.`,
    first && last
      ? `- Durga Puja: ${first.tithi}, ${first.weekday} ${first.date}, to ${last.tithi}, ${last.weekday} ${last.date}.`
      : "",
    `- Donate: UPI ${config.bank.upiId} (payee ${config.bank.merchantName}), then record the payment at ${SITE.url}/daan for a numbered receipt on WhatsApp.`,
    `- Calendar file with every date: ${SITE.url}/calendar.ics`,
    `- Contact: ${SITE.email}. Instagram: ${config.links.instagram}`,
    "",
    "## Schedule",
    "",
  ];

  for (const d of config.schedule) {
    out.push(`### ${d.tithi} (${d.tithiBangla}), ${d.weekday} ${d.date}`, "", d.headline + ".", "");
    for (const r of d.rituals) out.push(`- ${r.time}: ${r.title}`);
    out.push("");
  }

  out.push("## Pages", "");
  for (const [path, title, about] of PAGES) out.push(`- [${title}](${SITE.url}${path}): ${about}`);
  out.push("", "## Questions", "");
  for (const f of pujaFaq(config)) out.push(`### ${f.q}`, "", f.a, "");

  return new Response(out.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
