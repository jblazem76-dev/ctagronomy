import { PRODUCTS, LABEL_LIST, labelOf } from '../data/content.mjs';
import { NUTRIENT_ORDER } from '../data/site.mjs';

export function GET() {
  const data = { order: NUTRIENT_ORDER, products: PRODUCTS.map((p) => ({ ...p, label: labelOf(p.slug) })) };
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}
