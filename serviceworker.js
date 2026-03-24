const CACHE = "autentica-v2";

const FILES = [
  "/",
  "/index.html",
  "/main.css",
  "/css/cart.css",
  "/js/config.js",
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
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Solo cachear archivos del propio frontend (mismo origen).
  // Cualquier petición a otro dominio (backend API, Stripe, Anthropic, etc.)
  // se deja pasar directamente sin interceptar.
  if (url.origin !== self.location.origin) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
