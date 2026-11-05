// ===== Mobile Menu =====
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Buka menu');
  }));
}

// Year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// ===== WhatsApp Number =====
const WA_NUMBER = '6285215834532'; // 0852-1583-4532

// ===== Cart System =====
const CART_KEY = 'boutiquini_cart';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart');
const toastEl = document.getElementById('toast');

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function formatPrice(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price: Number(price), qty: 1 });
  }
  saveCart();
  showToast(name + ' ditambahkan ke keranjang');
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
}

function renderCart() {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  if (cartCountEl) {
    cartCountEl.textContent = totalQty;
    cartCountEl.style.display = totalQty > 0 ? 'flex' : 'none';
  }

  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Keranjang masih kosong.</p>';
    if (cartTotalEl) cartTotalEl.textContent = 'Rp 0';
    return;
  }

  let total = 0;
  cartItemsEl.innerHTML = cart.map(item => {
    total += item.price * item.qty;
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span>${formatPrice(item.price)}</span>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
          <button class="remove-btn" data-id="${item.id}" aria-label="Hapus">×</button>
        </div>
      </div>
    `;
  }).join('');

  if (cartTotalEl) cartTotalEl.textContent = formatPrice(total);

  cartItemsEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, Number(btn.dataset.delta)));
  });
  cartItemsEl.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  cartSidebar.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  cartSidebar.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (cartBtn) cartBtn.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    cart = [];
    saveCart();
    showToast('Keranjang dikosongkan');
  });
}

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Keranjang masih kosong');
      return;
    }
    let message = 'Halo Boutiquini Muslimah 🌸%0A%0ASaya ingin memesan:%0A';
    let total = 0;
    cart.forEach((item, i) => {
      message += `${i + 1}. ${item.name} × ${item.qty} — ${formatPrice(item.price * item.qty)}%0A`;
      total += item.price * item.qty;
    });
    message += `%0A*Total: ${formatPrice(total)}*%0A%0AMohon info ketersediaan & cara pembayaran ya. Terima kasih!`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
  });
}

// Product buttons
document.querySelectorAll('.product-card').forEach(card => {
  const id = card.dataset.id;
  const name = card.dataset.name;
  const price = card.dataset.price;

  card.querySelector('[data-action="add"]')?.addEventListener('click', () => {
    addToCart(id, name, price);
  });

  card.querySelector('[data-action="buy"]')?.addEventListener('click', () => {
    const message = `Halo Boutiquini Muslimah 🌸%0A%0ASaya ingin membeli *${name}* seharga ${formatPrice(Number(price))}.%0A%0AMohon info ketersediaan, ukuran, dan cara pembayaran ya. Terima kasih!`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
  });
});

// Init
renderCart();
