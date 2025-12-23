# EcoMart - Sustainable E-Commerce Platform 🌱

Full-stack e-commerce application for eco-friendly products built with NestJS, Next.js, and MongoDB.

## 🛠️ Tech Stack

- **Backend**: NestJS + TypeScript + MongoDB + Stripe + RabbitMQ
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS + Material-UI
- **Database**: MongoDB (Atlas or Local)
- **Message Queue**: RabbitMQ
- **Deployment**: Docker + Docker Compose
- **API Docs**: Swagger/OpenAPI

## 📁 Project Structure

```
ecomart/
├── backend/                    # NestJS API
│   ├── src/                    # Source code
│   ├── .env.development        # Local dev environment
│   ├── .env.production         # Production environment
│   └── Dockerfile              # Backend container
├── frontend/                   # Next.js app
│   ├── app/                    # Next.js 13+ app directory
│   ├── components/             # React components
│   ├── .env.development        # Local dev environment
│   └── .env.production         # Production environment
├── docker-compose.yml          # Service orchestration
└── README.md                   # This file
```

---

## 🚀 Quick Start

### **Option 1: Local Development (Recommended)**

Run backend and frontend locally with Docker for support services.

#### **1. Clone & Install**

```bash
git clone <repo-url>
cd ecomart

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### **2. Setup Environment Variables**

**Backend:**
```bash
cd backend
cp .env.development.example .env.development
# Edit .env.development with your values
```

**Frontend:**
```bash
cd frontend
cp .env.development.example .env.development
# Edit .env.development with your values
```

#### **3. Start Services**

```bash
# Terminal 1: Start support services (MongoDB + RabbitMQ)
docker compose up -d rabbitmq mongo

# Terminal 2: Start backend
cd backend
npm run start:dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

#### **4. Access Application**

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:5000/api
- 📚 **API Docs**: http://localhost:5000/api/docs
- 🐰 **RabbitMQ UI**: http://localhost:15672 (admin/admin)

---

### **Option 2: Full Docker Deployment**

Run everything in Docker containers (production-like).

#### **1. Setup Environment**

```bash
cd backend
cp .env.production.example .env.production
# Edit .env.production with your production values
```

#### **2. Start All Services**

```bash
docker compose up -d --build
```

#### **3. Access Application**

- 🔌 **Backend API**: http://localhost:5000/api
- 📚 **API Docs**: http://localhost:5000/api/docs
- 🐰 **RabbitMQ UI**: http://localhost:15672 (admin/admin)

---

## 📋 Environment Variables

### **Backend (.env.development)**

```bash
NODE_ENV=development
PORT=5000

# Database (use localhost for local Docker MongoDB)
MONGO_URI=mongodb://localhost:27017/ecomart
# OR use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecomart

# RabbitMQ (local Docker)
RABBITMQ_URL=amqp://admin:admin@localhost:5672

# JWT
JWT_SECRET=your_dev_jwt_secret
JWT_EXPIRES_IN=7d

# Stripe (test keys)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### **Frontend (.env.development)**

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Stripe Publishable Key (test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

---

## 🔧 Available Scripts

### **Backend**

```bash
npm run start:dev      # Development mode with hot reload
npm run start:prod     # Production mode
npm run build          # Build for production
npm run test           # Run tests
npm run worker:dev     # Start email worker (development)
npm run worker:prod    # Start email worker (production)
```

### **Frontend**

```bash
npm run dev            # Development mode with hot reload
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
```

### **Docker**

```bash
docker compose up -d                    # Start all services
docker compose up -d rabbitmq mongo     # Start only support services
docker compose down                     # Stop all services
docker compose down -v                  # Stop and remove volumes
docker compose logs -f backend          # View backend logs
docker compose logs -f email-worker     # View worker logs
```

---

## 🏗️ Architecture

### **Backend Services**

- **API Server** (Port 5000): Main NestJS application
- **Email Worker**: Processes email jobs from RabbitMQ queue
- **MongoDB**: Database for storing products, orders, users
- **RabbitMQ**: Message queue for async email processing

### **Frontend**

- **Next.js 16**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **Material-UI**: Component library
- **Context API**: State management

---

## 📚 API Documentation

Once the backend is running, visit:

**Swagger UI**: http://localhost:5000/api/docs

### **Main Endpoints**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - List products
- `POST /api/orders` - Create order
- `POST /api/payment/create-intent` - Create payment
- `GET /api/orders/my` - User's orders

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

1. Register or login to get a token
2. Include token in requests: `Authorization: Bearer <token>`
3. Tokens expire after 7 days (configurable)

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests (if configured)
cd frontend
npm run test
```

---

## 🐳 Docker Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| Backend API | ecomart-backend | 5000 | NestJS API server |
| Email Worker | ecomart-email-worker | - | Background job processor |
| MongoDB | ecomart-mongo | 27017 | Database |
| RabbitMQ | ecomart-rabbitmq | 5672, 15672 | Message queue |

---

## 🛠️ Troubleshooting

### **"MONGO_URI is undefined"**
- Make sure you've created `.env.development` from `.env.development.example`
- Check that the file is in the correct directory (`backend/`)

### **"Cannot connect to RabbitMQ"**
- Ensure RabbitMQ is running: `docker compose up -d rabbitmq`
- Check RabbitMQ is healthy: `docker ps`

### **"Port 5000 already in use"**
- Kill the process: `lsof -ti:5000 | xargs kill -9`
- Or change PORT in `.env.development`

### **Frontend can't connect to backend**
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.development`

---

## 📖 Additional Documentation

- **Backend Details**: See [backend/README.md](backend/README.md)
- **Frontend Details**: See [frontend/README.md](frontend/README.md)
- **Environment Setup**: See [SETUP.md](SETUP.md)
- **Environment Files Explained**: See [ENV_FILES_EXPLAINED.md](ENV_FILES_EXPLAINED.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🌟 Features

- ✅ User authentication & authorization
- ✅ Product catalog with categories
- ✅ Shopping cart management
- ✅ Order processing
- ✅ Stripe payment integration
- ✅ Email notifications (async with RabbitMQ)
- ✅ Admin dashboard
- ✅ Product reviews & ratings
- ✅ Wishlist functionality
- ✅ Responsive design
- ✅ API documentation (Swagger)
- ✅ Docker deployment

---

Made with ❤️ for a sustainable future 🌱
