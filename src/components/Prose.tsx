import type { ReactNode } from "react";

/* ================================================================
   The little bit of Markdown the research files actually use.

   The chapter text is written as Markdown because that is what a
   person writes when they are writing prose with emphasis in it. It
   was then rendered by splitting on blank lines and printing the
   result, so every asterisk reached the page and the most carefully
   researched thing on this site looked like a broken text file.

   This handles exactly what is in those files and nothing else:
   bold, italic, and a line beginning with a quotation mark, which in
   the sources is always a quoted primary document. No link syntax,
   no headings, no lists. If the research ever starts using those,
   this has to grow, and it should grow deliberately rather than by
   reaching for a Markdown library to render four kinds of thing.
   ================================================================ */

/** Splits one paragraph into runs of plain, bold and italic text. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  // Bold first: ** binds tighter than * and must not be eaten by it.
  const pattern = /(\*\*[^*]+\*\*|\*[^*\n]+\*|_[^_\n]+_)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;

    if (token.startsWith("**")) {
      out.push(
        <strong key={key} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      out.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Prose({
  text,
  className = "lede text-[0.98rem]",
}: {
  text: string;
  className?: string;
}) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <div className="space-y-4">
      {paragraphs.map((raw, i) => {
        const p = raw.trim();

        // A paragraph that opens with > is a quoted source document.
        if (p.startsWith(">")) {
          const body = p
            .split("\n")
            .map((line) => line.replace(/^>\s?/, ""))
            .join(" ")
            .trim();
          return (
            <blockquote
              key={i}
              className="border-l-2 border-gold/60 pl-5 text-[0.95rem] italic leading-relaxed text-ink-soft"
            >
              {inline(body, `q${i}`)}
            </blockquote>
          );
        }

        return (
          <p key={i} className={className}>
            {inline(p.replace(/\n/g, " "), `p${i}`)}
          </p>
        );
      })}
    </div>
  );
}
