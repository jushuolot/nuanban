# 故障排查

## `npm install` 报 EPERM / Operation not permitted

若在路径 `.../empty-window/nuanban` 下无法创建 `node_modules`，多为 **目录权限或 Cursor 沙箱** 限制。

**建议：**

1. 复制到可写目录：`cp -R <repo> ~/Projects/nuanban`
2. macOS 清除扩展属性：`xattr -cr ~/Projects/nuanban`
3. 在系统终端（非 Agent 沙箱）执行安装

根目录 **不要** `npm install`（无 workspaces）；分别在 `packages/miniapp` 内安装。

## PocketBase 无法启动

```bash
docker compose logs pocketbase
curl -s http://localhost:8090/api/health
```

- 端口 8090 被占用：修改 `docker-compose.yml` 端口映射
- `PB_ENCRYPTION_KEY` 变更后旧数据无法解密：恢复备份或使用新 `pb_data` 目录

## 客户端连不上 API

- `packages/miniapp/.env` 应为 `VITE_API_BASE_URL=http://localhost:8090/api`（**无** `/v1`）
- 微信开发者工具：开发阶段可勾选「不校验合法域名」；真机需 HTTPS 备案域名
- H5 跨域：通过 Caddy 同域反代 `/api`，或 PB 配置 CORS

## 集合 403 / 空数据

- 确认已在 Admin 导入 `pb_schema.json`
- 确认请求带 `Authorization: Bearer`
- V1 权限较粗，细粒度规则需 Hooks；测试数据可在 Admin 手工录入

## 小程序

- **推荐 [HBuilderX](https://www.dcloud.io/hbuilderx.html)** 打开 `packages/miniapp`
- CLI：`cd packages/miniapp && npm install && npm run dev:mp-weixin`

## 历史栈（NestJS + PostgreSQL）

若仍在使用 `packages/api`，需 `DATABASE_URL` 并执行 `database/schema.sql`。**V1 新部署请改用 PocketBase**，见 [DEPLOY.md](./DEPLOY.md)。
