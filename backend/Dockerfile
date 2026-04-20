FROM node:20-alpine AS base
WORKDIR /app

# ─────────────────────────────────────────
# Development stage (hot reload via nodemon)
# ─────────────────────────────────────────
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# ─────────────────────────────────────────
# Production stage (compiled JS)
# ─────────────────────────────────────────
FROM base AS production
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/server.js"]
