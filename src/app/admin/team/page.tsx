import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";
import { pointsOfContact, COMMITTEE, SITE } from "@/lib/site";
import { WhatsappIcon } from "@/components/BrandIcons";

export const dynamic = "force-dynamic";

/**
 * The contact sheet.
 *
 * Working phone numbers for people who have not published them, which
 * is precisely why this page is behind a login and carries no index.
 * A viewer account cannot reach it.
 */
export default async function AdminTeamPage() {
  const session = await currentSession();
  if (!session) return null;
  if (session.role === "viewer") redirect("/daan/board");

  const sheet = pointsOfContact();

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.618rem] font-normal text-ink">
          Contact sheet
        </h1>
        <p className="mt-1 max-w-[70ch] text-[0.85rem] leading-relaxed text-ink-soft">
          Who to go to for what, during the five days when nobody has time to
          work it out. These numbers are not on the public site. Do not paste
          them into a group.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sheet.map((row) => (
          <article key={row.area} className="surface flex flex-col p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[1rem] text-ink">{row.area}</h2>
              <span className="bangla-display shrink-0 text-[1.05rem] text-gold">
                {row.bangla}
              </span>
            </div>

            <p className="mt-2 flex-1 text-[0.8rem] leading-relaxed text-ink-soft">
              {row.note}
            </p>

            <ul className="mt-4 space-y-2 border-t border-line pt-3">
              {row.people.map((p) => (
                <li
                  key={p.name}
                  className="flex flex-wrap items-baseline justify-between gap-x-3"
                >
                  <span className="text-[0.88rem] text-ink">
                    {p.name}
                    <span className="ml-2 text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                      {p.role}
                    </span>
                  </span>
                  {p.phone ? (
                    <span className="flex items-center gap-3">
                      <a
                        href={`tel:+91${p.phone}`}
                        className="font-display text-[0.9rem] tabular-nums text-ink-soft hover:text-gold"
                      >
                        +91 {p.phone}
                      </a>
                      <a
                        href={`https://wa.me/91${p.phone}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`WhatsApp ${p.name}`}
                        className="text-leaf hover:text-sindoor"
                      >
                        <WhatsappIcon size={14} />
                      </a>
                    </span>
                  ) : (
                    <span className="text-[0.72rem] text-ink-faint">
                      number not shared
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section className="surface mt-6 p-5">
        <h2 className="eyebrow">The committee, as elected</h2>
        <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-soft">
          From the charge-transfer resolution of the General Body Meeting on
          19 July 2026. Write to {SITE.email} for anything that does not fit a
          row above.
        </p>
        <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {COMMITTEE.map((m) => (
            <li key={m.name} className="flex items-baseline justify-between gap-3">
              <span className="text-[0.88rem] text-ink">{m.name}</span>
              <span className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
