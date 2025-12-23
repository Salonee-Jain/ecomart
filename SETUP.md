# 🚀 Environment Setup Guide

## 📁 File Structure

```
ecomart/
├── backend/
│   ├── .env.development          ❌ NOT in git (your real secrets)
│   ├── .env.production           ❌ NOT in git (your real secrets)
│   ├── .env.development.example  ✅ IN git (template)
│   └── .env.production.example   ✅ IN git (template)
└── frontend/
    ├── .env.development          ❌ NOT in git (your real config)
    ├── .env.production           ❌ NOT in git (your real config)
    ├── .env.development.example  ✅ IN git (template)
    └── .env.production.example   ✅ IN git (template)
```

---

## 🎯 Quick Start

### **For New Developers:**

```bash
# 1. Clone the repo
git clone <repo-url>
cd ecomart

# 2. Setup backend environment
cd backend
cp .env.development.example .env.development
# Edit .env.development with real values (get from team)

# 3. Setup frontend environment
cd ../frontend
cp .env.development.example .env.development
# Edit .env.development with real values

# 4. Start development
# Terminal 1: Start support services
docker compose up -d rabbitmq mongo

# Terminal 2: Start backend
cd backend
npm install
npm run start:dev

# Terminal 3: Start frontend
cd frontend
npm install
npm run dev
```

---

## 🔑 Why `.example` Files?

### **The Problem:**
When you clone a repo, `.env` files are **NOT** included (they're gitignored for security).
New developers don't know what environment variables are needed!

### **The Solution:**
`.example` files are **templates** that show:
- ✅ What variables are required
- ✅ What format they should be in
- ✅ Example/placeholder values
- ✅ Comments explaining each variable

### **Example:**

**`.env.development.example` (in git):**
```bash
# Database connection
MONGO_URI=mongodb://localhost:27017/ecomart

# JWT Secret
JWT_SECRET=your_secret_here
```

**`.env.development` (NOT in git):**
```bash
# Database connection
MONGO_URI=mongodb+srv://realuser:realpass@cluster.mongodb.net/ecomart

# JWT Secret
JWT_SECRET=super_secret_production_key_abc123
```

---

## 🔄 How It Works

### **Development Mode** (`NODE_ENV=development`)

```bash
npm run start:dev
```

**Loads:** `.env.development`
**Uses:** 
- `localhost:5000` for backend
- `localhost:27017` for MongoDB
- `localhost:5672` for RabbitMQ

---

### **Production Mode** (`NODE_ENV=production`)

```bash
docker compose up -d
```

**Loads:** `.env.production`
**Uses:**
- Docker service names (`mongo`, `rabbitmq`)
- Production database
- Production API keys

---

## 📝 Package.json Scripts

Your `package.json` should have:

```json
{
  "scripts": {
    "start:dev": "NODE_ENV=development nest start --watch",
    "start:prod": "NODE_ENV=production node dist/main"
  }
}
```

---

## 🚨 Important Rules

### ✅ **DO:**
- Commit `.env*.example` files
- Keep `.example` files updated when adding new variables
- Share secrets via secure channels (1Password, team docs)
- Use different secrets for dev vs production

### ❌ **DON'T:**
- Commit `.env`, `.env.development`, or `.env.production`
- Put real secrets in `.example` files
- Share secrets via Slack/email
- Use production secrets in development

---

## 🔒 Security Checklist

- [ ] `.env*` files are in `.gitignore` (except `.example`)
- [ ] Different JWT secrets for dev vs prod
- [ ] Test Stripe keys in dev, live keys in prod
- [ ] Production secrets stored in cloud provider (AWS, Vercel, etc.)
- [ ] Secrets rotated regularly

---

## 🆘 Troubleshooting

**Problem:** "MONGO_URI is undefined"
- **Solution:** Make sure you copied `.env.development.example` to `.env.development`

**Problem:** "Can't connect to RabbitMQ"
- **Solution:** Run `docker compose up -d rabbitmq mongo` first

**Problem:** "Which .env file is being used?"
- **Solution:** Check `NODE_ENV` environment variable

---

## 📚 Further Reading

- [12 Factor App - Config](https://12factor.net/config)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
