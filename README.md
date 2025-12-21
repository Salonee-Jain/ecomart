# EcoMart - Sustainable E-Commerce Platform 🌱

A full-stack e-commerce application focused on eco-friendly and sustainable products. Built with modern technologies and best practices.

## ✨ Features

- 🔐 User authentication and authorization (JWT)
- 🛍️ Product browsing with advanced filtering
- 🛒 Shopping cart functionality
- 💳 Secure payment processing with Stripe
- 📦 Order management and tracking
- 📊 Admin dashboard with analytics
- 📧 Email notifications via RabbitMQ
- 📚 Interactive API documentation (Swagger)
- 🎨 Responsive modern UI

## 🛠️ Tech Stack

### Backend
- **NestJS** with TypeScript
- MongoDB with Mongoose
- JWT Authentication with Passport
- Stripe Payment Integration (v14.25.0)
- RabbitMQ for message queue
- Swagger/OpenAPI documentation
- Class-validator & class-transformer
- Dependency Injection

### Frontend
- **Next.js 15** (App Router)
- TypeScript
- React Server Components
- Tailwind CSS
- Modern UI components

## 📁 Project Structure

```
ecomart/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── product/  # Product management
│   │   ├── cart/     # Shopping cart
│   │   ├── order/    # Order processing
│   │   ├── payment/  # Stripe integration
│   │   ├── email/    # Email service & RabbitMQ
│   │   ├── user/     # User management
│   │   └── schemas/  # MongoDB schemas
│   └── README.md     # Backend documentation
├── frontend/         # Next.js app
└── docker-compose.yml # RabbitMQ service
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Docker & Docker Compose (for RabbitMQ)
- Stripe account with API keys

### 1. Clone Repository
```bash
git clone <repository-url>
cd ecomart
```

### 2. Environment Setup

Create `.env` in the **root directory**:
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

### 3. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Start Services

**Terminal 1 - RabbitMQ (from root):**
```bash
docker compose up -d
```
Management UI: `http://localhost:15672` (admin/admin)

**Terminal 2 - Backend:**
```bash
cd backend
npm run start:dev
```
API: `http://localhost:5000`
Swagger Docs: `http://localhost:5000/api/docs`

**Terminal 3 - Email Worker:**
```bash
cd backend
npx ts-node src/worker.ts
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
```
App: `http://localhost:3000`

**Terminal 5 - Stripe CLI (for webhooks):**
```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```

## 📚 Documentation

- **Backend API**: See [backend/README.md](backend/README.md)
- **Swagger Docs**: `http://localhost:5000/api/docs` (when server is running)
- **API Endpoints**: Full documentation in backend README

## 🔧 Development

### Backend Development
```bash
cd backend
npm run start:dev    # Hot reload
npm run build        # Production build
npm run start:prod   # Production mode
```

### Frontend Development
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
```

### Docker Services
```bash
# Start RabbitMQ
docker compose up -d

# View logs
docker compose logs rabbitmq

# Stop services
docker compose down
```

## 🎯 Key Features

### Authentication
- JWT-based authentication
- Role-based access control (User/Admin)
- Secure password hashing with bcrypt

### Products
- Advanced filtering (category, price range, keyword)
- Pagination support
- Stock management
- Product analytics (Admin)

### Orders & Payments
- Stripe payment integration
- Order tracking and status updates
- Automatic stock reduction on payment
- Payment confirmation emails

### Admin Features
- Product management (CRUD)
- User management
- Order analytics
- Sales statistics

## 🐛 Troubleshooting

**Port already in use:**
```bash
lsof -i :5000  # Backend
lsof -i :3000  # Frontend
kill -9 <PID>
```

**MongoDB connection failed:**
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`

**RabbitMQ not connecting:**
```bash
docker compose ps
docker compose restart rabbitmq
```

**Stripe webhooks not working:**
- Use Stripe CLI for local testing
- Update `STRIPE_WEBHOOK_SECRET` after running `stripe listen`

## 📦 Deployment

### Backend
- Build: `npm run build`
- Deploy `dist/` folder to your Node.js hosting
- Set environment variables on hosting platform

### Frontend
- Build: `npm run build`
- Deploy `.next/` folder to Vercel/Netlify
- Configure API URL environment variable

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- NestJS framework
- Next.js framework
- Stripe for payment processing
- MongoDB for database
- RabbitMQ for message queue

---

**Made with ❤️ for a sustainable future**

