/**
 * Downloads the ambient layers so the listening room serves them from
 * this site rather than from whoever published them.
 *
 * Every file here is CC0 or CC BY. The attribution each licence
 * requires is rendered on the page beside its fader and must stay
 * there. Run with: npm run fetch:audio
 *
 * Some networks block cdn.freesound.org. Anything that fails is
 * skipped rather than fatal, and the page falls back to streaming it.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "src", "lib", "content", "music.ts");
const outDir = path.join(root, "public", "media", "audio");

/* The module is TypeScript, so read the ids and urls out of it rather
   than importing it and needing a loader. */
const text = fs.readFileSync(source, "utf8");
const layers = [];
const re = /id:\s*"([^"]+)",[\s\S]*?remoteUrl:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(text)) !== null) layers.push({ id: m[1], url: m[2] });

if (layers.length === 0) {
  console.error("No layers found in music.ts. Has its shape changed?");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

let available = 0;
for (const layer of layers) {
  const file = path.join(outDir, `${layer.id}.mp3`);

  if (fs.existsSync(file) && fs.statSync(file).size > 1024) {
    console.log(`have     ${layer.id}`);
    available += 1;
    continue;
  }

  try {
    const res = await fetch(layer.url, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024) throw new Error("suspiciously small");
    fs.writeFileSync(file, buf);
    console.log(`saved    ${layer.id}  ${(buf.length / 1e6).toFixed(1)}MB`);
    available += 1;
  } catch (err) {
    console.warn(`skipped  ${layer.id}  ${err.message}`);
  }
}

console.log(`\n${available} of ${layers.length} layers are local.`);
console.log("Anything skipped still streams from its original host.");
