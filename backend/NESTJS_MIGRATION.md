# EcoMart Backend - NestJS Migration Complete! 🎉

This backend has been successfully converted from Express.js to NestJS with TypeScript.

## What Changed

### Project Structure
```
backend/
├── src/
│   ├── main.ts                    # NestJS entry point
│   ├── app.module.ts              # Root module
│   ├── worker.ts                  # Email worker
│   ├── schemas/                   # Mongoose schemas with decorators
│   │   ├── user.schema.ts
│   │   ├── product.schema.ts
│   │   ├── cart.schema.ts
│   │   ├── order.schema.ts
│   │   └── payment.schema.ts
│   ├── auth/                      # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── dto/
│   ├── product/                   # Product module
│   ├── cart/                      # Cart module
│   ├── order/                     # Order module
│   ├── payment/                   # Payment module with Stripe
│   ├── email/                     # Email module with RabbitMQ
│   ├── user/                      # User management module
│   └── guards/                    # Custom guards
│       └── admin.guard.ts
├── nest-cli.json
├── tsconfig.json
└── package.json
```

## Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Ensure your `.env` file is in the parent directory:**
```
MONGO_URI=mongodb://localhost:27017/ecomart
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
NODE_ENV=development
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Build
```bash
npm run build
npm run start:prod
```

### Email Worker
In a separate terminal:
```bash
npx ts-node src/worker.ts
```

## Key Features

### TypeScript
- Full TypeScript support with type safety
- Interfaces and DTOs for all requests/responses
- Better IDE autocomplete and error detection

### Dependency Injection
- Services are automatically injected
- Better testability and modularity

### Decorators
- `@Controller()` for route handlers
- `@UseGuards()` for authentication/authorization
- `@Body()`, `@Param()`, `@Query()` for request data
- `@Injectable()` for services

### Validation
- Automatic request validation with `class-validator`
- DTOs define the shape and validation rules
- Returns clear validation errors

### Module System
- Each feature has its own module
- Clear separation of concerns
- Easy to scale and maintain

## API Routes (same as before)

All routes remain the same:
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/products` - Get all products
- `POST /api/cart` - Add to cart
- `POST /api/orders` - Create order
- `POST /api/payment/create-intent` - Create payment intent
- And all other existing routes...

## Differences from Express

### Before (Express):
```javascript
export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};
```

### After (NestJS):
```typescript
@Get()
async getProducts(@Query() queryDto: QueryProductDto) {
  return this.productService.getProducts(queryDto);
}
```

### Benefits:
- ✅ Automatic validation
- ✅ Type safety
- ✅ Better error handling
- ✅ Cleaner code structure
- ✅ Built-in dependency injection
- ✅ More testable

## Authentication

JWT authentication works exactly the same way. Use the `Bearer` token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## Admin Routes

Admin-only routes are protected with `@UseGuards(JwtAuthGuard, AdminGuard)`.

## Stripe Webhooks

The webhook endpoint at `/api/payment/webhook` uses raw body parsing and is configured in `main.ts`.

## RabbitMQ

The email queue system remains functional. Start the worker with:
```bash
npx ts-node src/worker.ts
```

## Testing

You can test the API the same way as before. All endpoints and functionality remain identical.

## Troubleshooting

### Port Already in Use
```bash
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Issues
Make sure MongoDB is running:
```bash
mongosh
```

### RabbitMQ Not Connected
Ensure RabbitMQ is running:
```bash
brew services start rabbitmq
```

## Next Steps

1. Add unit tests with Jest
2. Add e2e tests
3. Add Swagger documentation with `@nestjs/swagger`
4. Add rate limiting
5. Add caching with Redis

---

**Your Express backend is now a modern NestJS application!** 🚀
