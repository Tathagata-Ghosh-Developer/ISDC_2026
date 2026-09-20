import { FACTS, pickFacts, type Fact } from "@/lib/content/facts";

/** An endless, pausable band of history. Two copies make the loop seamless. */
export function FactMarquee({ speed = 64 }: { speed?: number }) {
  const row = pickFacts(10);
  return (
    <div
      className="marquee-host relative w-full overflow-hidden border-y border-line bg-paper-2/40 py-4"
      style={{ ["--marquee-duration" as string]: `${speed}s` }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28"
        style={{
          background: "linear-gradient(90deg, var(--c-paper), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28"
        style={{
          background: "linear-gradient(270deg, var(--c-paper), transparent)",
        }}
      />
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {row.map((f, i) => (
              <span
                key={`${copy}-${f.id}-${i}`}
                className="flex shrink-0 items-center gap-3 px-6 text-[0.8rem] text-ink-soft"
              >
                <span className="h-1 w-1 shrink-0 rotate-45 bg-gold" />
                {f.year && (
                  <span className="font-display text-[0.95rem] text-sindoor">
                    {f.year}
                  </span>
                )}
                <span className="whitespace-nowrap">{f.title}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A single fact, set as a pull-quote inside a page of prose. */
export function FactCard({
  fact,
  showBangla = true,
}: {
  fact: Fact;
  showBangla?: boolean;
}) {
  return (
    <figure className="surface relative p-6 sm:p-8">
      <span
        className="absolute -top-3 left-6 bg-paper px-2 text-[0.6rem] uppercase tracking-[0.3em] text-gold"
        aria-hidden
      >
        {fact.year ?? fact.era}
      </span>
      <h3 className="font-display text-[1.272rem] font-medium leading-snug text-ink">
        {fact.title}
      </h3>
      <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-soft">
        {fact.fact}
      </p>
      {showBangla && (
        <p className="bangla mt-4 border-l-2 border-gold/50 pl-4 text-[0.9rem] leading-loose text-ink-soft">
          {fact.bangla}
        </p>
      )}
      <figcaption className="mt-5 text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">
        {fact.source}
      </figcaption>
    </figure>
  );
}

/** Deterministic set of cards, so server and client render alike. */
export function FactGrid({
  count = 3,
  offset = 0,
  className = "",
}: {
  count?: number;
  offset?: number;
  className?: string;
}) {
  const chosen = pickFacts(count, offset);
  return (
    <div
      className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {chosen.map((f) => (
        <FactCard key={f.id} fact={f} />
      ))}
    </div>
  );
}

export { FACTS };
