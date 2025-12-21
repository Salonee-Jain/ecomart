# 🚀 EcoMart Backend (Node.js + Express + MongoDB + Stripe)

This backend provides:

* 🛒 Cart (MongoDB)
* 📦 Orders with stock validation
* 💳 Stripe PaymentIntent integration
* 🔔 Stripe Webhooks (mark order paid + reduce stock)
* 🔐 JWT Authentication
* 🧱 MongoDB Models (User, Product, Order, Cart, Payment)

This README includes **only what you MUST know** to run Stripe payment flow successfully.

---

## ✅ 1. Install Dependencies

```bash
cd backend
npm install
```

---

## ⚙️ 2. Environment Variables

Create `.env`:

```
PORT=5010
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret

STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx   # Added after Stripe CLI step
CLIENT_URL=http://localhost:5173
```

---

## 🚀 3. Start Backend

```bash
npm run dev
```

---

## 🔔 4. Stripe Webhook Setup (IMPORTANT)

Stripe webhooks MUST be defined **before** `express.json()`.

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

## 🧪 5. Stripe CLI Setup (Local Testing)

Install Stripe CLI:
[https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

Login:

```bash
stripe login
```

Start webhook listener:

```bash
stripe listen --forward-to localhost:5010/api/payment/webhook
```

Terminal prints:

```
Webhook signing secret: whsec_xxxxx
```

Add it to `.env`:

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Restart backend.

---

## 💳 6. Create PaymentIntent (via API)

Send POST request:

```
POST /api/payment/create-intent
```

Response:

```json
{
  "clientSecret": "pi_XXX_secret_YYY",
  "paymentId": "payment_db_id"
}
```

Copy **paymentIntentId** from Stripe response.

---

## 🎉 7. Simulate Payment Success

Run:

```bash
stripe payment_intents confirm pi_XXX --payment-method pm_card_visa
```

If success, Stripe automatically sends:

```
payment_intent.succeeded
```

Your webhook will:

✔ mark order as paid
✔ reduce stock
✔ update payment status in DB

---

## 📘 8. Verify

### Order:

```
GET /api/orders/:id
```

Expect:

```json
{
  "isPaid": true,
  "paidAt": "2025-12-21T..."
}
```

### Product:

```
GET /api/products/:id
```

Stock reduced.

### Payment:

```
GET /api/payment/:id
```

Status should be `"succeeded"`.

---

## 🎯 Done

Your backend is now fully configured for **local Stripe payments**, **webhooks**, **cart**, **orders**, and **inventory**.

---

## 📂 Project Structure

```
backend/
├── config/
│   ├── db.js           # MongoDB connection
│   └── stripe.js       # Stripe configuration
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── productController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   ├── Cart.js
│   └── Payment.js
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── productRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── generateToken.js
│   └── errorResponse.js
├── app.js
├── server.js
└── package.json
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/merge` - Merge guest cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/paid` - Mark order as paid
- `PUT /api/orders/:id/deliver` - Mark order as delivered (Admin)
- `PUT /api/orders/:id/cancel` - Cancel order

### Payment
- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/payment/webhook` - Stripe webhook handler
- `GET /api/payment/:id` - Get payment details

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)
