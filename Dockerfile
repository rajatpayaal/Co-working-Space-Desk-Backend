# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy configuration files and source code
COPY tsconfig.json ./
COPY eslint.config.mjs ./
COPY .prettierrc ./
COPY src ./src

# Build TypeScript code and generate Prisma client
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package files and install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy built artifacts and Prisma generated client from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5000

USER node

CMD ["node", "dist/index.js"]
