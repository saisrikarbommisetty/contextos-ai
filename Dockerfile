# Multi-stage Dockerfile for ContextOS Platform

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN node ./node_modules/typescript/bin/tsc && node ./node_modules/vite/bin/vite.js build

# Stage 2: Build Backend & Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci

# Copy backend source & schema
COPY backend/ ./
RUN node ./node_modules/prisma/build/index.js generate
RUN node ./node_modules/typescript/bin/tsc

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./dev.db"

# Expose server port
EXPOSE 5000

# Push DB schema, seed if needed, and start server
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js db push && node ./node_modules/ts-node/dist/bin.js prisma/seed.ts && node dist/server.js"]
