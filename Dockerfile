# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

# Install deps first (better cache)
# --config.dangerously-allow-all-builds=true bypasses pnpm 10's build-script gate
# for the Docker build environment where we control the deps completely.
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --config.dangerously-allow-all-builds=true \
    || pnpm install --config.dangerously-allow-all-builds=true

# Copy source and build
COPY . .
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_APP_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_APP_URL=$VITE_APP_URL
RUN pnpm build

# Runtime: nginx + basic auth
FROM nginx:1.27-alpine
RUN apk add --no-cache apache2-utils
COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
