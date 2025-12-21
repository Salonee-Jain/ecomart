# EcoMart Backend - NestJS API 🚀

Modern e-commerce backend built with NestJS, TypeScript, MongoDB, Stripe, and RabbitMQ.

## 📋 Prerequisites

- Node.js (v16+)
- MongoDB running locally or remote connection
- Docker & Docker Compose (for RabbitMQ)
- Stripe account with API keys

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file in the **root directory** (not in backend/):
```env
# Database
MONGO_URI=mongodb://localhost:27017/ecomart

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Server
PORT=5000
NODE_ENV=development
```

### 3. Start Services

**Terminal 1 - Start RabbitMQ (from root directory):**
```bash
cd ..
docker compose up -d
```
This starts RabbitMQ. Management UI: `http://localhost:15672` (admin/admin)

**Terminal 2 - Start Backend:**
```bash
cd backend
npm run start:dev
```
Server runs at: `http://localhost:5000`

**Terminal 3 - Start Email Worker:**
```bash
npx ts-node src/worker.ts
```

**Terminal 4 - Stripe Webhook Listener (for local testing):**
```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```
Copy the webhook signing secret to your `.env` as `STRIPE_WEBHOOK_SECRET`

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | None |
| POST | `/api/auth/login` | Login user | None |
| POST | `/api/auth/logout` | Logout user | None |

**Register/Login Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "token": "jwt_token_here"
}
```

### 🛍️ Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Get all products (with filters) | None |
| GET | `/api/products/:id` | Get product by ID | None |
| GET | `/api/products/analytics` | Product analytics | Admin |
| POST | `/api/products` | Create product | Admin |
| POST | `/api/products/bulk` | Bulk create products | Admin |
| POST | `/api/products/bulk-delete` | Bulk delete products | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

**Query Parameters:**
- `keyword` - Search by name
- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### 🛒 Cart
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart` | Get my cart | User |
| POST | `/api/cart` | Add to cart | User |
| PUT | `/api/cart/:productId` | Update cart item quantity | User |
| DELETE | `/api/cart/:productId` | Remove from cart | User |
| DELETE | `/api/cart` | Clear cart | User |
| POST | `/api/cart/merge` | Merge guest cart | User |

**Add to Cart Request:**
```json
{
  "productId": "product_id_here",
  "quantity": 2
}
```

### 📦 Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create order | User |
| GET | `/api/orders/my` | Get my orders | User |
| GET | `/api/orders/:id` | Get order by ID | User/Admin |
| GET | `/api/orders` | Get all orders | Admin |
| GET | `/api/orders/analytics` | Order analytics | Admin |
| PUT | `/api/orders/:id/pay` | Mark order as paid | User/Admin |
| PUT | `/api/orders/:id/cancel` | Cancel order | User/Admin |
| PUT | `/api/orders/:id/deliver` | Mark delivered | Admin |

**Create Order Request:**
```json
{
  "orderItems": [
    {
      "product": "product_id",
      "name": "Product Name",
      "sku": "SKU123",
      "price": 29.99,
      "quantity": 2,
      "image": "image_url"
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",
    "city": "Sydney",
    "postalCode": "2000",
    "country": "Australia"
  },
  "paymentMethod": "stripe"
}
```

### 💳 Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payment/create-intent` | Create payment intent | User |
| GET | `/api/payment/:id` | Get payment by ID | User/Admin |
| GET | `/api/payment/all` | Get all payments | Admin |
| POST | `/api/payment/confirm/:paymentIntentId` | Confirm payment (testing) | User |
| POST | `/api/payment/webhook` | Stripe webhook | None |

**Create Payment Intent Request:**
```json
{
  "orderId": "order_id_here"
}
```

**Response:**
```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentId": "payment_id",
  "stripePaymentIntentId": "pi_..."
}
```

### 👥 Users (Admin Only)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PUT | `/api/users/:id/role` | Update user role | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

### 📧 Email
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/email/test` | Send test email | User |
| POST | `/api/email/payment-success/:orderId` | Send payment success email | User/Admin |
| POST | `/api/email/order/:orderId` | Send custom order email | Admin |

## 🔑 Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

## 🧪 Testing the API

### Using cURL:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Get Products:**
```bash
curl http://localhost:5000/api/products
```

**Protected Route (with token):**
```bash
curl http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛠️ Development Commands

```bash
# Start in development mode (hot reload)
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run email worker
npx ts-node src/worker.ts

# Format code
npm run format
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.ts                  # Entry point
│   ├── app.module.ts            # Root module
│   ├── worker.ts                # Email worker
│   ├── schemas/                 # Mongoose models
│   ├── auth/                    # Authentication
│   ├── product/                 # Products
│   ├── cart/                    # Shopping cart
│   ├── order/                   # Orders
│   ├── payment/                 # Payments & Stripe
│   ├── email/                   # Email & RabbitMQ
│   ├── user/                    # User management
│   └── guards/                  # Authorization
├── dist/                        # Compiled code
├── package.json
└── tsconfig.json
```

## 🔧 Troubleshooting

**Port already in use:**
```bash
lsof -i :5000
kill -9 <PID>
```

**MongoDB connection failed:**
- Ensure MongoDB is running: `mongosh`
- Check `MONGO_URI` in `.env`

**RabbitMQ not connecting:**
```bash
# Check if RabbitMQ container is running (from root directory)
docker compose ps

# Start RabbitMQ
docker compose up -d

# Stop RabbitMQ
docker compose down

# View RabbitMQ logs
docker compose logs rabbitmq

# Restart RabbitMQ
docker compose restart rabbitmq
```

**Stripe webhook issues:**
- Use Stripe CLI for local testing
- Update webhook secret in `.env`

## 📝 Notes

- **Admin Account**: Create a user with `isAdmin: true` in MongoDB or via registration endpoint with `isAdmin` field
- **Email Worker**: Must be running separately to process payment emails
- **Stock Management**: Orders reduce product stock when marked as paid
- **Webhook Security**: Stripe webhooks verify signature for security
- **RabbitMQ**: Running via Docker Compose from root directory

## 🎉 Features

- ✅ JWT Authentication with Passport
- ✅ Role-based authorization (User/Admin)
- ✅ MongoDB with Mongoose
- ✅ Stripe payment integration
- ✅ Automatic request validation
- ✅ Email notifications via RabbitMQ
- ✅ Stock management
- ✅ Order analytics
- ✅ Cart management
- ✅ TypeScript for type safety

---

**Backend running successfully!** 🚀

