#!/usr/bin/env bash
# 清空 pb_data 后全新启动（会删除本地所有 PocketBase 数据）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BACKUP="packages/pocketbase/pb_data.bak.$(date +%Y%m%d_%H%M%S)"

echo "警告: 将备份并清空 pb_data，所有本地数据会重置。"
read -r -p "继续? [y/N] " ans
[[ "${ans:-}" =~ ^[yY]$ ]] || exit 0

docker compose down --remove-orphans 2>/dev/null || true

if [[ -d packages/pocketbase/pb_data ]]; then
  mv packages/pocketbase/pb_data "$BACKUP"
  echo "已备份到: $BACKUP"
fi
mkdir -p packages/pocketbase/pb_data

# 固定开发用加密密钥，避免 .env 每次变化导致无法解密
cat > .env <<'EOF'
PB_ENCRYPTION_KEY=nuanban-local-dev-key-32chars!!
EOF
echo "已写入固定 .env"

docker compose build pocketbase

EMAIL="${NUANBAN_ADMIN_EMAIL:-admin@nuanban.dev}"
PASS="${NUANBAN_ADMIN_PASS:-Nuanban2025!}"

echo "创建超级管理员（服务未启动时写入数据库）..."
docker compose run --rm --entrypoint /pb/pocketbase pocketbase \
  superuser upsert "$EMAIL" "$PASS" --dir=/pb_data

echo "启动 PocketBase..."
docker compose up -d pocketbase
sleep 3

echo ""
echo "验证 health:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8090/api/health --max-redirs 0 || true

echo ""
echo "全新环境已就绪。"
echo "  后台: http://localhost:8090/_/#/login"
echo "  邮箱: $EMAIL"
echo "  密码: $PASS"
echo "  下一步: Admin -> Settings -> Import collections -> pb_schema.json"
