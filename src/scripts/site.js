// Site behavior: menu, search, quote popup, forms, filter/compare, motion.
// No framework; each block no-ops when its markup isn't on the page.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
const body = document.body;
const FORM_ENDPOINT = import.meta.env.PUBLIC_FORM_ENDPOINT || '/api/form';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k, d) { try { return JSON.parse(sessionStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const typing = (el) => el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);

/* ---------- mobile menu ---------- */
const toggleBtn = $('[data-menu-toggle]');
function setMenu(open) {
  body.classList.toggle('menu-open', open);
  toggleBtn?.setAttribute('aria-expanded', String(open));
  const drawer = $('#site-drawer');
  drawer?.setAttribute('aria-hidden', String(!open));
  if (open) $('[data-drawer-q]')?.focus({ preventScroll: true });
  else if (toggleBtn && document.activeElement && drawer?.contains(document.activeElement)) toggleBtn.focus();
}
toggleBtn?.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
$$('[data-menu-close]').forEach((b) => b.addEventListener('click', () => setMenu(false)));
$$('#site-drawer a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
matchMedia('(min-width:1060px)').addEventListener('change', (e) => e.matches && setMenu(false));
$('#site-drawer')?.setAttribute('aria-hidden', 'true');

/* ---------- search ---------- */
let indexP;
const loadIndex = () => (indexP ||= fetch('/search-index.json').then((r) => r.json()).catch(() => []));
function runSearch(index, q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const hits = index.filter((e) => words.every((w) => e.text.includes(w) || e.title.includes(w)));
  const full = q.trim().toLowerCase();
  const rank = (e) => (e.title.startsWith(full) ? 0 : e.title.includes(full) ? 1 : e.prod ? 2 : 3);
  return hits.map((e, i) => [rank(e), i, e]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]).slice(0, 10);
}
const resHTML = (r) => `<a class="res" href="${esc(r.href)}"><span><span class="k">${esc(r.k)}</span><br><span class="t">${esc(r.t)}</span></span><span class="s">${esc(r.s)}</span></a>`;
const drawerRes = (r) => `<a class="res" href="${esc(r.href)}"><span class="k">${esc(r.k)}</span><span class="t">${esc(r.t)}</span><span class="s">${esc(r.s)}</span></a>`;
function renderResults(box, results, q, tpl, full) {
  if (!q.trim()) { box.innerHTML = ''; return; }
  if (!results.length) {
    box.innerHTML = full
      ? `<div class="stack" style="gap:12px"><p style="font-size:24px">Nothing matches “${esc(q)}”.</p><p style="font-size:18px" class="muted">Try a product name, a nutrient like iron or calcium, or a season. Or ask us directly: <a href="tel:5632101616">563-210-1616</a>.</p></div>`
      : `<p style="font-size:18px;padding-top:12px">Nothing matches “${esc(q)}”. Try a product name or a nutrient like iron.</p>`;
    return;
  }
  box.innerHTML = `<div class="stack"><span class="res-count">${results.length} result${results.length === 1 ? '' : 's'}</span>${results.map(tpl).join('')}</div>`;
}

const ov = $('[data-search]');
const sq = $('[data-search-q]');
const sres = $('[data-search-results]');
const sug = $('[data-suggest]');
async function updateOverlay() {
  const q = sq.value;
  sug.hidden = !!q.trim();
  renderResults(sres, runSearch(await loadIndex(), q), q, resHTML, true);
}
function openSearch(q = '') {
  setMenu(false);
  if (!ov) return;
  ov.hidden = false;
  body.classList.add('search-open');
  sq.value = q;
  updateOverlay();
  sq.focus();
}
function closeSearch() {
  if (!ov || ov.hidden) return;
  ov.hidden = true;
  body.classList.remove('search-open');
}
sq?.addEventListener('input', updateOverlay);
sq?.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') { const r = runSearch(await loadIndex(), sq.value)[0]; if (r) location.href = r.href; }
});
$$('[data-suggest-q]').forEach((b) => b.addEventListener('click', () => { sq.value = b.dataset.suggestQ; updateOverlay(); sq.focus(); }));
$$('[data-open-search]').forEach((b) => b.addEventListener('click', () => openSearch()));
$('[data-close-search]')?.addEventListener('click', closeSearch);
ov?.addEventListener('click', (e) => { if (e.target.closest('a')) closeSearch(); });

const dq = $('[data-drawer-q]');
const dres = $('[data-drawer-results]');
const dbody = $('[data-drawer-body]');
dq?.addEventListener('input', async () => {
  const q = dq.value;
  dbody.classList.toggle('searching', !!q.trim());
  renderResults(dres, runSearch(await loadIndex(), q), q, drawerRes, false);
});
dq?.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') { const r = runSearch(await loadIndex(), dq.value)[0]; if (r) location.href = r.href; }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeSearch(); setMenu(false); }
  const k = (e.key || '').toLowerCase();
  if ((k === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing(e.target) && !e.metaKey && !e.ctrlKey)) {
    e.preventDefault();
    openSearch();
  }
});

/* ---------- quote popup ---------- */
const dlg = $('[data-quote]');
function openQuote(msg) {
  if (!dlg || typeof dlg.showModal !== 'function') return false;
  setMenu(false);
  closeSearch();
  const root = $('[data-form-root]', dlg);
  if (root.dataset.done) resetForm(root);
  const ta = $('textarea[name=message]', dlg);
  if (ta && msg && !ta.value) ta.value = msg;
  if (!dlg.open) dlg.showModal();
  body.classList.add('dlg-open');
  return true;
}
const closeQuote = () => dlg?.open && dlg.close();
dlg?.addEventListener('close', () => body.classList.remove('dlg-open'));
dlg?.addEventListener('click', (e) => { if (e.target === dlg) closeQuote(); });
$$('[data-close-quote]').forEach((b) => b.addEventListener('click', closeQuote));
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-open-quote]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  if (openQuote(a.dataset.quoteMsg)) e.preventDefault(); // otherwise href="/contact" is the no-JS fallback
});

/* ---------- catalog popup ---------- */
const cat = $('[data-catalog]');
const catFrame = $('[data-catalog-frame]');
const canEmbedPdf = !!navigator.pdfViewerEnabled && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-open-catalog]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  if (!cat || typeof cat.showModal !== 'function' || !canEmbedPdf) return; // phones and PDF-less browsers: the link opens the PDF in a new tab
  e.preventDefault();
  setMenu(false);
  if (!catFrame.getAttribute('src')) catFrame.src = a.href + '#view=FitH';
  cat.showModal();
  body.classList.add('dlg-open');
});
cat?.addEventListener('close', () => body.classList.remove('dlg-open'));
cat?.addEventListener('click', (e) => { if (e.target === cat) cat.close(); });
$('[data-close-catalog]')?.addEventListener('click', () => cat.close());

/* ---------- forms ---------- */
const REQUIRED = { contact: ['fullname', 'email'], quote: ['fullname', 'email'], dealer: ['fullname', 'company', 'email', 'territory'] };
const MSG = { fullname: 'Please add your name.', company: 'Please add your company name.', territory: 'Tell us roughly where you would sell.', email: 'Please add your email address.' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resetForm(root) {
  const form = $('form', root);
  form.reset();
  delete root.dataset.done;
  $('[data-ok]', root).hidden = true;
  form.hidden = false;
  clearErrors(form);
  setBusy(form, false);
}
function clearErrors(form) {
  $('[data-err]', form).hidden = true;
  $$('.field .err', form).forEach((s) => { s.hidden = true; s.textContent = ''; });
  $$('[aria-invalid]', form).forEach((i) => i.removeAttribute('aria-invalid'));
}
function setBusy(form, busy, label) {
  const btn = $('[data-submit]', form);
  form.setAttribute('aria-busy', String(busy));
  btn.disabled = busy;
  btn.textContent = busy ? 'Sending…' : label || btn.dataset.label;
}
function setErr(input, text) {
  input.setAttribute('aria-invalid', 'true');
  const s = input.closest('.field').querySelector('.err');
  s.textContent = text;
  s.hidden = false;
}
$$('form[data-form]').forEach((form) => {
  const kind = form.dataset.form;
  const root = form.closest('[data-form-root]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);
    const f = form.elements;
    let first;
    for (const name of REQUIRED[kind]) {
      const v = f[name].value.trim();
      const bad = !v ? MSG[name] : name === 'email' && !EMAIL.test(v) ? 'That email address doesn’t look right.' : '';
      if (bad) { setErr(f[name], bad); first ||= f[name]; }
    }
    if (first) { first.focus(); return; }
    setBusy(form, true);
    const data = Object.fromEntries(new FormData(form));
    data.form = kind;
    data.page = location.pathname;
    try {
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(String(res.status));
      $('[data-email]', root).textContent = data.email.trim();
      form.hidden = true;
      $('[data-ok]', root).hidden = false;
      root.dataset.done = '1';
      setBusy(form, false);
      $('[data-ok]', root).querySelector('h2')?.setAttribute('tabindex', '-1');
      $('[data-ok] h2', root)?.focus();
    } catch {
      $('[data-err]', form).hidden = false;
      setBusy(form, false, 'Try again');
    }
  });
  $('[data-reset]', root)?.addEventListener('click', () => resetForm(root));
});

/* ---------- images ---------- */
$$('img[data-hide-on-error]').forEach((img) => {
  const hide = () => (img.style.visibility = 'hidden');
  img.addEventListener('error', hide);
  if (img.complete && img.naturalWidth === 0) hide();
});
$$('img[data-jug-fallback]').forEach((img) => {
  let swapped = false;
  const swap = () => {
    if (swapped) return; // the fallback photo failing must not loop
    swapped = true;
    img.parentElement?.querySelectorAll('source').forEach((x) => x.remove()); // else <picture> keeps serving the jug
    img.src = img.dataset.jugFallback;
    img.style.cssText = 'width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;max-height:none';
  };
  img.addEventListener('error', swap);
  if (img.complete && img.naturalWidth === 0) swap();
});

/* ---------- products list: filter, compare, scroll restore ---------- */
const CMP_KEY = 'cta-compare';
const getCmp = () => store.get(CMP_KEY, []).slice(0, 3);
const setCmp = (a) => store.set(CMP_KEY, a.slice(0, 3));

const plist = $('[data-products]');
if (plist) {
  const rows = $$('.prow', plist);
  const chips = $$('.chip', plist);
  const names = Object.fromEntries($$('[data-compare]', plist).map((b) => [b.dataset.compare, b.dataset.name]));
  const tray = $('[data-tray]');
  const applyFilter = (cat, push) => {
    if (!chips.some((c) => c.dataset.cat === cat)) cat = 'All';
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === cat)));
    rows.forEach((r) => (r.hidden = cat !== 'All' && r.dataset.cat !== cat));
    if (push) {
      const u = new URL(location.href);
      cat === 'All' ? u.searchParams.delete('cat') : u.searchParams.set('cat', cat);
      history.replaceState(null, '', u);
      store.set('cta-cat', cat);
    }
  };
  chips.forEach((c) => c.addEventListener('click', () => applyFilter(c.dataset.cat, true)));
  applyFilter(new URLSearchParams(location.search).get('cat') || 'All');

  const paintCmp = () => {
    const sel = getCmp();
    $$('[data-compare]', plist).forEach((b) => {
      const on = sel.includes(b.dataset.compare);
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? '✓ Comparing' : '+ Compare';
    });
    tray.hidden = !sel.length;
    $('[data-tray-names]').textContent = sel.map((s) => names[s]).join(' · ');
    const go = $('[data-tray-go]');
    go.href = '/compare?p=' + sel.join(',');
    go.textContent = sel.length === 1 ? 'Compare (add 1 more)' : 'Compare ' + sel.length;
  };
  plist.addEventListener('click', (e) => {
    const b = e.target.closest('[data-compare]');
    if (!b) return;
    let sel = getCmp();
    const s = b.dataset.compare;
    sel = sel.includes(s) ? sel.filter((x) => x !== s) : [...sel, s].slice(-3); // a fourth pick drops the oldest
    setCmp(sel);
    paintCmp();
  });
  $('[data-tray-clear]').addEventListener('click', () => { setCmp([]); paintCmp(); });
  paintCmp();

  // Returning from a product page: land on that product's row, no smooth scroll.
  const last = store.get('cta-last-product', null);
  const fromProduct = document.referrer && new URL(document.referrer, location.href).pathname.startsWith('/products/');
  if (last && fromProduct) {
    const row = rows.find((r) => r.dataset.slug === last && !r.hidden);
    if (row) {
      const hdr = $('.site-header').offsetHeight;
      html.style.scrollBehavior = 'auto';
      scrollTo(0, row.getBoundingClientRect().top + scrollY - hdr - 24);
      html.style.scrollBehavior = '';
    }
  }
  store.set('cta-last-product', null);
}
const detail = $('[data-product-page]');
if (detail) store.set('cta-last-product', detail.dataset.productPage);

/* ---------- compare page ---------- */
const cmpPage = $('[data-compare-page]');
if (cmpPage) {
  const DEFAULT = ['c-color-n', 'c-starter', 'c-strength-micros'];
  let data;
  let diff = false;
  const mount = $('[data-cmp-mount]');
  const addBox = $('[data-cmp-add]');
  const url = new URL(location.href);
  let slugs = [];
  const bySlug = (s) => data.products.find((p) => p.slug === s);
  const sync = () => {
    url.searchParams.set('p', slugs.join(','));
    history.replaceState(null, '', url);
    setCmp(slugs);
    render();
  };
  const rank = (k) => {
    const l = k.toLowerCase();
    let best = -1;
    data.order.forEach((o, i) => { if (l.includes(o) && (best < 0 || o.length > data.order[best].length)) best = i; });
    return best < 0 ? data.order.length : best;
  };
  const num = (v) => parseFloat(String(v).replace(/[^0-9.]/g, ''));
  const jug = (p) => {
    const f = p.slug === 'efficiensi' ? 'efficiensi-v2' : p.slug;
    const set = (e) => `/assets/opt/jugs/${f}-480.${e} 480w, /assets/opt/jugs/${f}-800.${e} 800w`;
    return `<picture><source type="image/avif" srcset="${set('avif')}" sizes="260px"><source type="image/webp" srcset="${set('webp')}" sizes="260px"><img src="/assets/jugs/${f}.png" alt="${esc(p.name)}" loading="lazy" onerror="this.style.visibility='hidden'"></picture>`;
  };
  function render() {
    const ps = slugs.map(bySlug);
    const span = ps.length + 1;
    $('[data-forms-note]').hidden = new Set(ps.map((p) => p.form)).size < 2;
    const keys = [];
    ps.forEach((p) => p.agents.forEach((a) => !keys.includes(a.k) && keys.push(a.k)));
    keys.sort((a, b) => rank(a) - rank(b));
    const val = (p, k) => p.agents.find((a) => a.k === k)?.v;
    const rows = keys.map((k) => {
      const vals = ps.map((p) => val(p, k));
      const same = vals.every((v) => v === vals[0]);
      const nums = vals.map((v) => (v ? num(v) : -Infinity));
      const max = Math.max(...nums);
      return { k, vals, same, max, nums };
    }).filter((r) => !(diff && ps.length > 1 && r.same));
    const th = ps.map((p) => `
      <th><div class="colhead">
        <div class="im">${jug(p)}</div>
        <span class="k-s${p.cho ? ' m' : ''}">${esc(p.kicker)}</span>
        <a class="nm" href="${p.href}">${esc(p.name)} ${p.grade ? `<span>${esc(p.grade)}</span>` : ''}</a>
        <span style="font-size:20px;font-style:italic">${esc(p.head)}</span>
        <div style="display:flex;gap:8px;align-items:center">
          <select class="input" aria-label="Swap product" data-swap="${p.slug}">${data.products.map((o) => `<option value="${o.slug}"${o.slug === p.slug ? ' selected' : ''}>${esc(o.name)}</option>`).join('')}</select>
          ${ps.length > 1 ? `<button type="button" class="btn btn-ghost" style="min-height:40px;font-size:15px" data-remove="${p.slug}" aria-label="Remove ${esc(p.name)}">Remove</button>` : ''}
        </div>
      </div></th>`).join('');
    const sec = (t) => `<tr><td colspan="${span}" class="sh">${t}</td></tr>`;
    const labelCell = (p) => p.label
      ? `<span style="display:inline-flex;gap:6px"><a href="${p.label.front}" target="_blank" rel="noopener">${p.label.frontLabel}</a>${p.label.back ? `<span>·</span><a href="${p.label.back}" target="_blank" rel="noopener">Back</a>` : ''}<span>(PDF)</span></span>`
      : '<span style="color:var(--color-neutral-700)">On request</span>';
    mount.innerHTML = `
      <table class="cmp" style="min-width:${200 + ps.length * 260}px">
        <colgroup><col style="width:200px">${ps.map(() => '<col>').join('')}</colgroup>
        <thead><tr><th class="lc" style="padding:0 16px 20px 0;vertical-align:bottom;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700)">${ps.length} of 3 products</th>${th}</tr></thead>
        <tbody>
          <tr class="n"><td class="lc" style="padding:14px 16px 14px 0;color:var(--color-neutral-800)">Form</td>${ps.map((p) => `<td style="padding:14px 20px 14px 0;font-weight:600">${esc(p.form)}</td>`).join('')}</tr>
          ${sec('Key benefits')}
          <tr><td class="lc"></td>${ps.map((p) => `<td><div class="stack" style="gap:8px">${p.bens.map((b) => `<p style="font-size:16px;display:flex;gap:10px"><span class="dash">—</span><span>${esc(b)}</span></p>`).join('')}</div></td>`).join('')}</tr>
          ${sec('Guaranteed analysis')}
          ${rows.map((r) => `<tr class="n"><td class="lc" style="padding:10px 16px 10px 0;color:var(--color-neutral-800)">${esc(r.k)}</td>${r.vals.map((v, i) => v ? `<td class="v${!r.same && r.nums[i] === r.max ? ' hi' : ''}">${esc(v)}</td>` : '<td class="v na">—</td>').join('')}</tr>`).join('')}
          ${sec('Application and rates')}
          <tr><td class="lc"></td>${ps.map((p) => `<td><div class="stack" style="gap:12px">${p.rates.map((r) => `<div class="stack" style="gap:2px"><span style="font-size:17px;font-weight:600">${esc(r.k)}</span><span style="font-size:16px" class="muted">${esc(r.v)}</span></div>`).join('')}</div></td>`).join('')}</tr>
          ${sec('Cautions')}
          <tr><td class="lc"></td>${ps.map((p) => `<td class="caution">${p.caution ? esc(p.caution) : '—'}</td>`).join('')}</tr>
          ${sec('Label')}
          <tr><td class="lc"></td>${ps.map((p) => `<td style="font-size:16px">${labelCell(p)}</td>`).join('')}</tr>
          <tr><td class="lc"></td>${ps.map((p) => `<td style="padding-top:28px"><a href="/contact" class="btn btn-primary" style="min-height:44px;white-space:nowrap" data-open-quote data-quote-msg="I’m interested in ${esc(p.name)}. ">Request a Quote</a></td>`).join('')}</tr>
        </tbody>
      </table>`;
    const sel = $('select', addBox);
    addBox.hidden = ps.length >= 3;
    sel.innerHTML = '<option value="">Choose…</option>' + data.products.filter((p) => !slugs.includes(p.slug)).map((p) => `<option value="${p.slug}">${esc(p.name)}</option>`).join('');
  }
  mount.addEventListener('change', (e) => {
    const s = e.target.dataset?.swap;
    if (!s) return;
    const to = e.target.value;
    slugs = slugs.includes(to) ? slugs : slugs.map((x) => (x === s ? to : x));
    sync();
  });
  mount.addEventListener('click', (e) => {
    const r = e.target.closest('[data-remove]');
    if (r) { slugs = slugs.filter((x) => x !== r.dataset.remove); sync(); }
  });
  $('select', addBox).addEventListener('change', (e) => {
    if (e.target.value && slugs.length < 3) { slugs = [...slugs, e.target.value]; sync(); }
  });
  const dbtn = $('[data-diff]', cmpPage);
  dbtn.addEventListener('click', () => {
    diff = !diff;
    dbtn.setAttribute('aria-pressed', String(diff));
    dbtn.textContent = diff ? '✓ Showing differences only' : 'Show differences only';
    render();
  });
  fetch('/products.json').then((r) => r.json()).then((d) => {
    data = d;
    const asked = (url.searchParams.get('p') || '').split(',').filter((s) => bySlug(s));
    slugs = [...new Set(asked)].slice(0, 3);
    if (!slugs.length) slugs = getCmp().filter(bySlug);
    if (!slugs.length) slugs = DEFAULT;
    sync();
  }).catch(() => { mount.innerHTML = '<p>The comparison could not load. Please try again, or browse <a href="/products">All products</a>.</p>'; });
}

/* ---------- motion ---------- */
function countUp(el) {
  const text = el.textContent;
  const m = text.match(/\d+(?:\.\d+)?/);
  if (!m || reduce) return;
  const target = parseFloat(m[0]);
  const dec = (m[0].split('.')[1] || '').length;
  const pad = m[0].split('.')[0].length;
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 1100);
    const v = target * (1 - Math.pow(1 - k, 3));
    el.textContent = text.replace(m[0], v.toFixed(dec).padStart(pad + (dec ? dec + 1 : 0), '0'));
    if (k < 1) requestAnimationFrame(step); else el.textContent = text;
  };
  requestAnimationFrame(step);
}
function setupFx() {
  const targets = $$('.fx, .dots, [data-fx-lines], [data-count]');
  if (reduce || !('IntersectionObserver' in window)) { targets.forEach((t) => t.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const go = () => {
        en.target.classList.add('in');
        if (en.target.hasAttribute('data-count')) countUp(en.target);
      };
      const img = en.target.matches('img') ? en.target : en.target.querySelector('img');
      if (img && !img.complete) img.addEventListener('load', go, { once: true }); else go();
      if (img && !img.complete) img.addEventListener('error', go, { once: true });
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach((t) => io.observe(t));
}
setupFx();
