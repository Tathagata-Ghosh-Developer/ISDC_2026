import fs from "node:fs";
import path from "node:path";
import { AMBIENCE } from "@/lib/content/music";

export const runtime = "nodejs";

/**
 * Serves an ambient layer from our own origin.
 *
 * Three problems disappear at once. The browser's content policy no
 * longer has to allow a third-party host for `fetch`, which it must
 * for Web Audio to decode a buffer. Cross-origin headers stop
 * mattering, because there is no longer a cross origin. And a visitor
 * on a network that cannot reach the original host, which is the case
 * on the campus this site is built on, still hears the sound.
 *
 * A local copy under public/media/audio always wins. Run
 * `npm run fetch:audio` to make that the normal case; this route is
 * the fallback, not the plan.
 */

const ONE_YEAR = "public, max-age=31536000, immutable";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const layer = AMBIENCE.find((l) => l.id === id);
  if (!layer) return new Response("No such layer.", { status: 404 });

  // A file we already hold is served straight off disk.
  const local = path.join(process.cwd(), "public", "media", "audio", `${id}.mp3`);
  if (fs.existsSync(local)) {
    const body = fs.readFileSync(local);
    return new Response(new Uint8Array(body), {
      headers: {
        "content-type": "audio/mpeg",
        "content-length": String(body.length),
        "cache-control": ONE_YEAR,
        "accept-ranges": "bytes",
      },
    });
  }

  // Otherwise fetch it once and let the edge cache keep it.
  try {
    const range = req.headers.get("range");
    const upstream = await fetch(layer.remoteUrl, {
      headers: range ? { range } : undefined,
      cache: "force-cache",
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("The source for this layer did not answer.", {
        status: 502,
      });
    }

    const headers = new Headers({
      "content-type": upstream.headers.get("content-type") ?? "audio/mpeg",
      "cache-control": ONE_YEAR,
      "accept-ranges": "bytes",
    });
    const len = upstream.headers.get("content-length");
    if (len) headers.set("content-length", len);
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers.set("content-range", contentRange);

    return new Response(upstream.body, {
      status: upstream.status === 206 ? 206 : 200,
      headers,
    });
  } catch {
    return new Response("Could not reach the source for this layer.", {
      status: 502,
    });
  }
}
