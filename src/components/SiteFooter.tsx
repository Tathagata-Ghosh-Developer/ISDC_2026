import Link from "next/link";
import { MapPin, Mail } from "lucide-react";
import { InstagramIcon, YoutubeIcon, WhatsappIcon } from "./BrandIcons";
import { SITE, LINKS, CONTACTS, NAV } from "@/lib/site";

const SOCIALS = [
  { href: LINKS.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: LINKS.youtube, label: "YouTube", Icon: YoutubeIcon },
  { href: LINKS.whatsappGroup, label: "WhatsApp group", Icon: WhatsappIcon },
];

export default function SiteFooter() {
  return (
    <footer className="relative mt-[6.854rem] border-t border-line bg-paper-2/60">
      {/* alpona border */}
      <div
        className="h-3 w-full opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--c-gold) 0 1px, transparent 1px 9px)",
          maskImage:
            "repeating-linear-gradient(90deg, #000 0 14px, transparent 14px 28px)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-[1180px] px-5 py-[4.236rem] md:px-8">
        <div className="grid gap-[2.618rem] md:grid-cols-[1.618fr_1fr_1fr]">
          <div>
            <p className="bangla-display text-[1.618rem] leading-relaxed text-ink">
              সর্বমঙ্গলমঙ্গল্যে শিবে সর্বার্থসাধিকে।
              <br />
              শরণ্যে ত্র্যম্বকে গৌরি নারায়ণি নমোহস্তুতে॥
            </p>
            <p className="lede mt-4 max-w-[44ch] text-[0.9rem]">
              O Narayani, auspicious one who fulfils all wishes — we take refuge
              in you, O Gauri.
            </p>

            <div className="mt-8 flex gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-soft transition-all duration-500 hover:-translate-y-0.5 hover:border-gold hover:text-gold"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow">Explore</h2>
            <ul className="mt-5 space-y-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="group inline-flex items-baseline gap-2 text-[0.92rem] text-ink-soft transition-colors hover:text-sindoor"
                  >
                    {n.label}
                    <span className="bangla text-[0.72rem] text-ink-faint transition-colors group-hover:text-gold">
                      {n.bangla}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/daan/board"
                  className="text-[0.92rem] text-ink-soft transition-colors hover:text-sindoor"
                >
                  Donation Board
                </Link>
              </li>
              <li>
                <Link
                  href="/sponsors"
                  className="text-[0.92rem] text-ink-soft transition-colors hover:text-sindoor"
                >
                  Sponsors
                </Link>
              </li>
              <li>
                <Link
                  href="/thikana#committee"
                  className="text-[0.92rem] text-ink-soft transition-colors hover:text-sindoor"
                >
                  The committee
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow">Reach us</h2>
            <ul className="mt-5 space-y-3 text-[0.92rem] text-ink-soft">
              <li className="flex gap-2">
                <MapPin size={15} className="mt-1 shrink-0 text-gold" />
                <Link href="/thikana" className="hover:text-sindoor">
                  {SITE.venue}
                </Link>
              </li>
              {CONTACTS.map((c) => (
                <li key={c.phone} className="flex gap-2">
                  <Mail size={15} className="mt-1 shrink-0 opacity-0" aria-hidden />
                  <span>
                    <a
                      href={`https://wa.me/91${c.phone}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:text-sindoor"
                    >
                      {c.name}
                    </a>
                    <span className="block text-[0.72rem] uppercase tracking-[0.2em] text-ink-faint">
                      {c.role}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rule-alpona my-[2.618rem]" />

        <div className="flex flex-col gap-3 text-[0.75rem] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {SITE.year} {SITE.name}. Run by students, funded by the community.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/daan/board" className="hover:text-gold">
              Financial transparency
            </Link>
            <Link href="/admin" className="hover:text-gold">
              Committee login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
