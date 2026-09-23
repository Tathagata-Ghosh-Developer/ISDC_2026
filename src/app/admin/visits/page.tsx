import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth";
import { getAnalytics, getJourneys } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<string, string> = {
  "donate-form-opened": "Opened the donation form",
  "donate-form-submitted": "Completed the donation form",
  "upi-copied": "Copied the UPI id",
  "account-copied": "Copied the account number",
  "receipt-printed": "Printed a receipt",
  "magazine-opened": "Opened Probash",
  "music-played": "Played a song",
  "radio-tuned": "Tuned the radio",
  "desk-played": "Started the sound desk",
  "sponsor-enquiry": "Sent a sponsorship enquiry",
  "institute-enquiry": "Wrote in from another institute",
  "feedback-sent": "Sent feedback",
  "route-to-pandal": "Asked for directions",
};

export default async function AdminVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await currentSession();
  if (!session) return null;
  if (session.role !== "admin") redirect("/admin");

  const params = await searchParams;
  const days = Math.min(365, Math.max(1, Number(params.days) || 30));
  const a = await getAnalytics(days);
  const j = await getJourneys(days);

  const peak = Math.max(1, ...a.byDay.map((d) => d.views));

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.618rem] font-normal text-ink">
          Visits
        </h1>
        <p className="mt-1 max-w-[70ch] text-[0.85rem] leading-relaxed text-ink-soft">
          Two tiers. The counts here are about nobody: no address, no
          device, no fingerprint, so they are collected from every visitor
          and could not leak anything if they tried. Below them is what
          visitors have agreed to share, which is a great deal more and is
          deleted after six months. All of it covers the last {days} days.
        </p>
        <div className="mt-3 flex gap-1">
          {[7, 30, 90, 365].map((d) => (
            <a
              key={d}
              href={`/admin/visits?days=${d}`}
              className={`border px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
                d === days
                  ? "border-sindoor bg-sindoor text-paper-3"
                  : "border-line text-ink-faint hover:border-gold hover:text-gold"
              }`}
            >
              {d === 365 ? "A year" : `${d} days`}
            </a>
          ))}
        </div>
      </div>

      {!a.ready ? (
        <p className="surface p-8 text-[0.85rem] text-ink-soft">
          No database connected, so nothing is being counted yet.
        </p>
      ) : (
        <>
          <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
            <Cell label="Page views" value={a.totals.views.toLocaleString("en-IN")} />
            <Cell label="Visits" value={a.totals.sessions.toLocaleString("en-IN")} />
            <Cell
              label="Reached the form"
              value={a.funnel.reachedForm.toLocaleString("en-IN")}
            />
            <Cell
              label="Finished it"
              value={`${a.funnel.submitted.toLocaleString("en-IN")}  ${
                a.funnel.reachedForm
                  ? `(${Math.round(a.funnel.rate * 100)}%)`
                  : ""
              }`}
              tone="sindoor"
            />
          </div>

          {/* ---- by day ---- */}
          <section className="surface mt-6 p-5">
            <h2 className="eyebrow">Day by day</h2>
            <div className="mt-4 flex h-32 items-end gap-px">
              {a.byDay.map((d) => (
                <div
                  key={d.day}
                  title={`${d.day}  ${d.views} views, ${d.sessions} visits`}
                  className="min-w-0 flex-1 bg-gold/70 transition-colors hover:bg-sindoor"
                  style={{ height: `${Math.max(2, (d.views / peak) * 100)}%` }}
                />
              ))}
              {a.byDay.length === 0 && (
                <p className="text-[0.8rem] text-ink-faint">
                  Nothing counted yet.
                </p>
              )}
            </div>
            {a.byDay.length > 0 && (
              <div className="mt-2 flex justify-between text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
                <span>{a.byDay[0]?.day}</span>
                <span>{a.byDay[a.byDay.length - 1]?.day}</span>
              </div>
            )}
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Table
              title="Pages"
              rows={a.byPath.map((p) => [p.path, p.views.toLocaleString("en-IN")])}
              right="Views"
            />
            <Table
              title="Where they came from"
              rows={a.byReferrer.map((r) => [
                r.referrer,
                r.sessions.toLocaleString("en-IN"),
              ])}
              right="Visits"
            />
            <Table
              title="Screens"
              rows={a.byDevice.map((d) => [
                d.device,
                d.sessions.toLocaleString("en-IN"),
              ])}
              right="Visits"
            />
            <Table
              title="What people did"
              rows={a.events.map((e) => [
                EVENT_LABEL[e.name] ?? e.name,
                e.count.toLocaleString("en-IN"),
              ])}
              right="Times"
            />
          </div>

          {/* ---------- the consented tier ---------- */}
          {j.ready && j.sessions > 0 && (
            <>
              <div className="mt-[2.618rem] border-t border-line pt-8">
                <h2 className="font-display text-[1.272rem] font-normal text-ink">
                  Visitors who said yes
                </h2>
                <p className="mt-1 max-w-[74ch] text-[0.82rem] leading-relaxed text-ink-soft">
                  Everything below comes only from people who agreed to it
                  when the notice appeared. It is deleted after six months,
                  and anyone who changes their mind erases their own visit at
                  once. {j.sessions.toLocaleString("en-IN")} visits so far.
                </p>
              </div>

              <div className="mt-6 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-5">
                <Cell label="Pages per visit" value={String(j.medianPages)} />
                <Cell
                  label="Time on site"
                  value={`${Math.floor(j.medianSeconds / 60)}m ${j.medianSeconds % 60}s`}
                />
                <Cell label="Read down to" value={`${j.medianScroll}%`} />
                <Cell label="Been before" value={`${j.returningPct}%`} />
                <Cell label="Gave" value={`${j.donatedPct}%`} tone="sindoor" />
              </div>

              {j.paths.length > 0 && (
                <section className="surface mt-6 overflow-hidden">
                  <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
                    <h3 className="eyebrow !mb-0">The routes people take</h3>
                    <span className="text-[0.55rem] uppercase tracking-[0.2em] text-ink-faint">
                      Visits
                    </span>
                  </div>
                  <ul className="divide-y divide-line">
                    {j.paths.map((p) => (
                      <li
                        key={p.steps.join(">")}
                        className="flex items-baseline justify-between gap-4 px-5 py-3"
                      >
                        <span className="min-w-0 text-[0.8rem] text-ink-soft">
                          {p.steps.join("  →  ")}
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="font-display block text-[0.88rem] tabular-nums text-ink">
                            {p.n}
                          </span>
                          {p.donated > 0 && (
                            <span className="block text-[0.6rem] uppercase tracking-[0.14em] text-sindoor">
                              {p.donated} gave
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Table title="Came in on" rows={j.byLanding.map((x) => [x.key, String(x.n)])} right="Visits" />
                <Table title="Campaign or source" rows={j.byCampaign.map((x) => [x.key, String(x.n)])} right="Visits" />
                <Table title="Browser" rows={j.byBrowser.map((x) => [x.key, String(x.n)])} right="Visits" />
                <Table title="Operating system" rows={j.byPlatform.map((x) => [x.key, String(x.n)])} right="Visits" />
                <Table title="Time zone" rows={j.byTimezone.map((x) => [x.key, String(x.n)])} right="Visits" />
                <Table title="Language" rows={j.byLanguage.map((x) => [x.key, String(x.n)])} right="Visits" />
                <Table title="Screen size" rows={j.screens.map((x) => [x.key, String(x.n)])} right="Visits" />
                <Table title="Connection" rows={j.byConnection.map((x) => [x.key, String(x.n)])} right="Visits" />
              </div>
            </>
          )}

          {j.ready && j.sessions === 0 && (
            <p className="surface mt-[2.618rem] p-6 text-[0.85rem] leading-relaxed text-ink-soft">
              Nobody has agreed to the detailed tier yet, so there is nothing
              here. The counts above are collected either way, because
              nothing in them is about a person.
            </p>
          )}

          <p className="mt-6 max-w-[72ch] text-[0.72rem] leading-relaxed text-ink-faint">
            A visit is one browser tab arriving. Two people on the same phone
            at different times count twice, and one person opening the site on
            a laptop and a phone counts twice as well. That is the price of
            not identifying anyone, and it is worth paying.
          </p>
        </>
      )}
    </div>
  );
}

function Cell({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: "ink" | "sindoor";
}) {
  return (
    <div className="bg-paper p-5">
      <span
        className={`font-display block text-[1.618rem] font-normal leading-none tabular-nums ${
          tone === "sindoor" ? "text-sindoor" : "text-ink"
        }`}
      >
        {value}
      </span>
      <span className="mt-1.5 block text-[0.58rem] uppercase tracking-[0.22em] text-ink-faint">
        {label}
      </span>
    </div>
  );
}

function Table({
  title,
  rows,
  right,
}: {
  title: string;
  rows: [string, string][];
  right: string;
}) {
  return (
    <section className="surface overflow-hidden">
      <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
        <h2 className="eyebrow !mb-0">{title}</h2>
        <span className="text-[0.55rem] uppercase tracking-[0.2em] text-ink-faint">
          {right}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-6 text-[0.8rem] text-ink-faint">Nothing yet.</p>
      ) : (
        <ul className="max-h-[22rem] divide-y divide-line overflow-y-auto">
          {rows.map(([k, v]) => (
            <li
              key={k}
              className="flex items-baseline justify-between gap-4 px-5 py-2.5"
            >
              <span className="min-w-0 truncate text-[0.82rem] text-ink-soft">
                {k}
              </span>
              <span className="font-display shrink-0 text-[0.88rem] tabular-nums text-ink">
                {v}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
