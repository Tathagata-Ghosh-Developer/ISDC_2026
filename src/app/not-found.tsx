import Link from "next/link";
import { Container, Section } from "@/components/Section";
import { BrushUnderline } from "@/components/Brush";
import { NAV } from "@/lib/site";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <Section className="pt-[7.5rem] sm:pt-[9rem]">
      <Container>
        <div className="mx-auto max-w-[44rem] text-center">
          <p className="eyebrow">৪০৪ Not found</p>

          <h1 className="bangla-display mt-5 text-[2.618rem] leading-tight text-ink sm:text-[3.33rem]">
            এ পথ কোথাও যায় না
          </h1>
          <p className="font-display mt-2 text-[1.272rem] font-normal italic text-ink-soft">
            This path does not lead anywhere
          </p>

          <BrushUnderline className="mx-auto mt-6 h-[0.7rem] w-[5.4rem] text-gold" />

          <p className="lede mx-auto mt-7 max-w-[48ch] text-[0.95rem]">
            The page you were looking for is not here. It may have been renamed,
            or the link may have been typed from memory. Everything the site has
            is below.
          </p>

          <nav className="mt-10 flex flex-wrap justify-center gap-2">
            {[
              ...NAV,
              { href: "/daan", label: "Donate", bangla: "\u09a6\u09be\u09a8" },
              { href: "/daan/board", label: "Donation board", bangla: "\u09b9\u09bf\u09b8\u09be\u09ac" },
              { href: "/sponsors", label: "Sponsors", bangla: "\u09aa\u09c3\u09b7\u09cd\u09a0\u09aa\u09cb\u09b7\u0995" },
            ].map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="group border border-line px-4 py-2.5 text-left transition-colors hover:border-gold"
              >
                <span className="block text-[0.85rem] text-ink group-hover:text-sindoor">
                  {n.label}
                </span>
                <span className="bangla-display block text-[0.85rem] text-gold">
                  {n.bangla}
                </span>
              </Link>
            ))}
          </nav>

          <Link href="/" className="btn btn-primary mt-10">
            Back to the beginning
          </Link>
        </div>
      </Container>
    </Section>
  );
}
