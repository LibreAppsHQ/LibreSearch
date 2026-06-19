# Self-Hosting LibreSearch

LibreSearch runs anywhere Node.js or Docker runs. The only hard requirements
are a search backend — either your own
[Brave Search API key](https://brave.com/search/api/) (free tier available) or
an upstream LibreSearch instance (see below) — and an `ALTCHA_SECRET` for
anti-abuse challenges. Everything else —
AI answers, accounts, stocks, analytics, Sentry — is optional and silently
disabled when unconfigured. A self-hosted instance sends no telemetry.

## One-line install (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/LibreAppsHQ/LibreSearch/main/scripts/install.sh | sh
```

Checks for Docker, downloads the compose file, generates secrets, asks which
search backend to use, and starts everything at http://localhost:3000.
Auto-updates are on by default (see below).

## Docker (manual)

```bash
cp .env.example .env
# edit .env: set BRAVE_SEARCH_API_KEY and ALTCHA_SECRET (openssl rand -hex 32)
docker compose up -d --build
```

The app listens on http://localhost:3000. The compose file bundles Redis
behind an Upstash-compatible HTTP proxy for rate limiting and search caching;
comment out the Redis env vars in `docker-compose.yml` to run fully in-memory.

## Automatic updates

The compose file ships with [Watchtower](https://containrrr.dev/watchtower/):
it checks daily for a new `ghcr.io/arcbasehq/libresearch:latest` image (built
automatically on every release) and restarts the app with your existing
config. Nothing to do — updates just happen.

Prefer manual control? Delete the `watchtower` service and run:

```bash
docker compose pull && docker compose up -d
```

To pin a version, change the image tag (e.g. `:0.9`) — Watchtower then only
follows patch updates within that tag.

## Bare Node

```bash
pnpm install
ADAPTER=node pnpm build
node build
```

Set env vars from `.env.example` in your process manager. `ADAPTER=node`
selects `@sveltejs/adapter-node` instead of the Vercel adapter.

## Reverse proxy

Run behind nginx/Caddy/Traefik for TLS. For correct per-client rate limiting,
tell the server which header carries the real client IP:

```
ADDRESS_HEADER=x-forwarded-for
XFF_DEPTH=1   # number of trusted proxies in front of the app
PROTOCOL_HEADER=x-forwarded-proto
HOST_HEADER=x-forwarded-host
```

For bare Node without a proxy, set `ORIGIN` instead (e.g.
`ORIGIN=http://192.168.0.181:3000`) — otherwise the server assumes https and
sends HSTS/upgrade-insecure-requests, which breaks styling over plain http.

The Docker image sets these by default. Only enable them when a proxy you
control sets the header, otherwise clients can spoof their IP.

## Upstream search (no Brave key needed)

Instead of getting your own Brave key, your instance can search through
another LibreSearch instance's upstream proxy:

```
UPSTREAM_SEARCH_URL=https://libresearch.ca
UPSTREAM_SEARCH_TOKEN=<token issued by that instance's operator>
```

When `BRAVE_SEARCH_API_KEY` is unset and these are present, all search tabs
(web/news/videos/images) route through the upstream; maps still go directly to
Nominatim. The upstream operator's key is never exposed to you or your users.

To _offer_ upstream access from your own instance, set
`UPSTREAM_SEARCH_TOKENS` to a comma-separated list of tokens
(`openssl rand -hex 24` each) and hand them out. Each token is rate limited
independently, and queries are cached server-side to conserve your Brave
quota. Leave it blank to keep `/api/upstream/search` disabled (404).

## Optional features

| Feature        | Env vars                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| AI answers     | `GROQ_API_KEY` (+ `GROQ_MODEL`)                                                                           |
| Stock widgets  | `FINNHUB_API_KEY`                                                                                         |
| Contact forms  | `PUBLIC_WEB3FORMS_KEY`                                                                                    |
| Accounts       | `PUBLIC_APPWRITE_ENDPOINT`, `PUBLIC_APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` (self-hosted Appwrite works) |
| Error tracking | `PUBLIC_SENTRY_DSN` (unset = zero telemetry)                                                              |
| Redis          | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                                                      |
