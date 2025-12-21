# 📁 NestJS Backend Directory Structure

```
backend/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   ├── worker.ts                        # Email worker
│   │
│   ├── schemas/                         # Mongoose schemas
│   │   ├── user.schema.ts
│   │   ├── product.schema.ts
│   │   ├── cart.schema.ts
│   │   ├── order.schema.ts
│   │   └── payment.schema.ts
│   │
│   ├── auth/                            # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts              # JWT Passport strategy
│   │   ├── jwt-auth.guard.ts            # JWT authentication guard
│   │   └── dto/
│   │       └── auth.dto.ts              # Register & Login DTOs
│   │
│   ├── product/                         # Product module
│   │   ├── product.module.ts
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   └── dto/
│   │       └── product.dto.ts           # Create, Update, Query DTOs
│   │
│   ├── cart/                            # Cart module
│   │   ├── cart.module.ts
│   │   ├── cart.controller.ts
│   │   ├── cart.service.ts
│   │   └── dto/
│   │       └── cart.dto.ts              # Cart operation DTOs
│   │
│   ├── order/                           # Order module
│   │   ├── order.module.ts
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   └── dto/
│   │       └── order.dto.ts             # Create order DTO
│   │
│   ├── payment/                         # Payment module
│   │   ├── payment.module.ts
│   │   ├── payment.controller.ts
│   │   ├── payment.service.ts
│   │   ├── stripe-webhook.service.ts    # Stripe webhook handler
│   │   └── dto/
│   │       └── payment.dto.ts           # Payment DTOs
│   │
│   ├── email/                           # Email module
│   │   ├── email.module.ts
│   │   ├── email.controller.ts
│   │   ├── email.service.ts             # Email sending service
│   │   ├── rabbitmq.service.ts          # RabbitMQ integration
│   │   └── dto/
│   │       └── email.dto.ts             # Email DTOs
│   │
│   ├── user/                            # User management module
│   │   ├── user.module.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── dto/
│   │       └── user.dto.ts              # User DTOs
│   │
│   └── guards/                          # Custom guards
│       └── admin.guard.ts               # Admin authorization guard
│
├── dist/                                # Compiled JavaScript (auto-generated)
│
├── node_modules/                        # Dependencies
│
├── nest-cli.json                        # NestJS CLI configuration
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Dependencies & scripts
├── .prettierrc                          # Code formatting config
├── .gitignore                           # Git ignore rules
│
├── QUICK_START.md                       # Quick start guide
├── NESTJS_MIGRATION.md                  # Migration documentation
├── CONVERSION_SUMMARY.md                # Detailed conversion summary
└── README.md                            # Original backend README

# OLD FILES (can be removed after testing):
├── server.js
├── app.js
├── models/
├── controllers/
├── routes/
├── middleware/
├── utils/
└── workers/
```

## 🎯 Module Pattern

Each module follows this structure:
```
module-name/
├── module-name.module.ts       # Module definition with imports/exports
├── module-name.controller.ts   # HTTP endpoints with decorators
├── module-name.service.ts      # Business logic
└── dto/
    └── module-name.dto.ts      # Data Transfer Objects with validation
```

## 🔄 Request Flow

```
Client Request
     ↓
Controller (@Controller decorator)
     ↓
Guard (@UseGuards - JWT/Admin)
     ↓
DTO Validation (class-validator)
     ↓
Service (Business Logic)
     ↓
Repository (Mongoose Model)
     ↓
Database (MongoDB)
     ↓
Response
```

## 📦 Key Files

| File | Purpose |
|------|---------|
| `main.ts` | Bootstrap application, configure middleware |
| `app.module.ts` | Import all feature modules |
| `*.schema.ts` | Mongoose models with decorators |
| `*.controller.ts` | Define API endpoints |
| `*.service.ts` | Business logic and database operations |
| `*.dto.ts` | Request/response validation |
| `*.guard.ts` | Authorization logic |
| `*.strategy.ts` | Authentication strategies |

## 🛠️ Configuration Files

| File | Purpose |
|------|---------|
| `nest-cli.json` | NestJS CLI settings |
| `tsconfig.json` | TypeScript compiler options |
| `package.json` | Dependencies and scripts |
| `.prettierrc` | Code formatting rules |
| `.gitignore` | Git ignore patterns |

## 📝 Scripts

```json
{
  "start": "nest start",              // Production start
  "start:dev": "nest start --watch",  // Development with hot reload
  "start:debug": "nest start --debug --watch",
  "build": "nest build",              // Compile TypeScript
  "start:prod": "node dist/main"      // Run compiled code
}
```

---

**This structure provides:**
- ✅ Clear separation of concerns
- ✅ Easy to navigate and understand
- ✅ Scalable architecture
- ✅ Testable components
- ✅ Type-safe codebase
