# -------- Base Image --------
FROM node:20-alpine AS base
WORKDIR /app

# -------- Dependencies --------
COPY package*.json ./
RUN npm ci --only=production

# -------- Build Stage --------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# -------- Runtime Stage --------
FROM node:20-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy only what we need
COPY --from=build /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY package.json ./

# Change ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Port configuration
ARG PORT=5000
ENV PORT=${PORT}
ENV NODE_ENV=production

EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get(`http://localhost:${process.env.PORT}/health`, r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/main.js"]

