import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { Container, Section, SectionHeading } from "@/components/Section";
import Lightbox, { type Shot } from "@/components/Lightbox";

export const metadata: Metadata = {
  title: "Chhobi",
  description:
    "Photographs from the IISc Sharodiya Durgotsab, alongside the paintings and prints that shaped how Bengal pictures the goddess.",
};

const ALBUMS = [
  {
    dir: "puja",
    title: "The Puja on campus",
    bangla: "ক্যাম্পাসের পুজো",
    note: "Previous years, photographed by people who were standing in the queue themselves.",
  },
  {
    dir: "iisc",
    title: "The campus itself",
    bangla: "প্রাঙ্গণ",
    note: "The Main Building, standing under these rain trees since 1913.",
  },
  {
    dir: "art",
    title: "How Bengal pictured her",
    bangla: "চিত্রে দুর্গা",
    note: "Manuscript folios, Company-school watercolours and Nandalal Bose, for a festival that has always been an art form first.",
  },
] as const;

/** Reads whatever the committee has dropped into public/media. */
function readAlbum(dir: string): Shot[] {
  const abs = path.join(process.cwd(), "public", "media", dir);
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(abs)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    return [];
  }
  return files.map((f) => ({
    src: `/media/${dir}/${f}`,
    alt: f
      .replace(/\.[a-z]+$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  }));
}

export default function GalleryPage() {
  const albums = ALBUMS.map((a) => ({ ...a, shots: readAlbum(a.dir) })).filter(
    (a) => a.shots.length > 0,
  );

  return (
    <>
      <Section className="pt-[7.5rem] sm:pt-[9rem]">
        <Container>
          <SectionHeading
            eyebrow="ছবি · Gallery"
            title="Four days, kept"
            bangla="স্মৃতির অ্যালবাম"
            lede="Photographs from previous years on this campus, the Institute itself, and the paintings that fixed how Bengal imagines the goddess. Send us yours and they go up here."
          />
        </Container>
      </Section>

      {albums.map((album, i) => (
        <Section
          key={album.dir}
          className={`!pt-0 ${i > 0 ? "!pt-[2.618rem]" : ""}`}
        >
          <Container>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
              <div>
                <h2 className="bangla text-[1.272rem] font-semibold text-ink">
                  {album.bangla}
                </h2>
                <p className="font-display text-[1.05rem] text-ink-soft">
                  {album.title}
                </p>
              </div>
              <p className="max-w-[46ch] text-[0.78rem] leading-relaxed text-ink-faint">
                {album.note}
              </p>
            </div>
            <Lightbox shots={album.shots} sepia={album.dir !== "puja"} />
          </Container>
        </Section>
      ))}

      {albums.length === 0 && (
        <Section className="!pt-0">
          <Container>
            <p className="surface p-8 text-center text-[0.9rem] text-ink-soft">
              No photographs yet. Drop images into public/media and they appear
              here automatically.
            </p>
          </Container>
        </Section>
      )}
    </>
  );
}
