// One-off: renders public/assets/og-image.jpg (1200x630) for link previews (iMessage, Slack, Facebook, LinkedIn).
// Not part of the build. Needs playwright and the Source Serif 4 woff2 files; usage:
//   node scripts/make-og-image.mjs <fonts-dir-with-woff2> <out.jpg>
// The photo is auto-rotated here because link previews ignore the JPEG's EXIF orientation tag.
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
const { chromium } = createRequire(import.meta.url)(process.env.PW_PATH || 'playwright');
const [fontsDir, out] = process.argv.slice(2);

const photo = await sharp('public/assets/result-fairway-sun.jpg').rotate().resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82 }).toBuffer();
const logo = await readFile('public/assets/cta-logo.png');
const font = async (f) => (await readFile(`${fontsDir}/source-serif-4-latin-${f}.woff2`)).toString('base64');
const [n600, i400] = [await font('600-normal'), await font('400-italic')];
const html = `<!doctype html><meta charset=utf-8><style>
@font-face{font-family:SS;font-weight:600;src:url(data:font/woff2;base64,${n600})}
@font-face{font-family:SS;font-weight:400;font-style:italic;src:url(data:font/woff2;base64,${i400})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;position:relative;overflow:hidden;font-family:SS,serif;color:#fff}
.bg{position:absolute;inset:0;background:url(data:image/jpeg;base64,${photo.toString('base64')}) center/cover}
.sc{position:absolute;inset:0;background:linear-gradient(to top,rgba(20,18,17,.82) 0%,rgba(20,18,17,.5) 45%,rgba(20,18,17,.1) 100%)}
.logo{position:absolute;left:56px;top:48px;display:flex;align-items:center;gap:18px;background:#f3f2f2;padding:12px 22px 12px 14px;border-radius:2px;color:#201e1d}
.logo img{height:64px;width:auto}.logo span{font-weight:600;font-size:30px;letter-spacing:-.01em}
h1{position:absolute;left:56px;bottom:84px;font-size:112px;line-height:.95;font-weight:600;letter-spacing:-.03em}
h1 span{display:block}h1 em{display:block;font-weight:400;font-style:italic}
.u{position:absolute;left:56px;bottom:34px;font-size:22px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;font-family:SS}
</style><div class=bg></div><div class=sc></div>
<div class=logo><img src="data:image/png;base64,${logo.toString('base64')}"><span>Central Turf Agronomy</span></div>
<h1><span>High Performance.</span><em>Max returns.</em></h1><div class=u>ctagronomy.com</div>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: out + '.png' });
await b.close();
await sharp(out + '.png').jpeg({ quality: 84, mozjpeg: true }).toFile(out);
