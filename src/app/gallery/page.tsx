import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { Container, Section, SectionHeading } from "@/components/Section";
import Carousel, { type Shot } from "@/components/Carousel";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Chhobi",
  description:
    "Photographs and film from the IISc Sharodiya Durgotsab, alongside the paintings and prints that shaped how Bengal pictures the goddess.",
};

const ALBUMS = [
  {
    dir: "puja2025",
    title: "Last year on this ground",
    bangla: "গত বছরের পুজো",
    note: "Forty four photographs from the 2025 Puja, taken by people who were standing in the queue themselves.",
    sepia: false,
    aspect: "4/5",
  },
  {
    dir: "puja",
    title: "Earlier years",
    bangla: "আগের বছরগুলি",
    note: "The pandal, the idol and the crowd, from the years before that.",
    sepia: false,
    aspect: "4/5",
  },
  {
    dir: "iisc",
    title: "The campus itself",
    bangla: "প্রাঙ্গণ",
    note: "The Main Building, standing under these rain trees since 1913.",
    sepia: true,
    aspect: "16/10",
  },
  {
    dir: "art",
    title: "How Bengal pictured her",
    bangla: "চিত্রে দুর্গা",
    note: "Manuscript folios, Company school watercolours and Nandalal Bose, for a festival that was always an art form first.",
    sepia: true,
    aspect: "4/5",
  },
] as const;

const FILMS = [
  {
    src: "/media/video/sindoor-khela.mp4",
    poster: "/media/video/sindoor-khela.jpg",
    title: "Sindoor Khela",
    bangla: "সিঁদুর খেলা",
  },
  {
    src: "/media/video/cultural-night.mp4",
    poster: "/media/video/cultural-night.jpg",
    title: "The cultural evening",
    bangla: "সাংস্কৃতিক সন্ধ্যা",
  },
  {
    src: "/media/video/bisarjan.mp4",
    poster: "/media/video/bisarjan.jpg",
    title: "Bisarjan, leaving the campus",
    bangla: "বিসর্জন",
  },
];

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
            eyebrow="ছবি Gallery"
            title="Five days, kept"
            bangla="স্মৃতির অ্যালবাম"
            lede="Drag sideways, or use the arrows. Tap any frame to open it. Send us yours and they go up here too."
          />
        </Container>
      </Section>

      {albums.map((album, i) => (
        <Section key={album.dir} className={i === 0 ? "!pt-0" : "!pt-[2.618rem]"}>
          <Container>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
              <div>
                <h2 className="bangla-display text-[1.4rem] text-ink">
                  {album.bangla}
                </h2>
                <p className="font-display text-[1.05rem] text-ink-soft">
                  {album.title}
                </p>
              </div>
              <p className="max-w-[48ch] text-[0.78rem] leading-relaxed text-ink-faint">
                {album.note}
              </p>
            </div>
            <Carousel
              shots={album.shots}
              sepia={album.sepia}
              aspect={album.aspect}
            />
          </Container>
        </Section>
      ))}

      <Section className="bg-paper-2/40">
        <Container>
          <SectionHeading
            eyebrow="ছবি চলমান Moving picture"
            title="Three minutes of last year"
            bangla="গত বছরের কিছু মুহূর্ত"
            lede="Short clips, no sound, shot on phones by whoever had a free hand."
          />
          <div className="mt-[2.618rem] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FILMS.map((f, i) => (
              <Reveal key={f.src} delay={i * 0.06}>
                <figure>
                  <video
                    src={f.src}
                    poster={f.poster}
                    controls
                    playsInline
                    preload="none"
                    className="w-full border border-line bg-ink"
                  />
                  <figcaption className="mt-2">
                    <span className="bangla-display block text-[1.05rem] text-ink">
                      {f.bangla}
                    </span>
                    <span className="block text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint">
                      {f.title}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
