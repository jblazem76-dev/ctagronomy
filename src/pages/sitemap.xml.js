import { PRODUCTS } from '../data/content.mjs';
import { SITE } from '../data/site.mjs';

export function GET() {
  const paths = ['/', '/products', '/compare', '/programs', '/science', '/resources', '/dealer', '/contact', ...PRODUCTS.map((p) => p.href)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${SITE.url}${p === '/' ? '' : p}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
