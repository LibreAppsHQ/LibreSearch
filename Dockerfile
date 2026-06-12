# ---- build stage ----
FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV ADAPTER=node
RUN pnpm build && pnpm prune --prod

# ---- runtime stage ----
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Run as non-root.
USER node

EXPOSE 3000
ENV PORT=3000
# Trust the reverse proxy's client-IP header (nginx/caddy/traefik set this).
ENV ADDRESS_HEADER=x-forwarded-for
ENV XFF_DEPTH=1
# Derive the request protocol from the proxy header so https-only headers
# (HSTS, upgrade-insecure-requests) are sent only over real https. Without
# this adapter-node assumes https even on plain-http LAN access.
ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host

CMD ["node", "build"]
