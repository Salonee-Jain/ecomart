## 🚀 Quick Start - NestJS Backend

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Ensure your `.env` file exists in the root directory with:
```env
MONGO_URI=mongodb://localhost:27017/ecomart
JWT_SECRET=your_secret_key_here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
NODE_ENV=development
```

### 3. Start the Server
```bash
npm run start:dev
```

Server will start at: http://localhost:5000

### 4. Test It
Visit: http://localhost:5000/api

You should see: "EcoMart API is running 🌱"

### 5. Start Email Worker (Optional)
In a new terminal:
```bash
cd backend
npx ts-node src/worker.ts
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/analytics` - Product analytics (Admin)

### Cart
- `GET /api/cart` - Get my cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove from cart
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/merge` - Merge guest cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my` - Get my orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/pay` - Mark order as paid
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/deliver` - Mark delivered (Admin)
- `GET /api/orders/analytics` - Order analytics (Admin)

### Payments
- `POST /api/payment/create-intent` - Create payment intent
- `GET /api/payment/:id` - Get payment by ID
- `GET /api/payment/all` - Get all payments (Admin)
- `POST /api/payment/confirm/:paymentIntentId` - Confirm payment
- `POST /api/payment/webhook` - Stripe webhook

### Users (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

### Email
- `POST /api/email/test` - Send test email
- `POST /api/email/payment-success/:orderId` - Send payment success email
- `POST /api/email/order/:orderId` - Send order email (Admin)

---

## 🔑 Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

---

## ✅ Everything Working?

1. ✅ Server starts without errors
2. ✅ MongoDB connects successfully
3. ✅ Can register/login users
4. ✅ Can fetch products
5. ✅ API responds correctly

**Your NestJS backend is ready!** 🎉

For more details, see:
- [NESTJS_MIGRATION.md](./NESTJS_MIGRATION.md) - Migration details
- [CONVERSION_SUMMARY.md](./CONVERSION_SUMMARY.md) - Complete summary
