import Link from "next/link";
import { Container, Section } from "@/components/Section";
import { ART_FORMS } from "@/lib/content/artforms";

/**
 * An art form that does not exist.
 *
 * notFound() inside a dynamic segment does not fall through to the
 * site's own not-found page, so without this file the reader gets a
 * blank screen. Since the whole list is short, show it: somebody who
 * mistyped one craft is almost certainly looking for another.
 */
export default function ShilpaNotFound() {
  return (
    <Section className="pt-[7.5rem] sm:pt-[9rem]">
      <Container>
        <div className="mx-auto max-w-[70ch]">
          <p className="bangla-display text-[2.618rem] leading-tight text-sindoor">
            এই শিল্পটি নেই
          </p>
          <h1 className="font-display mt-3 text-[1.618rem] font-normal text-ink sm:text-[2.058rem]">
            There is no art form at that address
          </h1>
          <p className="lede mt-5 text-[0.98rem]">
            Twenty-four of them have a page here, and one of these is probably
            the one you wanted.
          </p>

          <div className="mt-9 grid gap-px bg-line sm:grid-cols-2">
            {ART_FORMS.map((a) => (
              <Link
                key={a.id}
                href={`/shilpa/${a.id}`}
                className="group bg-paper px-5 py-3.5 transition-colors hover:bg-paper-2/60"
              >
                <span className="bangla-display block text-[1.1rem] leading-tight text-ink transition-colors group-hover:text-sindoor">
                  {a.bangla}
                </span>
                <span className="block text-[0.8rem] text-ink-soft">
                  {a.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/shilpa" className="btn btn-ghost">
              All art forms
            </Link>
            <Link href="/" className="btn btn-ghost">
              Back to the beginning
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
