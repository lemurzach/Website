'use strict';

/* ─────────────────────────────────────────────
   HLBLY Theme JS v2 — Zing-inspired
   ───────────────────────────────────────────── */

/* ─── Helpers ────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el?.addEventListener(ev, fn, opts);
const off = (el, ev, fn) => el?.removeEventListener(ev, fn);

function formatMoney(cents) {
  const currency = window.Shopify?.currency?.active || 'USD';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

/* ─── Toast ──────────────────────────────────── */
let toastTimer;
function toast(msg, type = 'ok') {
  let el = $('#hlbly-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'hlbly-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  clearTimeout(toastTimer);
  el.textContent = msg;
  el.className = `toast toast--${type}`;
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-on')));
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 3200);
}

/* ─── Cart State ─────────────────────────────── */
let cartCache = null;

async function getCart() {
  const r = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
  cartCache = await r.json();
  return cartCache;
}

function updateCartBubbles(count) {
  $$('.cart-bubble').forEach(b => {
    b.textContent = count > 0 ? count : '';
    b.setAttribute('data-count', count);
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

/* ─── Add to Cart ────────────────────────────── */
async function addToCart(variantId, qty = 1, props = {}) {
  const btn = $('[data-atc]') || $('[data-add-to-cart]');
  if (btn) {
    btn.dataset.originalText = btn.dataset.originalText || btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spin"></span>';
  }
  try {
    const r = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: qty, properties: props })
    });
    const data = await r.json();
    if (!r.ok) { toast(data.description || 'Could not add item', 'err'); return; }
    const cart = await getCart();
    updateCartBubbles(cart.item_count);
    openCartDrawer();
    toast('Added to cart!', 'ok');
  } catch {
    toast('Something went wrong.', 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.originalText || 'Add to Cart'; }
  }
}

async function removeCartItem(key) {
  await fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: key, quantity: 0 })
  });
  const cart = await getCart();
  updateCartBubbles(cart.item_count);
  renderCartDrawer(cart);
}

async function changeCartQty(key, qty) {
  await fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: key, quantity: qty })
  });
  const cart = await getCart();
  updateCartBubbles(cart.item_count);
  renderCartDrawer(cart);
}

/* ─── Cart Drawer ────────────────────────────── */
function renderCartDrawer(cart) {
  const content = $('#cart-drawer-content');
  if (!content) return;

  if (cart.item_count === 0) {
    content.innerHTML = `
      <div class="cart-drawer__empty">
        <div class="cart-drawer__empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add something delicious to get started.</p>
        <button class="btn btn--primary" onclick="closeCartDrawer()">Continue Shopping</button>
      </div>`;
    const foot = $('#cart-drawer-foot');
    if (foot) foot.style.display = 'none';
    return;
  }

  const foot = $('#cart-drawer-foot');
  if (foot) foot.style.display = '';

  // Free shipping bar
  const threshold = window.freeShipThreshold || 5000; // cents
  const pct = Math.min((cart.total_price / threshold) * 100, 100).toFixed(0);
  const remaining = Math.max(0, threshold - cart.total_price);
  const freeShipBar = $('#free-ship-bar');
  if (freeShipBar) {
    freeShipBar.style.display = '';
    const fill = freeShipBar.querySelector('.free-ship-bar__fill');
    if (fill) fill.style.width = pct + '%';
    const txt = freeShipBar.querySelector('.free-ship-bar__text');
    if (txt) {
      txt.innerHTML = remaining > 0
        ? `<em>${formatMoney(remaining)}</em> away from free shipping`
        : `🎉 You've unlocked <em>free shipping!</em>`;
    }
  }

  content.innerHTML = cart.items.map(item => `
    <div class="cart-item">
      <div class="ci__img">
        ${item.image ? `<img src="${item.image.replace('.jpg', '_150x150.jpg')}" alt="${item.title}" loading="lazy" width="80" height="80">` : ''}
      </div>
      <div>
        <p class="ci__title">${item.product_title}</p>
        ${item.variant_title !== 'Default Title' ? `<p class="ci__var">${item.variant_title}</p>` : ''}
        <div class="ci__bottom">
          <div style="display:flex;align-items:center;gap:.75rem">
            <div class="qty-wrap" style="height:36px">
              <button class="qty-btn" style="width:36px" onclick="changeCartQty('${item.key}', ${item.quantity - 1})" aria-label="Decrease">−</button>
              <span style="width:36px;text-align:center;font-weight:700;font-size:.875rem">${item.quantity}</span>
              <button class="qty-btn" style="width:36px" onclick="changeCartQty('${item.key}', ${item.quantity + 1})" aria-label="Increase">+</button>
            </div>
            <span class="ci__price">${formatMoney(item.line_price)}</span>
          </div>
          <button class="ci__remove" onclick="removeCartItem('${item.key}')">Remove</button>
        </div>
      </div>
    </div>`).join('');

  const subtotalEl = $('#cart-subtotal-val');
  if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
}

function openCartDrawer() {
  const d = $('#cart-drawer');
  if (!d) return;
  d.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  getCart().then(cart => {
    updateCartBubbles(cart.item_count);
    renderCartDrawer(cart);
  });
}

function closeCartDrawer() {
  const d = $('#cart-drawer');
  if (!d) return;
  d.classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ─── Search Modal + Predictive ──────────────── */
let searchTimer;

function openSearchModal() {
  const m = $('#search-modal');
  if (!m) return;
  m.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => m.querySelector('.search-input')?.focus(), 60);
}

function closeSearchModal() {
  const m = $('#search-modal');
  if (!m) return;
  m.classList.remove('is-open');
  document.body.style.overflow = '';
}

function initPredictiveSearch() {
  const input = $('.search-input');
  const results = $('#search-results');
  if (!input || !results) return;

  on(input, 'input', () => {
    clearTimeout(searchTimer);
    const q = input.value.trim();
    if (q.length < 2) { results.classList.remove('has-results'); return; }
    searchTimer = setTimeout(() => fetchSearchResults(q, results), 300);
  });
}

async function fetchSearchResults(q, container) {
  try {
    const url = `${window.routes?.predictive_search_url || '/search/suggest'}?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=5&section_id=predictive-search`;
    const r = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    if (!r.ok) return;
    const text = await r.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const inner = doc.querySelector('#shopify-section-predictive-search');
    if (inner) {
      container.innerHTML = inner.innerHTML;
      container.classList.add('has-results');
    } else {
      container.classList.remove('has-results');
    }
  } catch { /* noop */ }
}

/* ─── Mobile Nav ─────────────────────────────── */
function openMobileNav() {
  const nav = $('#mobile-nav');
  if (!nav) return;
  nav.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  const nav = $('#mobile-nav');
  if (!nav) return;
  nav.classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ─── Keyboard ───────────────────────────────── */
on(document, 'keydown', e => {
  if (e.key === 'Escape') {
    closeCartDrawer();
    closeSearchModal();
    closeMobileNav();
  }
});

/* ─── Sticky Header ──────────────────────────── */
function initHeader() {
  const header = $('.site-header');
  if (!header) return;

  let lastScroll = 0;
  const onScroll = () => {
    const y = window.scrollY;
    if (y > 60) {
      header.classList.add('is-scrolled');
      header.classList.remove('is-transparent');
    } else {
      header.classList.remove('is-scrolled');
      if (header.dataset.transparentOnTop === 'true') {
        header.classList.add('is-transparent');
      }
    }
    lastScroll = y;
  };

  on(window, 'scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── Product Gallery ────────────────────────── */
function initGallery() {
  const main = $('.pg-main');
  const thumbs = $$('.pg-thumb');
  if (!main || !thumbs.length) return;

  thumbs.forEach((thumb, i) => {
    on(thumb, 'click', () => {
      $$('.pg-thumb').forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      const img = thumb.querySelector('img');
      if (!img) return;
      const mainImg = main.querySelector('img');
      if (mainImg) {
        const newSrc = img.src.replace(/_(\d+)x(\d+)_crop_center/, '').replace(/_150x150/, '_900x900');
        mainImg.src = newSrc;
        mainImg.srcset = '';
      }
    });
  });

  if (thumbs[0]) thumbs[0].classList.add('is-active');
}

/* ─── Variant Selector ───────────────────────── */
function initVariants() {
  const form = $('[data-product-form]');
  if (!form) return;

  const variantInput = form.querySelector('[name="id"]');
  const priceEl      = form.querySelector('[data-price]');
  const comparePriceEl = form.querySelector('[data-compare-price]');
  const atcBtn       = form.querySelector('[data-atc]') || form.querySelector('[data-add-to-cart]');
  const stickyBtn    = $('#sticky-atc-btn');
  const stickyPrice  = $('#sticky-atc-price');
  const stickyTitle  = $('#sticky-atc-title');

  const variants = window.productVariants || [];
  const optionEls = form.querySelectorAll('[data-option]');

  function selectedOptions() {
    const opts = [];
    optionEls.forEach(el => {
      if ((el.type === 'radio' || el.type === 'checkbox') && el.checked) opts.push(el.value);
      else if (el.tagName === 'SELECT') opts.push(el.value);
    });
    return opts;
  }

  function findVariant(opts) {
    return variants.find(v => v.options.every((o, i) => o === opts[i]));
  }

  function updateUI() {
    const v = findVariant(selectedOptions());
    if (!v) return;

    variantInput.value = v.id;
    if (priceEl) priceEl.textContent = formatMoney(v.price);
    if (comparePriceEl) {
      if (v.compare_at_price > v.price) {
        comparePriceEl.textContent = formatMoney(v.compare_at_price);
        comparePriceEl.style.display = '';
      } else {
        comparePriceEl.style.display = 'none';
      }
    }
    const available = v.available;
    [atcBtn, stickyBtn].forEach(btn => {
      if (!btn) return;
      btn.disabled = !available;
      btn.textContent = available ? (btn.dataset.atcText || 'Add to Cart') : 'Sold Out';
    });
    if (stickyPrice) stickyPrice.textContent = formatMoney(v.price);
    history.replaceState({}, '', `?variant=${v.id}`);
  }

  optionEls.forEach(el => on(el, 'change', updateUI));
  updateUI();
}

/* ─── Quantity Buttons ───────────────────────── */
function initQty() {
  on(document, 'click', e => {
    if (e.target.matches('[data-qty-minus]')) {
      const wrap = e.target.closest('.qty-wrap');
      const input = wrap?.querySelector('.qty-input');
      if (input) { const v = Math.max(1, parseInt(input.value) - 1); input.value = v; input.dispatchEvent(new Event('change')); }
    }
    if (e.target.matches('[data-qty-plus]')) {
      const wrap = e.target.closest('.qty-wrap');
      const input = wrap?.querySelector('.qty-input');
      if (input) { input.value = parseInt(input.value) + 1; input.dispatchEvent(new Event('change')); }
    }
  });
}

/* ─── Product Tabs ───────────────────────────── */
function initTabs() {
  on(document, 'click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const tabs = btn.closest('.pi__tabs');
    if (!tabs) return;
    tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('is-on'));
    tabs.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('is-on'));
    btn.classList.add('is-on');
    const target = tabs.querySelector(`[data-tab="${btn.dataset.tabTarget}"]`);
    if (target) target.classList.add('is-on');
  });
}

/* ─── Sticky ATC ─────────────────────────────── */
function initStickyAtc() {
  const atcRow = $('.pi__add-row');
  const stickyBar = $('.sticky-atc');
  if (!atcRow || !stickyBar) return;

  const io = new IntersectionObserver(([e]) => {
    stickyBar.classList.toggle('is-visible', !e.isIntersecting);
  }, { threshold: 0 });
  io.observe(atcRow);
}

/* ─── Product Form Submit ────────────────────── */
function initProductForm() {
  on(document, 'submit', async e => {
    const form = e.target.closest('[data-product-form]');
    if (!form) return;
    e.preventDefault();
    const variantId = form.querySelector('[name="id"]')?.value;
    const qty = parseInt(form.querySelector('[name="quantity"]')?.value || 1);
    if (!variantId) return;
    await addToCart(variantId, qty);
  });

  on(document, 'click', async e => {
    const btn = e.target.closest('[data-sticky-atc]');
    if (!btn) return;
    const variantId = $('[data-product-form]')?.querySelector('[name="id"]')?.value;
    const qty = parseInt($('.qty-input')?.value || 1);
    if (!variantId) return;
    await addToCart(variantId, qty);
  });
}

/* ─── Newsletter ─────────────────────────────── */
function initNewsletters() {
  $$('[data-newsletter]').forEach(form => {
    on(form, 'submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        await fetch('/contact#contact_form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString()
        });
        const success = form.querySelector('[data-nl-success]');
        if (success) { success.style.display = 'block'; }
        form.reset();
        toast("You're in! 🎉", 'ok');
      } catch {
        toast('Something went wrong.', 'err');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  });
}

/* ─── Animated Counters ──────────────────────── */
function initCounters() {
  const counters = $$('[data-counter]');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 1800;
      const start = performance.now();
      const isFloat = String(target).includes('.');

      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = target * ease;
        el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString()) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });

  counters.forEach(c => io.observe(c));
}

/* ─── Countdown Timer ────────────────────────── */
function initCountdowns() {
  $$('[data-countdown]').forEach(el => {
    const end = new Date(el.dataset.countdown).getTime();
    if (isNaN(end)) return;

    function tick() {
      const diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1e3);

      const set = (sel, v) => { const e = el.querySelector(sel); if (e) e.textContent = String(v).padStart(2, '0'); };
      set('[data-cd-d]', d);
      set('[data-cd-h]', h);
      set('[data-cd-m]', m);
      set('[data-cd-s]', s);

      if (diff > 0) requestAnimationFrame(() => setTimeout(tick, 1000));
    }
    tick();
  });
}

/* ─── Scroll Reveal ──────────────────────────── */
function initReveal() {
  const style = document.createElement('style');
  style.textContent = `
    [data-reveal]{opacity:0;transform:translateY(24px);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
    [data-reveal].revealed{opacity:1;transform:none}
    [data-reveal-delay="1"]{transition-delay:.1s}
    [data-reveal-delay="2"]{transition-delay:.2s}
    [data-reveal-delay="3"]{transition-delay:.3s}
    [data-reveal-delay="4"]{transition-delay:.4s}
  `;
  document.head.appendChild(style);

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  $$('[data-reveal]').forEach(el => io.observe(el));
}

/* ─── Marquee duplicate ──────────────────────── */
function initMarquees() {
  $$('.marquee-track').forEach(track => {
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.parentElement.appendChild(clone);
  });
  $$('.ann-marquee__track').forEach(track => {
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.parentElement.appendChild(clone);
  });
}

/* ─── Swatch hover on product card ──────────── */
function initCardSwatches() {
  on(document, 'click', e => {
    const swatch = e.target.closest('.pc__swatch');
    if (!swatch) return;
    const card = swatch.closest('.pc');
    if (!card) return;
    card.querySelectorAll('.pc__swatch').forEach(s => s.classList.remove('is-active'));
    swatch.classList.add('is-active');
    const color = swatch.dataset.color;
    if (color) {
      const img = card.querySelector('.pc__img');
      if (img && swatch.dataset.image) img.src = swatch.dataset.image;
    }
  });
}

/* ─── Init ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initGallery();
  initVariants();
  initQty();
  initTabs();
  initStickyAtc();
  initProductForm();
  initNewsletters();
  initCounters();
  initCountdowns();
  initReveal();
  initMarquees();
  initCardSwatches();
  initPredictiveSearch();

  getCart().then(cart => updateCartBubbles(cart.item_count)).catch(() => {});

  const atcBtns = $$('[data-atc]');
  atcBtns.forEach(btn => { btn.dataset.atcText = btn.textContent.trim(); });
});
