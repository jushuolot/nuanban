#!/usr/bin/env bash
# 不删数据，只重置超级管理员密码
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

EMAIL="${NUANBAN_ADMIN_EMAIL:-admin@nuanban.dev}"
PASS="${NUANBAN_ADMIN_PASS:-Nuanban2025!}"

docker compose down pocketbase 2>/dev/null || true

echo "重置管理员: $EMAIL"
docker compose run --rm --entrypoint /pb/pocketbase pocketbase \
  superuser upsert "$EMAIL" "$PASS" --dir=/pb_data

docker compose up -d pocketbase
sleep 2

echo "完成。请用无痕窗口打开: http://localhost:8090/_/#/login"
echo "  邮箱: $EMAIL"
echo "  密码: $PASS"
