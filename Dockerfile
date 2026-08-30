# syntax=docker/dockerfile:1
#
# Bee Archetypes runtime: single Node process serves both the Vite SPA
# static assets and the /api/agent/* endpoints via Hono. Replaces the
# nginx runtime we ran through Wave 7h.
#
# Wave 7i (2026-08-29): Agentic Counterpart chat surface goes live.

FROM node:22-alpine AS build
WORKDIR /app
# better-sqlite3 needs python3 + make + g++ for native compilation
RUN apk add --no-cache python3 make g++
RUN corepack enable

# --- deps ---
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --config.dangerously-allow-all-builds=true \
    || pnpm install --config.dangerously-allow-all-builds=true

# --- build client + server ---
COPY . .
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_APP_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_APP_URL=$VITE_APP_URL
RUN pnpm build              # -> dist/
RUN pnpm build:server       # -> dist-server/

# --- runtime ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV DIST_DIR=/app/dist
# better-sqlite3 native module needs python3/make/g++ at runtime install too
RUN apk add --no-cache python3 make g++
RUN corepack enable

# Only ship prod deps to the runtime image.
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --config.dangerously-allow-all-builds=true \
    || pnpm install --prod --config.dangerously-allow-all-builds=true

COPY --from=build /app/dist /app/dist
COPY --from=build /app/dist-server /app/dist-server

EXPOSE 8080
CMD ["node", "dist-server/index.js"]
