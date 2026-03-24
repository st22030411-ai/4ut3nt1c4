const CACHE = "autentica-v1";

const FILES = [
  "/",
  "/index.html",
  "/main.css",
  "/css/cart.css",
  "/js/payment.js",
  "/js/header.js",
  "/js/chatbot.js",
  "/blocks/aboutme.css",
  "/blocks/carrousel.css",
  "/blocks/gstyles.css",
  "/blocks/header.css",
  "/blocks/hero.css",
  "/fonts/Metanoia.ttf",
  "/fonts/PlayfairDisplay-Regular.ttf",
  "/assets/images/logo.png",
  "/assets/images/herobg.png",
  "/icons/192.png",
  "/icons/512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  // Borra cachés viejos cuando se actualiza la app
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // ⚠️ IMPORTANTE: NO cachear peticiones al backend de Stripe ni a la API de Stripe
  if (
    url.pathname.startsWith("/create-payment-intent") ||
    url.hostname.includes("stripe.com") ||
    url.hostname.includes("esm.sh")
  ) {
    return; // deja pasar sin interceptar
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
