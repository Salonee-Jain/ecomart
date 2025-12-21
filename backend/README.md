# 🚀 **EcoMart Backend (Node.js + Express + MongoDB + Stripe + RabbitMQ)**

This backend supports:

* 🛒 Cart (MongoDB)
* 📦 Orders + stock validation
* 💳 Stripe payments (PaymentIntent)
* 🔔 Stripe webhook (mark order paid + reduce stock)
* 📧 Email notifications (RabbitMQ + Worker + Nodemailer)
* 🐰 RabbitMQ for async background jobs
* 🔐 JWT Authentication
* 🧱 Models: User, Product, Order, Cart, Payment

This README contains **exactly what you need** to run the entire flow end-to-end.

---

# ✅ **1. Install Dependencies**

```bash
cd backend
npm install
```

---

# ⚙️ **2. Create `.env` File**

```
PORT=5010
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret

STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx   # from Stripe CLI

CLIENT_URL=http://localhost:5173

# Email (Gmail)
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your16digitapppassword

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

---

# 🐰 **3. RabbitMQ Setup (Docker)**

We are using **Docker Compose**, not `docker run`.

### Start RabbitMQ:

```bash
docker compose up -d
```

Check container:

```bash
docker ps
```

RabbitMQ dashboard:

👉 [http://localhost:15672](http://localhost:15672)
Login:

```
admin / admin    (if you configured this)
or
guest / guest    (default)
```

---

# 🚀 **4. Start Backend + Worker (TWO terminals required)**

### Terminal 1 — Start Backend API

```bash
cd backend
npm run dev
```

### Terminal 2 — Start Worker

Worker runs in background to process payment emails:

```bash
cd backend
node workers/emailWorker.js
```

Expected logs:

```
🐰 RabbitMQ connected
📦 Worker connected to MongoDB
🐰 Worker started, listening for email jobs
```

---

# 🔔 **5. Stripe Webhook Setup (IMPORTANT)**

Stripe webhook route **must be BEFORE** `express.json()`.

In `app.js`:

```js
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());
```

---

# 🧪 **6. Stripe CLI Setup (Local Payment Testing)**

Install Stripe CLI:

[https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

Login:

```bash
stripe login
```

Start webhook forwarding:

```bash
stripe listen --forward-to localhost:5010/api/payment/webhook
```

Output shows:

```
Webhook signing secret: whsec_xxxxx
```

Put this inside `.env`:

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Restart backend.

---

# 💳 **7. Create PaymentIntent (API)**

POST request:

```
POST /api/payment/create-intent
```

Response:

```json
{
  "clientSecret": "pi_XXX_secret_YYY",
  "paymentIntentId": "pi_XXX"
}
```

Copy **paymentIntentId**.

---

# 🎉 **8. Confirm Payment (Simulate Stripe Success)**

Using Stripe’s test card:

```bash
stripe payment_intents confirm pi_XXX --payment-method pm_card_visa
```

This triggers:

```
payment_intent.succeeded
```

Your webhook will:

✔ mark order as paid
✔ reduce product stock
✔ insert payment record (if implemented)
✔ send job to RabbitMQ

Worker will:

✔ consume job
✔ load order + user
✔ send confirmation email

---

# 📧 **9. Gmail Email Setup (Must Use App Password)**

Enable 2-Step Verification:

👉 [https://myaccount.google.com/security](https://myaccount.google.com/security)

Generate App Password:

👉 [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

Use this in `.env`:

```
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

Restart worker:

```bash
node workers/emailWorker.js
```

---

# 📘 **10. Verify Payment Flow**

### Check order:

```
GET /api/orders/:id
```

Should show:

```json
{
  "isPaid": true
}
```

### Check product stock:

```
GET /api/products/:id
```

Stock decreased.

### Check email worker logs:

```
📩 Received job: {...}
📧 Email sent to: user@email.com
```

---

# 🐳 **11. Docker Commands You Used**

Start RabbitMQ:

```bash
docker compose up -d
```

Stop:

```bash
docker compose down
```

Restart:

```bash
docker compose restart
```

View logs:

```bash
docker logs ecomart-rabbitmq
```

---

# 🧱 **12. Backend Structure (Final Project)**

```
backend/
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── paymentController.js
│   └── stripeWebhookController.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   └── errorMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   ├── Cart.js
│   └── Payment.js
│
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── productRoutes.js
│   └── userRoutes.js
│
├── utils/
│   ├── generateToken.js
│   ├── errorResponse.js
│   ├── rabbitmq.js
│   ├── sendEmail.js
│   └── paymentEmailTemplate.js
│
├── workers/
│   └── emailWorker.js
│
├── server.js
└── app.js
```

---

# 🎯 **13. API Endpoints Summary**

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`

### Products

* `GET /api/products`
* `GET /api/products/:id`
* `POST /api/products` (Admin)
* `PUT /api/products/:id`
* `DELETE /api/products/:id`

### Cart

* `GET /api/cart`
* `POST /api/cart`
* `PUT /api/cart/:productId`
* `DELETE /api/cart/:productId`
* `DELETE /api/cart`
* `POST /api/cart/merge`

### Orders

* `POST /api/orders`
* `GET /api/orders/my`
* `GET /api/orders/:id`
* `GET /api/orders` (Admin)

### Payment

* `POST /api/payment/create-intent` - Create payment intent
* `POST /api/payment/confirm/:paymentIntentId` - Confirm payment (Testing)
* `POST /api/payment/webhook` - Stripe webhook handler
* `GET /api/payment/:id` - Get payment details

### Users

* `GET /api/users` (Admin)
* `GET /api/users/:id` (Admin)

