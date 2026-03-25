import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ── CORS ────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "https://fourut3nt1c4s-frontend.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado para: ${origin}`));
      }
    },
  })
);
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── STRIPE: Crear PaymentIntent ─────────────────────────────────
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: "Monto inválido. Mínimo 100 centavos." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "mxn",
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Error Stripe:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── CHATBOT: Proxy hacia Groq API (gratis) ──────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { message, websiteContent } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mensaje vacío." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 512,
        messages: [
          {
            role: "system",
            content: `Eres la asistente virtual de Auténtica, una marca de moda e imagen personal.
Responde SOLO con información del sitio web. Sé amable, breve y en español.
Si la pregunta no tiene relación con el sitio, di: "No tengo esa información, pero puedo ayudarte con nuestros servicios."

Contenido del sitio:
${websiteContent || "Auténtica ofrece servicios de imagen personal: Limpieza de Closet, Colorimetría Personal, Asesoría de Imagen, Personal Shopper, Styling de Outfit, Armado de Cápsula y Consulta Express."}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Error de API Groq");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No pude generar una respuesta.";

    res.json({ reply });
  } catch (err) {
    console.error("Error chatbot:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "ok", service: "Auténtica API" }));

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));