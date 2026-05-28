# PocketBase 后端（暖伴勤工）

单二进制后端：认证、REST、文件、管理后台。替代原 `packages/api` + PostgreSQL。

## 集合导入

1. 启动 PocketBase（见根目录 `docker compose up -d pocketbase`）。
2. 打开 **Settings → Import collections**，选择本目录 `pb_schema.json`。
3. 或在 Admin 中对照 `COLLECTIONS.md` 手工建表。

## 数据目录

- 生产数据：`pb_data/`（已在 `.gitignore`，勿提交）
- 迁移（可选）：`pb_migrations/`

## 环境变量（docker-compose 已示例）

| 变量 | 说明 |
|------|------|
| `PB_ENCRYPTION_KEY` | 32 字节密钥，生产必改 |
| `PB_ADMIN_EMAIL` / `PB_ADMIN_PASSWORD` | 首次初始化超管（可选） |

## API 前缀

- REST：`http://localhost:8090/api/collections/<name>/records`
- 实时：`/api/realtime`
- Admin UI：`http://localhost:8090/_/`

客户端 `VITE_API_BASE_URL` 建议设为 `http://localhost:8090/api`（不要带 `/v1`）。

## Hooks（V1 基础桩）

`pb_hooks/nuanban.pb.js` 提供：

- 微信 `code` 开发态用户（`wx_*@nuanban.dev`）
- 老人下单、学生接单/拒单、家属支付与外出审批
- 附近学生 Haversine 列表

Docker 已挂载 `--hooksDir=/pb_hooks`。演示数据见 **SEED.md**。

## 与旧 SQL 的关系

`database/schema.sql` 保留作字段参考；以本目录 PocketBase 集合为准。
