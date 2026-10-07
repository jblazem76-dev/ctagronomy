# Assets

Originals from the design handoff assets bundle (logo, photos, jug PNGs, label PDFs, favicons).

`opt/` is generated, not committed: `npm run optimize` (run automatically by `npm run dev` and
`npm run build`) writes responsive AVIF and WebP variants there from the originals. Pages use
`src/components/Img.astro`, which serves those variants and keeps the original as the fallback.
The first run takes a few minutes; later runs skip files that are already up to date.

`products/` holds the older label scans, kept for reference only and not used by the site.
