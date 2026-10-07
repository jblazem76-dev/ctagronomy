// Lifted verbatim from the design reference (CTA Website v2.dc.html). Do not rewrite copy.
const P = (slug, name, grade, kicker, head, bens, agents, note, rates, extra) => ({ form: 'Liquid', slug, name, grade, kicker, head, bens, agents: agents.map(([k, v]) => ({ k, v })), note, rates: rates.map(([k, v]) => ({ k, v })), cho: kicker === 'Carbon Enhanced Formulation', href: '/products/' + slug, ...(extra || {}) });
const CEF = 'Carbon Enhanced Formulation';
const PRODUCTS = [
  P('c-color-n', 'C-Color-N', '20-2-5', 'Color Enhancer', 'Resilient, vibrant color.',
    ['Micronutrient enhanced nitrogen for superior color', 'Recover from traffic, mechanical and player wear', '60% slow release to avoid growth surges'],
    [['Total Nitrogen (N)', '20.0%'], ['Urea nitrogen', '6.0%'], ['Other water-soluble nitrogen', '12.0%'], ['Available Phosphate (P2O5)', '2.0%'], ['Soluble Potash (K2O)', '5.0%'], ['Boron (B)', '0.02%'], ['Iron (Fe)', '0.20%'], ['Molybdenum (Mo)', '0.0005%']],
    'Derived from urea triazone, potassium thiosulfate, iron EDTA, boric acid, sodium molybdate. Contains 1% slowly available nitrogen from urea triazone.',
    [['Turfgrass', 'Apply 1.5 – 9.0 ounces per 1000 square feet in sufficient water for coverage.']]),
  P('c-starter', 'C-Starter', '3-18-18', 'Growth & Rooting', 'Highly soluble P&K.',
    ['Initiate rooting with highly soluble phosphate', 'Particularly beneficial under cool soil temperatures', 'Aids cellular division and strength with soluble potassium'],
    [['Total Nitrogen (N)', '3.0%'], ['Ammoniacal nitrogen', '0.73%'], ['Nitrate nitrogen', '0.73%'], ['Urea nitrogen', '1.54%'], ['Available Phosphate (P2O5)', '18.0%'], ['Soluble Potash (K2O)', '18.0%']],
    'Derived from urea, ammonium nitrate and di-potassium phosphate. All phosphate is in the plant-available ortho phosphate form.',
    [['Turfgrass and sod', 'Apply 1.5 – 9.0 ounces per 1000 square feet in sufficient water for coverage.']]),
  P('c-strength-micros', 'C-Strength-Micros', '', CEF, 'Sugar based micros.',
    ['Glucoheptonate micros for rapid foliar absorption', 'Chlorophyll production that maximizes photosynthesis', 'Dark green color without excessive top growth'],
    [['Magnesium (Mg)', '1.0%'], ['Boron (B)', '0.02%'], ['Iron (Fe)', '3.0%'], ['Manganese (Mn)', '4.0%'], ['Zinc (Zn)', '0.02%']],
    'All micronutrients fully chelated. Derived from magnesium, iron, manganese and zinc glucoheptonate, and boric acid.',
    [['Maintenance', '3 to 6 ounces per 1000 square feet.'], ['Deficiency correction', '8 to 12 ounces per 1000 square feet.'], ['Interval', 'Every 7 to 14 days as needed.']]),
  P('phosphite-blue', 'Phosphite Blue', '', 'Foliar Treatment Supplement', 'Boost stress tolerance.',
    ['Withstand heat, drought and other stressors', 'Foliar or root uptake for faster results', 'Aids cellular division with highly soluble potassium'],
    [['Soluble Potash (K2O)', '26.0%']],
    'Derived from potassium phosphite — a blend of mono and di-potassium salts of phosphorous acid.',
    [['Cool season', '1.5 to 6 ounces per 1000 sq ft, every 7–14 days during stress.'], ['Warm season', '3 to 8 ounces per 1000 sq ft, every 7–14 days during stress.'], ['Fairways, sports turf, sod & lawns', '1.5 to 6 ounces per 1000 sq ft in a minimum of 50 gallons of water per acre, every 14–21 days during stress.']]),
  P('c-roots-aminos', 'C-Roots-Aminos', '6-2-3', CEF, 'Drive roots.',
    ['Enhance photosynthesis and glucose production', 'Build deeper roots in spring and fall', 'Maintain roots through summer and mitigate stress'],
    [['Total Nitrogen (N)', '6.0%'], ['Available Phosphate (P2O5)', '2.0%'], ['Soluble Potash (K2O)', '3.0%']],
    'Supplemental fertilizer enhanced with secondary metabolites and a proprietary biostimulant package.',
    [['Initial application', 'Foliar spray at 6.0–9.0 ounces per 1000 square feet.'], ['Maintenance', 'Foliar spray at 3.0–6.0 ounces per 1000 sq ft every 10–14 days.'], ['Soil applications', '9.0–12.0 ounces per 1000 sq ft every 15–30 days.']]),
  P('c-energy-calcium', 'C-Energy-Calcium', '', CEF, 'Build cell walls, lower heat stress.',
    ['Lower respiration stress and build thick cell walls', 'Initiate rooting in spring and fall, maintain in summer', 'Increase wear tolerance'],
    [['Calcium (Ca)', '10.0%'], ['Chelated calcium (Ca)', '10.0%']],
    'Derived from calcium glucoheptonate. Dual complexed and engineered for maximum tank mix compatibility.',
    [['Greens and tees', '3 to 8 ounces per 1000 square feet.'], ['Fairways', '1.5–8.0 ounces per 1000 square feet.'], ['Ornamentals', '2 to 4 quarts in 100 gallons of water. Repeat as needed.']]),
  P('humic', 'Humic', '', CEF, 'Highly concentrated carbon.',
    ['Feed microbes with high carbon humic and fulvic acids', 'Improve soil nutrient availability and cycling', 'Hold nutrients in sandy soils, open pore space in clay'],
    [['Humic Acid', '20.0%']],
    'Derived from leonardite ore. Contains a non-plant food ingredient.',
    [['Foliar', '0.74–2.2 ounces per 1000 sq ft in spray solution with other nutrients.'], ['Soil', '1 part Humic to 100 parts water, injected at 64–192 ounces per treated acre.'], ['Turfgrass', '1.5 to 3.0 ounces per 1000 sq ft monthly. Water in for best results.']]),
  P('c-soils', 'C-Soils', '1-0-2', CEF, 'Total soil conditioner.',
    ['Enhance microbial proliferation', 'Increase nutrient cycling and availability', 'Increase oxygen evolution for photosynthesis'],
    [['Total Nitrogen (N)', '1.0%'], ['Soluble Potash (K2O)', '2.0%']],
    'Derived from plant sugars, soy protein hydrolysate, fulvic acid and humic acid. Enhanced with amino acids and silica.',
    [['Turfgrass and sod', 'Apply 3.0–6.0 ounces per 1000 square feet with sufficient water for coverage, every 14–28 days.']]),
  P('push-hold-plus', 'Push-Hold+', '', CEF, 'Your best secret agent.',
    ['Pushes holding surfactants deeper into the soil profile', 'One third penetrant, two thirds retention', 'Humic acid addition feeds microbes carbon'],
    [['Copolymer, sulfonic acid and alcohol ethoxylate blend', '90%'], ['Humic Acid', '2.0%']],
    'Blend of ethylene oxide-propylene oxide copolymers, alkylbenzene sulfonic acid and alcohol ethoxylates.',
    [['Initial', '6.0 ounces per 1000 sq ft in 2 gallons of water.'], ['Reapplication', '3.0–6.0 ounces per 1000 sq ft every 30 days if symptoms prevail.'], ['Bi-weekly', '1.5–3.0 ounces per 1000 sq ft. Immediate watering-in is not necessary.']]),
  P('green-glo-max', 'Green Glo Max (Dry)', '', 'Water Soluble Fertilizer', 'The color correction. In dry form.',
    ['Concentrated iron and sulfur for deep, lasting color', '2.5–5 lbs per acre covers broad areas economically', 'Copper, magnesium, manganese and zinc in one pass'],
    [['Total Nitrogen (N)', '7.00%'], ['Nitrate nitrogen', '3.50%'], ['Ammoniacal nitrogen', '3.50%'], ['Sulfur (S)', '12.00%'], ['Copper (Cu)', '0.500%'], ['Iron (Fe)', '9.00%'], ['Magnesium (Mg)', '4.00%'], ['Manganese (Mn)', '2.00%'], ['Zinc (Zn)', '2.00%']],
    'Derived from ammonium nitrate, iron sulfate, copper sulfate, magnesium sulfate, manganese sulfate, zinc sulfate, citric acid, sodium EDTA, sodium glucoheptonate.',
    [['Turf (greens, tees, fairways)', '1–2 oz per 1000 sq ft, or 2.5–5 lbs per acre.'], ['Landscape / ornamentals', '1–2 oz per gallon, or 5–10 lbs per 100 gallons.'], ['Mixing', 'Add to the spray tank first and let it dissolve completely before adding other products. Premix as a slurry or rinse through a strainer basket; warm water helps.']],
    { form: 'Dry · water-soluble powder', caution: 'CAUTION: contains copper, iron, manganese and zinc. Misuse may prove harmful. Do not use with highly alkaline spray materials, Bordeaux or spray oils.' }),
  P('green-glo-max-l', 'Green Glo Max L', '7-0-1', 'Liquid Fertilizer Blend', 'Fast color, low rate.',
    ['Chelated micronutrients for rapid foliar color response', 'Seaweed extract to support rich, green foliage', 'Low use rate for color without heavy nitrogen loading', 'Labeled for turf and ornamentals'],
    [['Total Nitrogen (N)', '7.0%'], ['Soluble Potash (K2O)', '1.0%'], ['Sulfur (S)', '4.5%'], ['Boron (B)', '0.02%'], ['Iron (Fe)', '6.0%'], ['Manganese (Mn)', '0.50%'], ['Zinc (Zn)', '0.40%']],
    'Derived from urea, kelp, sodium borate, ferrous sulfate heptahydrate, manganese sulfate, zinc sulfate, potassium hydroxide. For professional use only.',
    [['Greens, tees & fairways', '1–2 oz per 1000 square feet every 14–21 days.'], ['Sports turf', '1–2 oz per 1000 square feet every 2–4 weeks.'], ['Ornamentals', '1–2 quarts per 100 gallons of water.']]),
  P('efficiensi', 'EfficienSi', '', 'Foliar or Soil Treatment', 'More of what you apply, where it matters.',
    ['Moves what is already in your tank into the plant', 'Works with herbicides, fungicides, growth regulators and nutrients', 'Silica-based plant strengthening', 'Less product wasted on the surface'],
    [['Silica', '10%']],
    'Non-plant food ingredient. Derived from silica, protein hydrolysates and vegetal extracts. Enhanced with EfficienSi technology.',
    [['Rate', '4 to 8 oz per acre in a minimum of 20 gallons of water.'], ['Greens & tees', '7–14 day intervals.'], ['Fairways / sports turf', '14–28 days / 2–4 weeks.'], ['Residential lawns', '4–8 weeks.']]),
  P('every-tank', 'Every Tank', '', 'Tank Mix Conditioner', 'Spray tank acidifier.',
    ['Increase tank mix compatibility', 'Lower application rates and lower costs', 'Fewer chemicals into the environment', 'Improved efficacy'],
    [['Acidifiers', '20%'], ['Emulsifiers', '0.5%'], ['Color indicator', '1.0%'], ['Inert ingredients', '78.5%']],
    'Color key — pale yellow: pH 7.0. Golden yellow: pH 6.0–6.5. Red: pH 4.5–5.0.',
    [['Typical rate', '4–8 ounces per 100 gallons of water, lowering pH from 8.5 to 5.0 depending on water source.'], ['Order matters', 'Add Every Tank to the spray tank before pesticides or fertilizers. A jar test is always recommended.']]),
];
const bySlug = s => PRODUCTS.find(p => p.slug === s);
const NAME_TO_SLUG = { 'C-Color-N': 'c-color-n', 'C-Starter 3-18-18': 'c-starter', 'C-Energy-Calcium': 'c-energy-calcium', 'C-Strength-Micros': 'c-strength-micros', 'C-Soils': 'c-soils', 'Humic': 'humic', 'Push-Hold+': 'push-hold-plus', 'Green Glo Max L': 'green-glo-max-l', 'Phosphite Blue': 'phosphite-blue' };
const links = names => names.map(name => ({ name, href: '/products/' + NAME_TO_SLUG[name] }));
const PROGRAMS = [
  { n: '01', title: 'Aeration recovery plan.', img: '/assets/photo-aeration.jpg',
    science: 'Aeration reduces thatch, increases gas exchange and relieves compaction. Heavy granular nitrogen is often applied just before or after to speed recovery.',
    cons: 'Surge growth from heavy nitrogen speeds recovery but increases thatch, reversing the purpose of aerating. It also slows greens and forces excessive mowing, opening turf to disease.',
    sol: 'Foliar application 1–3 days before aeration loads the plant with a recovery package. Soil application at the same time releases tied-up nutrients and increases CO₂ evolution.',
    prods: links(['C-Color-N', 'C-Starter 3-18-18', 'C-Energy-Calcium', 'C-Strength-Micros', 'C-Soils', 'Humic', 'Push-Hold+']) },
  { n: '02', title: 'Color builder plan.', img: '/assets/result-green-pond.jpg',
    science: 'Nitrogen and iron get the credit for color, but magnesium, manganese, zinc and phosphorus are the missing links. Chlorophyll is a magnesium core surrounded by four nitrogen molecules.',
    cons: 'Off-color turf is sometimes desirable for firm, fast conditions. The cost is poor carbohydrate production and limited roots, leaving the surface exposed to disease and drought.',
    sol: 'Regular applications of nitrogen and phosphorus with a balanced micronutrient package keep color and carbohydrate production linear, while still controlling firm, fast playing conditions.',
    prods: links(['C-Color-N', 'C-Starter 3-18-18', 'C-Strength-Micros', 'Green Glo Max L']) },
  { n: '03', title: 'Spring start-up plan.', img: '/assets/photo-dew.jpg',
    science: 'Cool soil temperatures work against soil and granular applications. Microbial activity is low and the conversions those products depend on simply do not run.',
    cons: 'Granular gives no immediate response, then too much response once soils hold above 60°F. Runoff and leaching turn into wasted cost and an environmental problem.',
    sol: 'Foliar applications, one or two 7–14 days apart, once soil temperatures reach the upper 50s in the top two inches — usually late March or early April. Save the granular for late April.',
    prods: links(['C-Color-N', 'C-Starter 3-18-18', 'C-Energy-Calcium', 'C-Strength-Micros']) },
  { n: '04', title: 'Summer stress plan.', img: '/assets/photo-blades.jpg',
    science: 'Root decline and disease pressure rise when respiration outpaces photosynthesis. Respiration burns carbohydrates; photosynthesis makes them. Every fertility plan should tilt that balance.',
    cons: 'When turf quality turns poor from root decline or disease, the plant has usually consumed more food than it made. There is no simple fix once it reaches that point.',
    sol: 'Sugar-based raw materials act like an I.V. for turf, lowering respiration. Potassium lets the plant control its stomates and cool itself. Phosphites aid ATP production and protect against pythium.',
    prods: links(['C-Color-N', 'C-Starter 3-18-18', 'C-Energy-Calcium', 'C-Strength-Micros', 'Phosphite Blue']) },
];
const CATS = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.kicker)))];

const CHO_ORDER = ['c-strength-micros', 'c-roots-aminos', 'c-energy-calcium', 'humic', 'c-soils', 'push-hold-plus'];
const HEROES = { 'Fairway': '/assets/result-fairway-sun.jpg', 'Football field': '/assets/result-field-stands.jpg', 'Campus lawn': '/assets/photo-campus.jpg', 'Putting green': '/assets/result-green-pond.jpg' };
const DETAIL_PHOTOS = ['/assets/result-ball-closeup.jpg', '/assets/result-green-ball.jpg', '/assets/result-tee-fountain.jpg', '/assets/result-golf-shade.jpg', '/assets/result-field-stripes.jpg'];
const LABELLED = ['c-color-n', 'c-starter', 'c-strength-micros', 'phosphite-blue', 'c-roots-aminos', 'c-energy-calcium', 'humic', 'c-soils', 'push-hold-plus', 'green-glo-max-l', 'green-glo-max', 'efficiensi', 'every-tank'];
const SINGLE_LABEL = ['green-glo-max'];
const labelOf = slug => LABELLED.includes(slug) ? { front: '/assets/labels/' + slug + '-front.pdf', back: SINGLE_LABEL.includes(slug) ? '' : '/assets/labels/' + slug + '-back.pdf', frontLabel: SINGLE_LABEL.includes(slug) ? 'Label' : 'Front' } : null;
const LABEL_LIST = [...LABELLED.map(s => { const p = bySlug(s); return { name: p.name, grade: p.grade, href: p.href, ...labelOf(s) }; })];
const SOIL_TESTS = [
  { src: '/assets/soil-test-jul12.png', when: '12 July · 1:45 PM', moist: '18.8%', temp: '87°F', sal: '0.25 dS/m' },
  { src: '/assets/soil-test-jul13.png', when: '13 July · 10:57 AM', moist: '21.7%', temp: '87°F', sal: '0.19 dS/m' },
  { src: '/assets/soil-test-jul14.png', when: '14 July · 6:11 AM', moist: '21.1%', temp: '70°F', sal: '0.24 dS/m' },
].map(t => ({ ...t, alt: 'Soil moisture map of Green 10, ' + t.when + ', average ' + t.moist }));
const PAGES = ['home', 'products', 'compare', 'programs', 'science', 'resources', 'dealer', 'contact'];
const FORM_ENDPOINT = null; // developer: set to the form handler URL that delivers to ctagronomy@gmail.com
const FORM_REQUIRED = { contact: ['fullname', 'email'], quote: ['fullname', 'email'], dealer: ['fullname', 'company', 'email', 'territory'] };
const FIELD_MSG = { fullname: 'Please add your name.', company: 'Please add your company name.', territory: 'Tell us roughly where you would sell.', email: 'Please add your email address.' };
export { P, CEF, PRODUCTS, bySlug, NAME_TO_SLUG, links, PROGRAMS, CATS, CHO_ORDER, HEROES, DETAIL_PHOTOS, LABELLED, SINGLE_LABEL, labelOf, LABEL_LIST, SOIL_TESTS, FORM_REQUIRED, FIELD_MSG };
