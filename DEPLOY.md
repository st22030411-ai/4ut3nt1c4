# 🚀 Guía de Despliegue — Auténtica en Render

## Antes de empezar

Necesitas tener:
- Cuenta en [GitHub](https://github.com) (gratis)
- Cuenta en [Render](https://render.com) (gratis)
- Tus llaves listas (ya están configuradas en este proyecto)

---

## Paso 1 — Sube el proyecto a GitHub

1. Crea un repositorio nuevo en GitHub (puede ser privado)
2. En tu terminal, dentro de la carpeta `autentica-render`:

```bash
git init
git add .
git commit -m "primer commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

> ⚠️ El archivo `server/.env` **NO** se sube a Git (está en `.gitignore`).
> Las llaves se configuran directamente en Render en el siguiente paso.

---

## Paso 2 — Crear el Web Service (Backend)

1. Ve a [dashboard.render.com](https://dashboard.render.com) → **New → Web Service**
2. Conecta tu repositorio de GitHub
3. Configura así:

| Campo | Valor |
|-------|-------|
| **Name** | `autentica-api` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

4. En **Environment Variables**, agrega:

| Variable | Valor |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_51T9FDiCB5JEV56dQ...` (tu llave secreta) |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-k8pIeN5Vwi...` (tu llave de Anthropic) |
| `FRONTEND_URL` | *(déjala vacía por ahora, la llenarás en el Paso 4)* |

5. Haz click en **Create Web Service**
6. Espera a que termine de deployar (~2 min)
7. **Copia la URL** que te da Render, se ve así: `https://autentica-api.onrender.com`

---

## Paso 3 — Edita config.js con la URL del backend

Abre el archivo `js/config.js` y reemplaza la URL:

```js
const CONFIG = {
  BACKEND_URL: "https://autentica-api.onrender.com",  // ← la URL del paso anterior
  STRIPE_PUBLIC_KEY: "pk_test_51T9...",               // ya está configurada
};
```

Guarda y haz commit:
```bash
git add js/config.js
git commit -m "configura URL del backend"
git push
```

---

## Paso 4 — Crear el Static Site (Frontend)

1. En Render → **New → Static Site**
2. Conecta el mismo repositorio
3. Configura así:

| Campo | Valor |
|-------|-------|
| **Name** | `autentica` |
| **Root Directory** | *(vacío, usa la raíz)* |
| **Build Command** | *(vacío)* |
| **Publish Directory** | `.` |

4. Haz click en **Create Static Site**
5. Espera a que termine (~1 min)
6. **Copia la URL** del Static Site, ej: `https://autentica.onrender.com`

---

## Paso 5 — Conectar el CORS del backend

1. Ve al Web Service `autentica-api` en Render
2. Entra a **Environment**
3. Edita la variable `FRONTEND_URL` y pon la URL del Static Site:
   ```
   https://autentica.onrender.com
   ```
4. Render redesplegará el backend automáticamente

---

## ✅ Listo

Tu app está en línea con:
- 🤖 Chatbot funcionando (Anthropic API)
- 💳 Pagos funcionando (Stripe)
- 📱 PWA instalable en móvil

---

## ⚠️ Notas importantes

- **Plan gratuito de Render**: El Web Service se "duerme" después de 15 min de inactividad. La primera request después de eso tarda ~30 seg. Es normal.
- **Stripe en modo test**: Las tarjetas reales no funcionan todavía. Para probar usa `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.
- **Cuando quieras ir a producción**: Cambia las llaves `sk_test_` y `pk_test_` por las llaves `sk_live_` y `pk_live_` de tu cuenta de Stripe.

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| Chatbot no responde | Verifica que `ANTHROPIC_API_KEY` está correcta en Render |
| Error de pago | Verifica que `STRIPE_SECRET_KEY` está correcta en Render |
| Error CORS | Verifica que `FRONTEND_URL` tiene exactamente la URL del Static Site (sin `/` al final) |
| El backend no carga | Ve a los **Logs** del Web Service en Render para ver el error |
