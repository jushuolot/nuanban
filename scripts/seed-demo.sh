#!/usr/bin/env bash
# 一键写入演示数据（需 PocketBase 已启动）
set -euo pipefail

BASE="${NUANBAN_API:-http://localhost:8090}"
KEY="${NUANBAN_SEED_KEY:-nuanban_dev_seed}"

echo "正在写入演示数据 -> $BASE"
curl -sS -X POST "$BASE/api/nuanban/seed-demo?key=$KEY" | node -e "
let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
  try { console.log(JSON.stringify(JSON.parse(d), null, 2)); }
  catch { console.log(d); }
});"

echo ""
echo "完成。小程序开发登录密码: nuanban_dev_2025"
echo "示例学生: student1@test.nuanban.dev"
