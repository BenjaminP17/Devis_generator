FROM node:20-alpine AS base
WORKDIR /app

# ─────────────────────────────────────────
# Development stage (Vite HMR)
# ─────────────────────────────────────────
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ─────────────────────────────────────────
# Production stage (static build)
# ─────────────────────────────────────────
FROM base AS production
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Serve with a lightweight static server
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
