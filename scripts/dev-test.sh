#!/usr/bin/env bash
# 本地联调：启动 PocketBase + 写入演示数据
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> 1/3 启动 PocketBase (docker compose)"
if docker ps -a --format '{{.Names}}' | grep -qx 'nuanban-pocketbase'; then
  docker start nuanban-pocketbase 2>/dev/null || true
  docker compose up -d pocketbase 2>/dev/null || echo "    使用已有容器 nuanban-pocketbase"
else
  docker compose up -d pocketbase
fi

echo "==> 2/3 等待 API 就绪"
BASE="${NUANBAN_API:-http://localhost:8090}"
for i in $(seq 1 30); do
  if curl -sf "$BASE/api/health" >/dev/null 2>&1; then
    echo "    API OK: $BASE/api/health"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "超时：请执行 docker compose logs pocketbase"
    exit 1
  fi
  sleep 1
done

echo "==> 3/3 写入演示数据"
"$ROOT/scripts/seed-demo.sh"

echo ""
echo "=========================================="
echo " 后端已就绪"
echo "   API:   $BASE/api"
echo "   Admin: $BASE/_/"
echo ""
echo " 下一步（新开终端）："
echo "   cd packages/miniapp"
echo "   cp .env.example .env && npm install && npm run dev:h5"
echo "   浏览器打开 http://localhost:5174"
echo "   点击「开发账号登录（学生）」"
echo "=========================================="
echo "详细说明: docs/LOCAL_TEST.md"
