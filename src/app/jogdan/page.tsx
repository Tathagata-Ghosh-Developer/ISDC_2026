import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal, { Stagger, StaggerItem } from "@/components/Reveal";
import { InstagramIcon, YoutubeIcon, WhatsappIcon } from "@/components/BrandIcons";
import { getConfig } from "@/lib/config";
import { VOLUNTEER_ROLES } from "@/lib/site";
import { INSTITUTES, BENGALI_ORGS } from "@/lib/content/neighbours";

export const metadata: Metadata = {
  title: "Join Us",
  description:
    "Volunteer for the IISc Sharodiya Durgotsab. Eight teams, no prior experience needed, decoration, puja arrangements, bhog, logistics, sponsorship, content, fundraising and the magazine.",
};

export const revalidate = 600;

export default async function JogdanPage() {
  const config = await getConfig();

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="যোগদান Join us"
            title="A Puja was never one person's work"
            bangla="পুজো হয় সবার মিলিত প্রার্থনায়"
            lede="Eight teams, and not one of them asks for experience. What is actually required is time in October and the willingness to be told what to do by someone two years junior to you."
          />

          <Reveal className="mt-8">
            <a
              href={config.links.volunteerForm}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary"
            >
              Fill the volunteer form <ArrowUpRight size={14} />
            </a>
          </Reveal>
        </Container>
      </Section>

      <Section className="!pt-0">
        <Container>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {VOLUNTEER_ROLES.map((role) => (
              <StaggerItem key={role.id}>
                <article className="surface flex h-full flex-col p-6">
                  <span className="text-[1.5rem] leading-none" aria-hidden>
                    {role.icon}
                  </span>
                  <h2 className="bangla-display mt-4 text-[1.4rem] text-ink">
                    {role.bn}
                  </h2>
                  <p className="font-display text-[1.05rem] text-ink-soft">
                    {role.en}
                  </p>
                  <p className="mt-4 flex-1 text-[0.86rem] leading-relaxed text-ink-soft">
                    {role.blurb}
                  </p>
                  <p className="bangla mt-4 border-l-2 border-gold/40 pl-4 text-[0.85rem] leading-loose text-ink-soft">
                    {role.blurbBn}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>


      {/* ---------------- the open invitation ---------------- */}
      <Section id="nimontron">
        <Container>
          <SectionHeading
            eyebrow="নিমন্ত্রণ The invitation"
            title="The gate is open, and we mean it"
            bangla="সবার জন্য খোলা"
            lede="A Puja that only its own campus attends is a private party with incense. These are the neighbours we would like in the queue for bhog, the research institutions around us, and the Bengali organisations who have been keeping this city's Pujo going far longer than we have."
          />

          <div className="mt-[2.618rem]">
            <h3 className="eyebrow">Research institutions nearby</h3>
            <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {INSTITUTES.map((inst) => (
                <StaggerItem key={inst.id}>
                  <a
                    href={inst.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group surface flex h-full flex-col p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-[1.272rem] text-ink">
                        {inst.short}
                      </span>
                      <span className="text-[0.62rem] uppercase tracking-[0.2em] text-gold">
                        {inst.founded}
                      </span>
                    </div>
                    <span className="mt-1 text-[0.78rem] leading-snug text-ink-soft">
                      {inst.name}
                    </span>
                    <p className="mt-4 flex-1 text-[0.82rem] leading-relaxed text-ink-soft">
                      {inst.blurb}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-ink-faint transition-colors group-hover:text-gold">
                      {inst.campus} <ArrowUpRight size={12} />
                    </span>
                  </a>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div className="mt-[4.236rem]">
            <h3 className="eyebrow">Bengali Bengaluru</h3>
            <p className="lede mt-4 max-w-[64ch] text-[0.95rem]">
              The Bengalee Association held this city&apos;s first Sarbajanin
              Durga Puja in 1950. Our Puja is three years old. We are the
              youngest people in this room and we know it.
            </p>
            <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BENGALI_ORGS.map((org) => (
                <StaggerItem key={org.id}>
                  <a
                    href={org.url || "#"}
                    target={org.url ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    className="group surface flex h-full flex-col p-5 transition-all duration-500 hover:border-gold"
                  >
                    <span className="text-[0.95rem] leading-snug text-ink">
                      {org.name}
                    </span>
                    <span className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-gold">
                      {org.founded}
                    </span>
                    <p className="mt-3 flex-1 text-[0.78rem] leading-relaxed text-ink-soft">
                      {org.note}
                    </p>
                    {org.area && (
                      <span className="mt-3 text-[0.7rem] leading-relaxed text-ink-faint">
                        {org.area}
                      </span>
                    )}
                  </a>
                </StaggerItem>
              ))}
            </Stagger>
            <p className="mt-6 max-w-[70ch] text-[0.78rem] leading-relaxed text-ink-faint">
              If your association or Puja belongs on this list and is not here,
              tell a convenor and it goes up. We only list organisations whose
              details we could actually verify.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="bg-paper-2/40">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr]">
            <Reveal>
              <h2 className="font-display text-[1.618rem] font-normal leading-snug text-ink sm:text-[2.058rem]">
                No prior experience needed across any role
              </h2>
              <p className="lede mt-5 max-w-[58ch]">
                Just your love for Durga Puja, and that familiar ache of missing
                home, is more than enough. People who had never tied a bamboo
                joint have built the pandal. People who could not read Bengali
                have served bhog to four hundred people in an hour.
              </p>
              <p className="bangla mt-5 max-w-[58ch] text-[1.05rem] leading-loose text-ink">
                কোনো পূর্ব অভিজ্ঞতার দরকার নেই। শুধু পুজোর প্রতি ভালোবাসা আর
                সেই চেনা বুকের টান, &ldquo;এই সময়ে বাড়িতে থাকলে ভালো হতো&rdquo;,
                সেটুকুই যথেষ্ট।
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={config.links.volunteerForm}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-primary"
                >
                  Volunteer form
                </a>
                <a
                  href={config.links.whatsappGroup}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-ghost"
                >
                  Join the WhatsApp group
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface p-6">
                <h3 className="eyebrow">Talk to a convenor</h3>
                <ul className="mt-5 space-y-4">
                  {config.contacts.map((c) => (
                    <li key={c.phone}>
                      <a
                        href={`https://wa.me/91${c.phone}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group block"
                      >
                        <span className="block text-[0.95rem] text-ink transition-colors group-hover:text-sindoor">
                          {c.name}
                        </span>
                        <span className="block text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
                          {c.role}
                        </span>
                        <span className="mt-0.5 block text-[0.8rem] tabular-nums text-gold">
                          +91 {c.phone}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex gap-3 border-t border-line pt-6">
                  {[
                    { href: config.links.whatsappGroup, Icon: WhatsappIcon, label: "WhatsApp" },
                    { href: config.links.instagram, Icon: InstagramIcon, label: "Instagram" },
                    { href: config.links.youtube, Icon: YoutubeIcon, label: "YouTube" },
                  ].map(({ href, Icon, label }) => (
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
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
