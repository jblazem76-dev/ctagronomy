import { PRODUCTS, PROGRAMS } from '../data/content.mjs';
import { SEARCH_STATIC } from '../data/site.mjs';

export function GET() {
  const index = [
    ...PRODUCTS.map((p) => ({ t: p.name + (p.grade ? ' ' + p.grade : ''), k: 'Product · ' + p.kicker, s: p.head, href: p.href, title: p.name.toLowerCase(), text: [p.name, p.grade, p.kicker, p.head, ...p.bens, ...p.agents.map((a) => a.k), p.note, ...p.rates.map((r) => r.k + ' ' + r.v)].join(' ').toLowerCase(), prod: 1 })),
    ...PROGRAMS.map((g) => ({ t: g.title.replace(/\.$/, ''), k: 'Seasonal program', s: g.science, href: '/programs', title: g.title.toLowerCase(), text: [g.title, g.science, g.cons, g.sol, ...g.prods.map((x) => x.name)].join(' ').toLowerCase() })),
    ...SEARCH_STATIC,
  ];
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
}
