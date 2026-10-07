// Page copy lifted verbatim from the design reference.
import { bySlug, CHO_ORDER, PROGRAMS } from './content.mjs';

export const SITE = {
  name: 'Central Turf Agronomy',
  url: 'https://www.ctagronomy.com',
  phone: '563-210-1616',
  phoneHref: 'tel:5632101616',
  email: 'ctagronomy@gmail.com',
  tagline: 'Practical, science-led turf inputs for superintendents, turf managers, and landscape teams who need predictable outcomes.',
  description: 'Practical, science-led turf inputs for superintendents, turf managers, and landscape teams who need predictable outcomes.',
};

export const NAV = [
  ['Home', '/'], ['Products', '/products'], ['Programs', '/programs'], ['Science', '/science'],
  ['Resources', '/resources'], ['Dealer', '/dealer'], ['Contact', '/contact'],
].map(([label, href]) => ({ label, href }));

export const STEPS = [
  { n: '01', t: 'Feed the plant', b: 'Target photosynthesis with efficient foliar support.', prods: ['c-color-n', 'c-starter', 'c-strength-micros'].map(bySlug) },
  { n: '02', t: 'Condition the soil', b: 'Build structure and oxygen movement for roots.', prods: ['c-soils', 'humic'].map(bySlug) },
  { n: '03', t: 'Manage soil moisture', b: 'Keep the root zone even, without the swings.', prods: ['push-hold-plus'].map(bySlug) },
];
export const CHO_PRODUCTS = CHO_ORDER.map(bySlug);
export const GALLERY = [
  { src: '/assets/result-green-pond.jpg', alt: 'Putting green with pond' },
  { src: '/assets/result-field-stripes.jpg', alt: 'Striped football field' },
  { src: '/assets/result-tee-fountain.jpg', alt: 'Tee box beside a fountain pond' },
  { src: '/assets/result-golf-shade.jpg', alt: 'Golf green with tree shadows' },
];
export const APPLY_STEPS = [
  { n: '01', t: 'Apply', b: 'Tell us about your business and the territory you want to cover.' },
  { n: '02', t: 'Talk territory', b: 'Brent calls to walk through your market, customers and current lines.' },
  { n: '03', t: 'Opening order and training', b: 'Place a starter order and work through the product and program training.' },
];
export const DEALER_STEPS = [
  { n: '01', t: 'Program support', b: 'Seasonal plans built for the surfaces your customers manage.' },
  { n: '02', t: 'Technical backing', b: 'Rates, tank mix compatibility and troubleshooting, direct from us.' },
  { n: '03', t: 'A line that differentiates', b: 'Six carbon enhanced formulations nobody else is carrying.' },
];
export const DEALER_GET = [
  { t: 'Seasonal Program Guides', b: 'Ready-to-use application schedules for spring, summer, aeration, and color-building programs tailored to your region.' },
  { t: 'Complete Product Lineup', b: '9 foliar products + 7 granular products designed to work as an integrated system.' },
  { t: 'Professional Training', b: '6-module certification covering soil science fundamentals, calculator use, and seasonal programming.' },
  { t: 'Marketing Resources', b: 'Proven content, before/after templates, and technical materials to support client conversations.' },
  { t: 'Ongoing Support', b: 'Direct access to agronomist expertise. Seasonal program guidance. Partner community.' },
];
export const DEALER_WHO = 'Lawn care professionals · Landscape maintenance teams · Turf managers · Golf course superintendents · Sports field managers · Agronomic consultants';
export const HELP_LIST = [
  'Build a seasonal plan for your turf conditions and traffic demands.',
  'Match CTA inputs to your current fertility and moisture strategy.',
  'Coordinate delivery timing across multiple sites.',
];
export const SUGGEST = ['Iron', 'Calcium', 'Aeration', 'Summer stress', 'Labels'];
export const NUTRIENT_ORDER = ['total nitrogen', 'ammoniacal', 'nitrate', 'urea', 'other water', 'available phosphate', 'soluble potash', 'calcium', 'chelated calcium', 'magnesium', 'sulfur', 'boron', 'copper', 'iron', 'manganese', 'molybdenum', 'zinc', 'silica', 'humic'];
export const SURFACES = ['Golf courses', 'Recreational surfaces', 'College & high school fields', 'Commercial landscaping'];

export const SEARCH_STATIC = [
  { t: 'Science', k: 'Page', s: 'The Carbon Advantage (CHO), photosynthesis vs. respiration, foliar nutrition.', href: '/science', title: 'science', text: 'science cho carbon hydrogen oxygen photosynthesis respiration foliar nutrition soil moisture sensor field readings green salinity' },
  { t: 'Product catalog 2026', k: 'Resource · PDF', s: 'Every product, rate and seasonal program in one document.', href: '/resources', title: 'catalog', text: 'catalog pdf download rates brochure 2026' },
  { t: 'Product labels', k: 'Resource · PDF', s: 'Front and back labels for every registered product.', href: '/resources', title: 'labels', text: 'label labels sds pdf download front back registration' },
  { t: 'The CTA 3-Step Method', k: 'Resource', s: 'Feed the Plant. Condition the Soil. Manage Soil Moisture.', href: '/resources', title: '3-step method', text: '3 step three method chart feed plant condition soil manage moisture' },
  { t: 'Compare products', k: 'Tool', s: 'Line up to three products side by side.', href: '/compare', title: 'compare', text: 'compare comparison side by side versus vs difference analysis' },
  { t: 'Become a dealer', k: 'Page', s: 'Now appointing founding dealers.', href: '/dealer', title: 'dealer', text: 'dealer distributor partner territory apply application become reseller wholesale' },
  { t: 'Request a quote', k: 'Page', s: 'Program guidance, custom timing or volume pricing.', href: '/contact', title: 'contact', text: 'contact quote price pricing order buy phone email address brent' },
];
