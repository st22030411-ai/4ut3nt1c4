# Auténtica — PWA con Stripe y chatbot



### 3. Instala dependencias del servidor
```bash
cd server
npm install
```

### 4. Inicia el servidor
```bash
cd server
node server.js
```



## 💳 Probar pagos

Con tarjeta real: ingresa los datos de tu tarjeta en el formulario.

Para pruebas (sin cobrar dinero real), usa:
- Número: `4242 4242 4242 4242`
- Fecha: cualquier fecha futura
- CVC: cualquier 3 dígitos

---

## 📁 Estructura del proyecto

```
autenticaaa/
├── index.html          ← Página principal
├── success.html        ← Página tras pago exitoso
├── main.css            ← Estilos globales
├── css/
│   └── cart.css        ← Estilos del carrito y Stripe
├── js/
│   ├── payment.js      ← Lógica del carrito + Stripe (EDITA la pk aquí)
│   ├── header.js
│   └── chatbot.js
├── server/
│   ├── server.js       ← Backend Node.js + Express
│   ├── .env            ← TUS LLAVES SECRETAS (no subir a Git)
│   └── package.json
├── .gitignore          ← Protege .env y node_modules
└── README.md
```

---

