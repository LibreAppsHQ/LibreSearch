#!/usr/bin/env sh
# LibreSearch self-host installer.
#
#   curl -fsSL https://raw.githubusercontent.com/Arcbasehq/LibreSearch/main/scripts/install.sh | sh
#
# Creates ./libresearch with docker-compose.yml + .env, generates secrets,
# asks for a search backend, and starts the stack.

set -eu

REPO_RAW="https://raw.githubusercontent.com/Arcbasehq/LibreSearch/main"
DIR="${LIBRESEARCH_DIR:-libresearch}"

say()  { printf '\033[1;36m[libresearch]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[libresearch]\033[0m %s\n' "$*" >&2; exit 1; }

# ---- prerequisites ----
command -v docker >/dev/null 2>&1 || fail "Docker is required. Install it first: https://docs.docker.com/engine/install/"
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required (docker compose). Update Docker."
command -v curl >/dev/null 2>&1 || fail "curl is required."

if [ -e "$DIR/.env" ]; then
	fail "$DIR/.env already exists — refusing to overwrite. To update instead: cd $DIR && docker compose pull && docker compose up -d"
fi

mkdir -p "$DIR"
cd "$DIR"

say "Downloading compose file and env template..."
curl -fsSL "$REPO_RAW/docker-compose.yml" -o docker-compose.yml
curl -fsSL "$REPO_RAW/.env.example" -o .env

# ---- secrets ----
gen_hex() {
	if command -v openssl >/dev/null 2>&1; then
		openssl rand -hex "$1"
	else
		head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'
	fi
}

ALTCHA="$(gen_hex 32)"
REDIS_TOKEN="$(gen_hex 24)"
# Portable in-place sed (GNU + BSD).
sed "s/^ALTCHA_SECRET=.*/ALTCHA_SECRET=$ALTCHA/; s/^REDIS_HTTP_TOKEN=.*/REDIS_HTTP_TOKEN=$REDIS_TOKEN/" .env > .env.tmp && mv .env.tmp .env
say "Generated ALTCHA_SECRET and Redis token."

# ---- search backend ----
# Reads from the terminal even when piped through `curl | sh`.
TTY_IN=/dev/tty
[ -r "$TTY_IN" ] || TTY_IN=/dev/null

printf '\nSearch backend — pick one:\n'
printf '  1) Own Brave Search API key (free tier: https://brave.com/search/api/)\n'
printf '  2) Upstream LibreSearch instance (token from its operator)\n'
printf '  3) Skip — configure later in %s/.env\n' "$DIR"
printf 'Choice [1/2/3]: '
read -r choice < "$TTY_IN" || choice=3

case "${choice:-3}" in
	1)
		printf 'Brave API key: '
		read -r key < "$TTY_IN"
		sed "s|^BRAVE_SEARCH_API_KEY=.*|BRAVE_SEARCH_API_KEY=$key|" .env > .env.tmp && mv .env.tmp .env
		;;
	2)
		printf 'Upstream URL [https://libresearch.ca]: '
		read -r url < "$TTY_IN"
		url="${url:-https://libresearch.ca}"
		printf 'Upstream token: '
		read -r token < "$TTY_IN"
		sed "s|^UPSTREAM_SEARCH_URL=.*|UPSTREAM_SEARCH_URL=$url|; s|^UPSTREAM_SEARCH_TOKEN=.*|UPSTREAM_SEARCH_TOKEN=$token|" .env > .env.tmp && mv .env.tmp .env
		;;
	*)
		say "Skipping — search will show 'not configured' until you edit .env."
		;;
esac

# ---- start ----
say "Starting LibreSearch..."
docker compose up -d

say ""
say "Done. LibreSearch is running at http://localhost:3000"
say "Config:   $PWD/.env"
say "Update:   automatic (Watchtower), or: docker compose pull && docker compose up -d"
say "Logs:     docker compose logs -f libresearch"
