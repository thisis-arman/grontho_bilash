#!/usr/bin/env bash
# Copies the variables in gb-server/.env to the Vercel project linked in
# .vercel/ (Production; preview sites use the production API through
# /api-proxy, so they need no copy). PORT is skipped and NODE_ENV is set to
# "production". Run it yourself from gb-server:  bash scripts/push-env.sh
set -e
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "No .env file in gb-server"; exit 1; }

while IFS= read -r line || [ -n "$line" ]; do
  line="${line%$'\r'}"
  case "$line" in ''|\#*) continue ;; esac
  name="${line%%=*}"
  value="${line#*=}"
  value="${value%\"}"; value="${value#\"}"
  [ "$name" = "PORT" ] && continue
  [ "$name" = "NODE_ENV" ] && value="production"
  for target in production; do
    vercel env rm "$name" "$target" --yes >/dev/null 2>&1 || true
    printf '%s' "$value" | vercel env add "$name" "$target" >/dev/null 2>&1 \
      && echo "added $name ($target)" || echo "FAILED $name ($target)"
  done
done < .env
