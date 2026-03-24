// ══════════════════════════════════════════════════════════════════
//  AUTÉNTICA — Chatbot
//  La URL del backend viene de js/config.js
// ══════════════════════════════════════════════════════════════════

const button = document.getElementById("chatbot-button");
const box = document.getElementById("chatbot-box");
const input = document.getElementById("chatbot-input");
const messages = document.getElementById("chatbot-messages");

// abrir / cerrar chatbot
button.onclick = () => {
  box.style.display = box.style.display === "flex" ? "none" : "flex";
};

// enviar mensaje con Enter
input.addEventListener("keypress", async function (e) {
  if (e.key !== "Enter") return;

  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  input.disabled = true;

  // Mensaje del usuario
  messages.innerHTML += `<div><b>Tú:</b> ${text}</div>`;

  // Indicador de escritura
  const typingId = "typing-" + Date.now();
  messages.innerHTML += `<div id="${typingId}"><b>Auténtica:</b> <em>escribiendo...</em></div>`;
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch(`${CONFIG.BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        websiteContent: document.body.innerText,
      }),
    });

    const data = await res.json();
    const reply = data.reply || "No pude obtener una respuesta.";

    document.getElementById(typingId).innerHTML = `<b>Auténtica:</b> ${reply}`;
  } catch (err) {
    document.getElementById(typingId).innerHTML =
      `<b>Auténtica:</b> Error al conectar con el asistente. Intenta de nuevo.`;
  }

  input.disabled = false;
  input.focus();
  messages.scrollTop = messages.scrollHeight;
});