// Generates responsive AVIF + WebP variants into public/assets/opt (gitignored).
// Originals stay untouched and remain the <img> fallback. Skips up-to-date outputs.
import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { WIDTHS } from '../src/data/image-widths.mjs';
const SRC = fileURLToPath(new URL('../public/assets', import.meta.url));
const OUT = join(SRC, 'opt');
const SKIP = /^(favicon-|cta-qr)/;

async function* walk(dir, rel = '') {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (['opt', 'labels', 'products'].includes(e.name)) continue;
      yield* walk(join(dir, e.name), join(rel, e.name));
    } else if (/\.(jpe?g|png)$/i.test(e.name) && !SKIP.test(e.name)) yield join(rel, e.name);
  }
}
const fresh = async (out, src) => { try { return (await stat(out)).mtimeMs >= (await stat(src)).mtimeMs; } catch { return false; } };

let made = 0;
for await (const rel of walk(SRC)) {
  const src = join(SRC, rel);
  const meta = await sharp(src).metadata();
  const base = join(OUT, rel.slice(0, -extname(rel).length));
  await mkdir(join(base, '..'), { recursive: true });
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, meta.width)))];
  for (const w of widths) {
    for (const fmt of ['avif', 'webp']) {
      const out = `${base}-${w}.${fmt}`;
      if (await fresh(out, src)) continue;
      const img = sharp(src).rotate().resize({ width: w, withoutEnlargement: true });
      await (fmt === 'avif' ? img.avif({ quality: 48, effort: 3 }) : img.webp({ quality: 78 })).toFile(out);
      made++;
    }
  }
}
console.log(`optimize-images: ${made} files written`);
