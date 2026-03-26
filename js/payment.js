// La URL del backend y la llave pública de Stripe vienen de js/config.js

// ─── Catálogo de productos ──────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Limpieza de Closet", price: 100, img: "https://picsum.photos/300/200?1" },
  { id: 2, name: "Colorimetría Personal", price: 100, img: "https://picsum.photos/300/200?2" },
  { id: 3, name: "Asesoría de Imagen", price: 100, img: "https://picsum.photos/300/200?3" },
  { id: 4, name: "Personal Shopper", price: 100, img: "https://picsum.photos/300/200?4" },
  { id: 5, name: "Styling de Outfit", price: 100, img: "https://picsum.photos/300/200?5" },
  { id: 6, name: "Armado de Cápsula", price: 100, img: "https://picsum.photos/300/200?6" },
  { id: 7, name: "Consulta Express", price: 100, img: "https://picsum.photos/300/200?7" },
];

// ─── Estado del carrito ─────────────────────────────────────────
let cart = [];

// ─── Stripe globals ─────────────────────────────────────────────
let stripeInstance = null;
let stripeElements = null;

// ══════════════════════════════════════════════════════════════════
//  CARRITO — Lógica
// ══════════════════════════════════════════════════════════════════

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartBadge();
  renderCartItems();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartBadge();
  renderCartItems();
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? "flex" : "none";
  }
}

function renderCartItems() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const emptyMsg = document.getElementById("cart-empty");
  const checkoutBtn = document.getElementById("cart-checkout-btn");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "";
    emptyMsg.style.display = "block";
    totalEl.textContent = "$0.00 MXN";
    checkoutBtn.disabled = true;
    return;
  }

  emptyMsg.style.display = "none";
  checkoutBtn.disabled = false;

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" class="cart-item__img" />
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__price">$${(item.price / 100).toFixed(2)} MXN × ${item.qty}</p>
      </div>
      <button class="cart-item__remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>
  `).join("");

  const total = getCartTotal();
  totalEl.textContent = `$${(total / 100).toFixed(2)} MXN`;
}

// ──────────────────────────────────────────────────────
//  PANEL DEL CARRITO — Abrir / Cerrar
// ──────────────────────────────────────────────────────

function openCart() {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
  // Bloquea el scroll del body para que el drawer capture el scroll en móvil
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
}

function closeCart() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
  // Restaura el scroll del body
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
  hidePaymentForm();
}

// ══════════════════════════════════════════════════════════════════
//  STRIPE — Inicializar y mostrar formulario de pago
// ══════════════════════════════════════════════════════════════════

async function showPaymentForm() {
  if (cart.length === 0) return;

  const paymentSection = document.getElementById("stripe-payment-section");
  const checkoutBtn = document.getElementById("cart-checkout-btn");
  const loadingMsg = document.getElementById("payment-loading");

  paymentSection.style.display = "block";
  checkoutBtn.style.display = "none";
  loadingMsg.style.display = "block";

  try {
    // 1. Usar Stripe global (cargado desde js.stripe.com en index.html)
    if (!stripeInstance) {
      stripeInstance = Stripe(CONFIG.STRIPE_PUBLIC_KEY);
    }

    const totalAmount = getCartTotal();

    // 2. Pedir el clientSecret al backend
    const res = await fetch(`${CONFIG.BACKEND_URL}/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalAmount }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Error al crear el pago");
    }

    const { clientSecret } = await res.json();

    // 3. Montar el formulario de Stripe Elements
    stripeElements = stripeInstance.elements({ clientSecret });
    const paymentElement = stripeElements.create("payment");
    paymentElement.mount("#payment-element");

    loadingMsg.style.display = "none";

  } catch (err) {
    console.error("Error al iniciar Stripe:", err);
    document.getElementById("payment-error").textContent =
      "Error al cargar el formulario de pago: " + err.message;
    document.getElementById("payment-error").style.display = "block";
    loadingMsg.style.display = "none";
  }
}

function hidePaymentForm() {
  const paymentSection = document.getElementById("stripe-payment-section");
  const checkoutBtn = document.getElementById("cart-checkout-btn");

  if (paymentSection) {
    paymentSection.style.display = "none";
    document.getElementById("payment-element").innerHTML = "";
    document.getElementById("payment-error").style.display = "none";
  }
  if (checkoutBtn) checkoutBtn.style.display = "block";
  stripeElements = null;
}

async function submitPayment(e) {
  e.preventDefault();

  if (!stripeElements) return;

  const submitBtn = document.getElementById("pay-now-btn");
  const errorEl = document.getElementById("payment-error");

  submitBtn.disabled = true;
  submitBtn.textContent = "Procesando...";
  errorEl.style.display = "none";

  try {
    const { error } = await stripeInstance.confirmPayment({
      elements: stripeElements,
      confirmParams: {
        // Cambia esta URL por tu dominio real en producción
        return_url: window.location.origin + "/success",
      },
    });

    if (error) {
      errorEl.textContent = error.message;
      errorEl.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = "Pagar ahora";
    }
    // Si no hay error, Stripe redirige automáticamente a return_url
  } catch (err) {
    errorEl.textContent = "Error inesperado: " + err.message;
    errorEl.style.display = "block";
    submitBtn.disabled = false;
    submitBtn.textContent = "Pagar ahora";
  }
}

// ══════════════════════════════════════════════════════════════════
//  INICIALIZACIÓN — Conectar botones del carrusel al carrito
// ══════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  // Conectar botones "Buy now" del carrusel a productos
  const buyButtons = document.querySelectorAll(".carousel .buy");
  buyButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => addToCart(index + 1));
  });

  // Botón del carrito en el header
  const cartBtn = document.querySelector(".icon-btn.cart-icon-btn");
  if (cartBtn) cartBtn.addEventListener("click", openCart);

  // Overlay para cerrar
  const overlay = document.getElementById("cart-overlay");
  if (overlay) overlay.addEventListener("click", closeCart);

  // Botón X del drawer
  const closeBtn = document.getElementById("cart-close-btn");
  if (closeBtn) closeBtn.addEventListener("click", closeCart);

  // Botón "Ir a pagar"
  const checkoutBtn = document.getElementById("cart-checkout-btn");
  if (checkoutBtn) checkoutBtn.addEventListener("click", showPaymentForm);

  // Formulario de pago
  const payForm = document.getElementById("stripe-payment-form");
  if (payForm) payForm.addEventListener("submit", submitPayment);

  // Botón cancelar pago
  const cancelBtn = document.getElementById("cancel-payment-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", hidePaymentForm);
});