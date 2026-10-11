import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Mail } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/Section";
import Reveal from "@/components/Reveal";
import MerchStage from "@/components/merch/MerchStage";
import { MERCH, PARTNERS, SITE } from "@/lib/site";
import { jsonLd } from "@/lib/structured";

export const metadata: Metadata = {
  title: "Merchandise",
  description: `${MERCH.title}, the official T-shirt of the IISc Sharodiya Durgotsab ${SITE.year}: ₹${MERCH.price}, ${MERCH.fits.join(" or ").toLowerCase()} fit, sizes ${MERCH.sizes[0]} to ${MERCH.sizes[MERCH.sizes.length - 1]}, delivered free on the IISc campus by Meme Theory.`,
  openGraph: { images: [{ url: "/media/merch/flat-front.webp", width: 1200, height: 1102 }] },
};

const PARTNER = PARTNERS.find((p) => p.id === "merchandise")!;

const product = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: `${MERCH.title}: official T-shirt of the ${SITE.name} ${SITE.year}`,
  description: `${MERCH.line}. Front: ${MERCH.front} Back: ${MERCH.back}`,
  image: [`${SITE.url}/media/merch/flat-front.webp`, `${SITE.url}/media/merch/flat-back.webp`],
  color: MERCH.colour,
  size: MERCH.sizes,
  brand: { "@type": "Brand", name: SITE.name },
  offers: {
    "@type": "Offer",
    url: MERCH.url,
    price: MERCH.price,
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: MERCH.seller, url: PARTNER.url },
  },
};

export default function MerchPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(product) }} />

      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <Reveal>
              <MerchStage eager className="aspect-[4/5] w-full border border-line sm:aspect-[4/3]" />
            </Reveal>

            <Reveal delay={0.08}>
              <p className="eyebrow">শারদ সম্ভার Official merchandise</p>
              <h1 className="font-display mt-3 text-[2.618rem] font-normal leading-[1.05] text-ink sm:text-[3.33rem]">
                {MERCH.title}
              </h1>
              <p className="bangla-display mt-2 text-[1.618rem] text-sindoor">{MERCH.lineBangla}</p>
              <p className="lede mt-5 max-w-[46ch]">
                {MERCH.line}, in {MERCH.colour.toLowerCase()}. Wear the Puja home from the pandal.
              </p>

              <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[0.9rem]">
                <dt className="text-ink-faint">Price</dt>
                <dd className="font-display text-[1.272rem] text-ink">₹{MERCH.price}</dd>
                <dt className="text-ink-faint">Fit</dt>
                <dd className="text-ink-soft">{MERCH.fits.join(" or ")}</dd>
                <dt className="text-ink-faint">Sizes</dt>
                <dd className="text-ink-soft">{MERCH.sizes.join(", ")}</dd>
                <dt className="text-ink-faint">Delivery</dt>
                <dd className="text-ink-soft">{MERCH.delivery}</dd>
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href={MERCH.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Buy on Meme Theory <ArrowUpRight size={14} />
                </a>
              </div>
              <p className="mt-4 max-w-[52ch] text-[0.75rem] leading-relaxed text-ink-faint">
                Price, stock and delivery are set by Meme Theory and shown on their page when you order.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="নকশা The design"
            title="Front and back, as printed"
            lede="Drawn by the committee's art and decor team. The crest is the committee's own; the sleeves carry the title sponsor."
          />
          <div className="mt-[2.618rem] grid gap-6 sm:grid-cols-2">
            {[
              { src: "/media/merch/flat-front.webp", label: "Front", text: MERCH.front },
              { src: "/media/merch/flat-back.webp", label: "Back", text: MERCH.back },
            ].map((f, i) => (
              <Reveal key={f.label} delay={i * 0.06}>
                <figure className="surface p-4 sm:p-6">
                  <div className="relative aspect-[1200/1102] w-full">
                    <Image src={f.src} alt={`${MERCH.title} T-shirt, ${f.label.toLowerCase()}: ${f.text}`} fill sizes="(max-width: 640px) 90vw, 560px" className="object-contain" />
                  </div>
                  <figcaption className="mt-4">
                    <span className="eyebrow">{f.label}</span>
                    <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-soft">{f.text}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-[2.618rem] lg:grid-cols-[1.618fr_1fr] lg:items-start">
            <Reveal>
              <h2 className="font-display text-[1.618rem] font-normal text-ink">How ordering works</h2>
              <ol className="mt-6 space-y-4">
                {[
                  { n: "01", t: "Pick your fit and size on Meme Theory.", d: `${MERCH.fits.join(" or ")}, ${MERCH.sizes.join(", ")}. Check the size chart there first.` },
                  { n: "02", t: "Pay on their site.", d: "Payment goes to Meme Theory, not to the committee, and their terms apply." },
                  { n: "03", t: "It comes to you on campus.", d: MERCH.delivery },
                ].map((s) => (
                  <li key={s.n} className="flex gap-4">
                    <span className="font-display shrink-0 text-[1.272rem] font-normal text-gold">{s.n}</span>
                    <span>
                      <span className="block text-[0.92rem] text-ink">{s.t}</span>
                      <span className="mt-0.5 block text-[0.8rem] text-ink-faint">{s.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 max-w-[60ch] border-l-2 border-sindoor pl-3 text-[0.8rem] leading-relaxed text-ink-soft">
                Meme Theory does not take cancellations or returns once an order is placed, so choose the size with
                care. Read their{" "}
                <a href={MERCH.refunds} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-2 hover:text-sindoor">
                  refund policy
                </a>
                ,{" "}
                <a href={MERCH.shipping} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-2 hover:text-sindoor">
                  delivery policy
                </a>{" "}
                and{" "}
                <a href={MERCH.terms} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-2 hover:text-sindoor">
                  terms
                </a>{" "}
                before you buy.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="surface p-6">
                <p className="eyebrow">মার্চেন্ডাইজ সহযোগী Merchandise partner</p>
                <div className="mt-5 flex items-center gap-4">
                  <Image src={PARTNER.logo} alt={PARTNER.name} width={64} height={64} className="shrink-0 rounded-full" />
                  <div>
                    <p className="font-display text-[1.272rem] text-ink">{PARTNER.name}</p>
                    <a href={PARTNER.url} target="_blank" rel="noopener noreferrer" className="text-[0.78rem] text-gold hover:text-sindoor">
                      memetheory.in <ArrowUpRight size={11} className="inline" />
                    </a>
                  </div>
                </div>
                <p className="mt-4 text-[0.84rem] leading-relaxed text-ink-soft">{PARTNER.note}</p>
                <a href={`mailto:${MERCH.support}`} className="mt-4 inline-flex items-center gap-1.5 text-[0.78rem] text-ink-soft hover:text-gold">
                  <Mail size={13} /> Questions about an order: {MERCH.support}
                </a>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
