/* ================================================================
   The questions people actually ask, answered from the same config
   the pages render, so a date changed in the console changes the
   answer too.

   Three readers use this list: visitors (the section on the home
   page), search engines (FAQPage structured data) and AI assistants
   (llms.txt). Each answer is written to stand alone, because an
   assistant quoting one answer will not quote the one above it.
   ================================================================ */

import type { Config } from "./config";
import { istClock, istDate } from "./season";
import { SITE, TITLE_SPONSOR, VOLUNTEER_ROLES } from "./site";

export type Faq = { q: string; a: string; href?: string; cta?: string };

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const word = (n: number) => WORDS[n] ?? String(n);

function ritual(config: Config, dayId: string, match: RegExp) {
  return config.schedule.find((d) => d.id === dayId)?.rituals.find((r) => match.test(r.title));
}

export function pujaFaq(config: Config): Faq[] {
  const day = (id: string) => config.schedule.find((d) => d.id === id);
  const shashthi = day("shashthi");
  const dashami = day("dashami");
  const ashtami = day("ashtami");
  const broadcast = Date.parse(config.dates.mahalaya);
  const arati = ritual(config, "shashthi", /Sandhya Arati/i);
  const anjali = ritual(config, "ashtami", /Pushpanjali|Anjali/i);
  const sandhi = ritual(config, "ashtami", /Sandhi/i);
  const { bank, venue } = config;

  const list: (Faq | null)[] = [
    {
      q: "Where is the Durga Puja at IISc Bangalore held?",
      a: `At the ${venue.address}. It is marked ${venue.mapRef}. Walking directions from every campus gate are on the Thikana page, and security at any gate will point you towards the SBI branch.`,
      href: "/thikana",
      cta: "Directions from every gate",
    },
    {
      q: `When is the IISc Durga Puja in ${SITE.year}?`,
      a: `Mahalaya is on ${istDate(broadcast)} ${SITE.year}. The Puja runs from Maha Shashthi on ${shashthi ? `${shashthi.weekday} ${shashthi.date}` : istDate(Date.parse(config.dates.shashthi))} to Bijoya Dashami on ${dashami ? `${dashami.weekday} ${dashami.date}` : istDate(Date.parse(config.dates.dashami))}${arati ? `, with Sandhya Arati and a cultural evening every night at ${arati.time}` : ""}.`,
      href: "/utsab",
      cta: "Five days, hour by hour",
    },
    {
      q: "Is it open to everyone? Is there an entry fee?",
      a: "Yes, everyone is welcome and there is no entry fee. Anjali, the evening programmes and bhog are open to all who come.",
    },
    anjali && sandhi && ashtami
      ? {
          q: "When are Anjali and Sandhi Puja?",
          a: `On Maha Ashtami, ${ashtami.weekday} ${ashtami.date}: Pushpanjali at ${anjali.time} and Sandhi Puja from ${sandhi.time}. Sandhi Puja follows the tithi, so the priest confirms the exact minutes closer to the day and the committee announces them on WhatsApp and Instagram.`,
          href: "/utsab#ashtami",
          cta: "Maha Ashtami in full",
        }
      : null,
    {
      q: "When is Mahishasuramardini broadcast on Mahalaya?",
      a: `At ${istClock(broadcast)} on ${istDate(broadcast)} ${SITE.year}, on Akashvani Kolkata, as on every Mahalaya since the 1930s. The 1966 recording also plays on this site's Mahalaya page, from Saregama's own upload.`,
      href: "/mahalaya",
      cta: "The Mahalaya page",
    },
    {
      q: "How do I donate, and how do I get a receipt?",
      a: `Pay by UPI to ${bank.upiId}; the payee name shows as ${bank.merchantName}. Then record the payment on the Donate page with your name, WhatsApp number and UPI reference. The treasurer matches it against the bank statement and sends a numbered receipt to your WhatsApp. There is no payment gateway, so nothing is lost to fees.`,
      href: "/daan",
      cta: "Donate",
    },
    {
      q: "How can I volunteer?",
      a: `Join one of ${word(VOLUNTEER_ROLES.length)} volunteer teams, from decoration and bhog to the magazine. No experience is needed.`,
      href: "/jogdan",
      cta: "Pick a team",
    },
    {
      q: "Who organises it?",
      a: `The ${SITE.name} Committee, run by students of the Indian Institute of Science and funded by the campus community. The ${SITE.year} Puja is powered by ${TITLE_SPONSOR.name}.`,
    },
  ];

  return list.filter((f): f is Faq => f !== null);
}
