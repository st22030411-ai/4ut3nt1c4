if ("serviceWorker" in navigator) {
  // El archivo se llama serviceworker.js, no sw.js
  navigator.serviceWorker.register("/serviceworker.js")
    .then(reg => console.log("✅ Service Worker registrado:", reg.scope))
    .catch(err => console.error("❌ Error al registrar SW:", err));
}
