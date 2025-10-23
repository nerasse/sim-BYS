# Dockerfile pour sim-BYS
FROM node:20-alpine AS base

# Installation des dépendances nécessaires pour better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
FROM base AS deps
RUN npm ci --include=dev

# Build application
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the app
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R node:node /app/data

# Use non-root user
USER node

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

