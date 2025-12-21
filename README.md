# EcoMart - Sustainable E-Commerce Platform

A full-stack e-commerce application focused on eco-friendly and sustainable products.

## Features

- User authentication and authorization
- Product browsing and search
- Shopping cart functionality
- Secure payment processing with Stripe
- Order management
- Admin dashboard with analytics
- Responsive design
- Email notifications with RabbitMQ

## Tech Stack

### Backend
- **NestJS** with TypeScript (migrated from Express.js)
- MongoDB with Mongoose
- JWT Authentication with Passport
- Stripe Payment Integration
- RabbitMQ for email queue
- Class-validator for request validation
- Dependency Injection

### Frontend
- React with Vite
- Redux Toolkit for state management
- React Router for navigation
- Axios for API calls
- Tailwind CSS (optional)

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ecomart
```

2. Install dependencies
```bash
npm run install-all
```

3. Configure environment variables
   - Create `.env` file in the root directory
   - Add required variables (see backend/NESTJS_MIGRATION.md)

4. Start development servers
```bash
# Backend (from backend directory)
cd backend
npm run start:dev

# Frontend (from frontend directory)
cd frontend
npm run dev

# Email Worker (optional, from backend directory)
cd backend
npx ts-node src/worker.ts
```

Backend runs on http://localhost:5000
Frontend runs on http://localhost:5173

## NestJS Migration

The backend has been converted to NestJS! See [backend/NESTJS_MIGRATION.md](backend/NESTJS_MIGRATION.md) for details.

## Project Structure

