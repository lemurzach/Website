/* =============================================
   HLBLY Theme — theme.js
   ============================================= */

'use strict';

/* ─── Cart Drawer ─────────────────────────────── */

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  refreshCartDrawer();
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function refreshCartDrawer() {
  fetch(window.routes.cart_url + '?view=drawer')
    .then(r => r.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const content = doc.querySelector('#cart-drawer-inner');
      if (content) {
        document.getElementById('cart-drawer-content').innerHTML = content.innerHTML;
      }
    })
    .catch(() => {});
}

function updateCartCount(count) {
  const badges = document.querySelectorAll('.cart-count');
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

async function addToCart(variantId, quantity = 1, properties = {}) {
  const btn = document.querySelector('[data-add-to-cart]');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span>';
  }

  try {
    const resp = await fetch(window.routes.cart_add_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity, properties })
    });

    const data = await resp.json();

    if (!resp.ok) {
      showToast(data.description || 'Could not add to cart', 'error');
      return;
    }

    const cartResp = await fetch(window.routes.cart_url, {
      headers: { 'Accept': 'application/json' }
    });
    const cart = await cartResp.json();
    updateCartCount(cart.item_count);
    openCartDrawer();
    showToast('Added to cart!', 'success');
  } catch {
    showToast('Something went wrong. Please try again.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalText || 'Add to Cart';
    }
  }
}

async function removeFromCart(key) {
  await fetch(window.routes.cart_change_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: key, quantity: 0 })
  });
  const cartResp = await fetch(window.routes.cart_url, { headers: { Accept: 'application/json' } });
  const cart = await cartResp.json();
  updateCartCount(cart.item_count);
  refreshCartDrawer();
}

async function updateCartQuantity(key, quantity) {
  await fetch(window.routes.cart_change_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: key, quantity })
  });
  const cartResp = await fetch(window.routes.cart_url, { headers: { Accept: 'application/json' } });
  const cart = await cartResp.json();
  updateCartCount(cart.item_count);
  refreshCartDrawer();
}

/* ─── Search Modal ───────────────────────────── */

function openSearchModal() {
  const modal = document.getElementById('search-modal');
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modal.querySelector('.search-modal__input')?.focus(), 50);
}

function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ─── Mobile Nav ─────────────────────────────── */

function openMobileNav() {
  const nav = document.getElementById('mobile-nav');
  if (!nav) return;
  nav.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  const nav = document.getElementById('mobile-nav');
  if (!nav) return;
  nav.classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ─── Toast ──────────────────────────────────── */

function showToast(message, type = 'success') {
  let toast = document.getElementById('hlbly-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'hlbly-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast toast--${type}`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('is-visible'));
  });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}

/* ─── Product Gallery ────────────────────────── */

function initProductGallery() {
  const main = document.querySelector('.product-gallery__main');
  const thumbs = document.querySelectorAll('.product-gallery__thumb');
  if (!main || !thumbs.length) return;

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      const img = thumb.querySelector('img');
      if (!img) return;
      const mainImg = main.querySelector('img');
      if (mainImg) {
        mainImg.src = img.src.replace('_100x100', '_800x800');
        mainImg.srcset = '';
      }
    });
  });

  if (thumbs[0]) thumbs[0].classList.add('is-active');
}

/* ─── Variant Selector ───────────────────────── */

function initVariantSelector() {
  const form = document.querySelector('[data-product-form]');
  if (!form) return;

  const variantInput = form.querySelector('[name="id"]');
  const priceEl = form.querySelector('[data-product-price]');
  const comparePriceEl = form.querySelector('[data-compare-price]');
  const addBtn = form.querySelector('[data-add-to-cart]');
  const stockEl = form.querySelector('[data-stock-status]');

  const optionEls = form.querySelectorAll('[data-option]');

  const productData = window.productVariants || [];

  function getSelectedOptions() {
    const opts = [];
    optionEls.forEach(el => {
      if (el.tagName === 'SELECT') {
        opts.push(el.value);
      } else if (el.type === 'radio' && el.checked) {
        opts.push(el.value);
      }
    });
    return opts;
  }

  function findVariant(options) {
    return productData.find(v =>
      v.options.every((o, i) => o === options[i])
    );
  }

  function updateVariant() {
    const options = getSelectedOptions();
    const variant = findVariant(options);

    if (!variant) return;

    variantInput.value = variant.id;

    if (priceEl) priceEl.textContent = formatMoney(variant.price);
    if (comparePriceEl) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        comparePriceEl.textContent = formatMoney(variant.compare_at_price);
        comparePriceEl.style.display = '';
      } else {
        comparePriceEl.style.display = 'none';
      }
    }

    if (addBtn) {
      if (variant.available) {
        addBtn.disabled = false;
        addBtn.textContent = 'Add to Cart';
        addBtn.dataset.originalText = 'Add to Cart';
      } else {
        addBtn.disabled = true;
        addBtn.textContent = 'Sold Out';
      }
    }

    if (stockEl) {
      stockEl.textContent = variant.available ? 'In Stock' : 'Out of Stock';
      stockEl.className = 'stock-status ' + (variant.available ? 'in-stock' : 'out-of-stock');
    }

    history.replaceState({}, '', `?variant=${variant.id}`);
  }

  optionEls.forEach(el => el.addEventListener('change', updateVariant));
}

function formatMoney(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: window.Shopify?.currency?.active || 'USD' }).format(cents / 100);
}

/* ─── Quantity Inputs ────────────────────────── */

function initQuantityInputs() {
  document.querySelectorAll('.quantity-selector').forEach(selector => {
    const input = selector.querySelector('.quantity-input');
    const minus = selector.querySelector('[data-qty-minus]');
    const plus = selector.querySelector('[data-qty-plus]');

    minus?.addEventListener('click', () => {
      const val = parseInt(input.value);
      if (val > 1) input.value = val - 1;
      input.dispatchEvent(new Event('change'));
    });

    plus?.addEventListener('click', () => {
      const val = parseInt(input.value);
      input.value = val + 1;
      input.dispatchEvent(new Event('change'));
    });
  });
}

/* ─── Sticky Header ──────────────────────────── */

function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const observer = new IntersectionObserver(
    ([e]) => header.classList.toggle('scrolled', !e.isIntersecting),
    { rootMargin: `-${header.offsetHeight}px 0px 0px 0px`, threshold: 0 }
  );
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  document.body.insertBefore(sentinel, document.body.firstChild);
  observer.observe(sentinel);
}

/* ─── Announcement Ticker ────────────────────── */

function initAnnouncementTicker() {
  const ticker = document.querySelector('.announcement-ticker');
  if (!ticker) return;
  const items = ticker.querySelectorAll('.announcement-ticker__item');
  if (items.length <= 1) return;
  let current = 0;
  setInterval(() => {
    items[current].classList.remove('is-active');
    current = (current + 1) % items.length;
    items[current].classList.add('is-active');
  }, 4000);
  items[0].classList.add('is-active');
}

/* ─── Scroll Reveal ──────────────────────────── */

function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* ─── Product Add to Cart Handler ────────────── */

function initAddToCart() {
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-product-form]');
    if (!form) return;
    e.preventDefault();

    const variantId = form.querySelector('[name="id"]')?.value;
    const qty = parseInt(form.querySelector('[name="quantity"]')?.value || 1);
    if (!variantId) return;

    await addToCart(variantId, qty);
  });
}

/* ─── Newsletter Form ────────────────────────── */

function initNewsletterForms() {
  document.querySelectorAll('[data-newsletter-form]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('[name="contact[email]"]')?.value;
      if (!email) return;

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      try {
        const resp = await fetch('/contact#contact_form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString()
        });

        const success = form.querySelector('.newsletter__success');
        if (success) { success.style.display = 'block'; }
        form.reset();
        showToast("You're subscribed!", 'success');
      } catch {
        showToast('Something went wrong.', 'error');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  });
}

/* ─── Keyboard Handling ──────────────────────── */

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCartDrawer();
    closeSearchModal();
    closeMobileNav();
  }
});

/* ─── Init ───────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initProductGallery();
  initVariantSelector();
  initQuantityInputs();
  initAddToCart();
  initNewsletterForms();
  initScrollReveal();
  initAnnouncementTicker();

  // Fetch and display cart count
  fetch(window.routes.cart_url, { headers: { Accept: 'application/json' } })
    .then(r => r.json())
    .then(cart => updateCartCount(cart.item_count))
    .catch(() => {});
});
