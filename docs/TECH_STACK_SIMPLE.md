# 暖伴勤工 · 极简技术栈

**目标**：最低运维成本、最少组件、支持微信小程序 + H5，适合公益/试点项目快速上线。

完整部署步骤见 **[DEPLOY.md](./DEPLOY.md)**。

---

## 总览

| 层级 | 选型 | 说明 |
|------|------|------|
| 客户端 | **uni-app（Vue 3）** | 一套代码 → **微信小程序 + H5** |
| 后端 | **PocketBase** | 单 Go 进程：SQLite、Auth、REST、Realtime、文件、**内置 Admin** |
| 部署 | **Docker Compose** | `pocketbase` 必选；`caddy` 可选（反代 + H5 静态） |
| 管理端 | **PocketBase Admin** (`/_/`) | 不维护独立 Vue Admin |

**V1 不采用**：NestJS + PostgreSQL + Element Plus 独立后台（运维与月租更高）。

---

## 1. 客户端：uni-app Vue 3

**选型理由**

- 官方 `mp-weixin` + `h5` 双端，业务代码复用率高。
- 仓库 `packages/miniapp` 已按三角色分包，仅需配置 API 与 H5 构建。

**常用命令**

```bash
cd packages/miniapp
cp .env.example .env
npm install
npm run dev:mp-weixin    # 微信开发者工具
npm run dev:h5           # 浏览器 H5
npm run build:h5         # 产出 dist/build/h5 → Caddy 或静态托管
npm run build:mp-weixin
```

**环境变量**

```env
# PocketBase REST 根（不要 /v1）
VITE_API_BASE_URL=http://localhost:8090/api
```

**鉴权约定**

- `Authorization: Bearer <pocketbase_token>`
- 多角色：`user_roles` 集合 + 请求头 `X-Active-Role: elder|family|student`
- 复杂校验 → 二期 PocketBase Hooks

---

## 2. 后端：PocketBase

| 能力 | 说明 |
|------|------|
| 数据库 | 内嵌 **SQLite**（`pb_data/`，备份=目录拷贝） |
| API | `/api/collections/<name>/records` |
| 认证 | 内置 `users` 集合 |
| 管理 UI | `http://host:8090/_/` |
| 扩展 | `pb_hooks/`（Go/JS）支付、状态机、微信登录 |

**与 Supabase 自托管对比（简要）**

| 维度 | PocketBase | Supabase 自托管 |
|------|------------|-----------------|
| 进程 | 1 个二进制 | 多容器（PG、Kong、Auth…） |
| 内存 | 512MB～1GB 可跑 | 通常 2GB+ |
| 运维 | 拷 `pb_data` 即备份 | PG 备份与组件升级 |
| 适合本项目 | 关系表 + CRUD + Admin | 强 RLS、大规模分析 |

暖伴 V1 以 CRUD + 后台派单为主 → **选 PocketBase**。

---

## 3. 部署拓扑

```
  微信小程序 ──┐
  H5 浏览器 ──┼──► Caddy :443 ──► /api/* ──► PocketBase :8090
              │              └──► /      ──► H5 静态 (dist/build/h5)
              └──► 开发期可直连 :8090

  管理员浏览器 ──► PocketBase Admin /_/
```

**最小部署**（仅 API + Admin）：

```bash
docker compose up -d pocketbase
```

**完整部署**（API + H5 同域）：

```bash
npm run build:h5   # 在 packages/miniapp
docker compose --profile full up -d
```

---

## 4. 成本粗算（人民币 / 月）

| 项目 | 方案 | 约月费 |
|------|------|--------|
| 服务器 | 国内轻量 1核1G～2G | ¥24～60 |
| 域名 | 已备案 | ¥0～5（摊销） |
| SSL | Caddy + Let's Encrypt | ¥0 |
| 存储 | V1 本地 `pb_data` | ¥0～10 |
| H5 CDN（可选） | Cloudflare Pages 免费档 | ¥0 |
| **合计** | 自托管 V1 | **约 ¥30～80** |

对比 NestJS + PG + 独立 Admin（常需 2C4G）：约 **¥150+/月** 且维护成本高。

---

## 5. 仓库对应关系

| 路径 | V1 状态 |
|------|---------|
| `packages/miniapp` | **使用** — 主客户端 |
| `packages/pocketbase` | **使用** — schema、pb_data、文档 |
| `docker-compose.yml` + `Caddyfile` | **使用** — 部署 |
| `packages/api` | 遗留 — NestJS，不部署 |
| `packages/admin-web` | 遗留 — 由 PB Admin 替代 |
| `database/*.sql` | 参考 — 字段对照，不执行 |

业务逻辑优先级：

1. V1：`pb_hooks/nuanban.pb.js`（下单/接单/支付 stub 等）+ 集合 REST + Admin 派单  
2. 二期：微信支付回调、订单完成态、学校合作过滤、行级权限

详见 [PRODUCT.md](./PRODUCT.md) §11。

---

## 6. 安全清单（生产）

- 更换 `PB_ENCRYPTION_KEY`（`openssl rand -hex 16`）
- Admin 强密码；HTTPS 仅暴露 443（8090 不直连公网）
- 定期备份 `packages/pocketbase/pb_data`
- 集合权限按角色收紧；敏感导出仅管理员
- 微信商户、小程序备案按属地要求办理

---

## 7. 三步上线

1. `docker compose up -d pocketbase`  
2. 打开 `http://<host>:8090/_/` → 创建管理员 → 导入 `pb_schema.json`  
3. `packages/miniapp` 配置 `VITE_API_BASE_URL` → 构建 H5 / 上传微信小程序  

细节：[DEPLOY.md](./DEPLOY.md) · 产品范围：[PRODUCT.md](./PRODUCT.md)
