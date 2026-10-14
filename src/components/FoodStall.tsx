import Image from "next/image";
import { FOOD_STALL, PARTNERS } from "@/lib/site";

/**
 * The food partner's stall by the pandal: their mark, their NGO's, and
 * the menu card exactly as they printed it. The card opens full size in
 * a new tab, so it can be zoomed on a phone in the queue.
 */
export default function FoodStall() {
  const p = PARTNERS.find((x) => x.id === FOOD_STALL.partner);
  if (!p) return null;
  const ngo = p.with;

  return (
    <div className="grid gap-[2.618rem] lg:grid-cols-[1fr_1.1fr] lg:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="relative block h-28 w-28 shrink-0 sm:h-32 sm:w-32">
            <Image src={p.logo} alt={p.name} fill sizes="8rem" className="object-contain" />
          </span>
          {ngo && (
            <span className="relative block h-28 w-24 shrink-0 bg-black sm:h-32 sm:w-28">
              <Image src={ngo.logo} alt={ngo.name} fill sizes="7rem" className="object-contain p-1.5" />
            </span>
          )}
        </div>
        <p className="mt-6 text-[0.62rem] uppercase tracking-[0.22em] text-ink-soft">
          {p.role}
          {ngo && ` · ${ngo.role}`}
        </p>
        <h3 className="font-display mt-2 text-[1.618rem] font-normal text-ink">{p.name}</h3>
        {ngo && <p className="mt-1 text-[0.9rem] text-ink-soft">with {ngo.name}</p>}
        <p className="mt-4 max-w-[52ch] text-[0.9rem] leading-relaxed text-ink-soft">{p.note}</p>
        <p className="mt-4 max-w-[52ch] text-[0.82rem] leading-relaxed text-ink-faint">
          {FOOD_STALL.where}. Prices are the stall&apos;s own and are paid at the stall, not to the committee.
        </p>
      </div>

      <a
        href={FOOD_STALL.menu}
        target="_blank"
        rel="noopener"
        className="group block max-w-[30rem] border border-line bg-paper-2/40 p-2 transition-colors hover:border-gold"
        aria-label={`${p.name} menu card, opens full size`}
      >
        <Image
          src={FOOD_STALL.menu}
          alt={`${p.name} menu: rolls, cutlets and Bengali sweets, with prices`}
          width={FOOD_STALL.menuWidth}
          height={FOOD_STALL.menuHeight}
          sizes="(max-width: 640px) 92vw, 30rem"
          className="h-auto w-full"
        />
        <span className="mt-2 block text-center text-[0.68rem] uppercase tracking-[0.2em] text-gold group-hover:text-sindoor">
          Open the menu full size
        </span>
      </a>
    </div>
  );
}
