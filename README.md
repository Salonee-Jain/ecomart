# EcoMart - Sustainable E-Commerce Platform 🌱

Full-stack e-commerce application for eco-friendly products built with NestJS, Next.js, and MongoDB.

## 🛠️ Tech Stack

- **Backend**: NestJS + TypeScript + MongoDB + Stripe + RabbitMQ
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **API Docs**: Swagger/OpenAPI at `http://localhost:5000/api/docs`

## 📁 Project Structure

```
ecomart/
├── backend/          # NestJS API (see backend/README.md)
├── frontend/         # Next.js app (see frontend/README.md)
└── docker-compose.yml # RabbitMQ service
```

## 🚀 Quick Start

### 1. Environment Setup

Create `.env` in root directory:
```env
MONGO_URI=mongodb://localhost:27017/ecomart
JWT_SECRET=your_super_secret_jwt_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
PORT=5000
NODE_ENV=development
```

### 2. Install & Start

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start RabbitMQ (from root)
docker compose up -d

# Start backend (from backend/)
npm run start:dev

# Start frontend (from frontend/)
npm run dev
```

- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- Swagger Docs: `http://localhost:5000/api/docs`
- RabbitMQ UI: `http://localhost:15672` (admin/admin)

## 📚 Documentation

**Backend API (complete setup, endpoints, troubleshooting):**
👉 See [backend/README.md](backend/README.md)

**Frontend (components, pages, state management):**
👉 See [frontend/README.md](frontend/README.md)

---

Made with ❤️ for a sustainable future

