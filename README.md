# 暖伴勤工

连接福利院老人、家属与高校勤工学生的一站式服务平台（**单微信小程序 + H5** + **PocketBase 管理后台**）。

## 技术栈（V1）

| 组件 | 说明 |
|------|------|
| `packages/miniapp` | uni-app Vue3：老人 / 家属 / 学生 |
| `packages/pocketbase` | 后端 + Admin UI（SQLite） |
| `docker-compose.yml` | 一键部署 PocketBase（可选 Caddy + H5） |

> 仓库中的 `packages/api`、`packages/admin-web`、`database/` 为历史参考，新环境请按极简栈部署。

## 快速开始

### 1. 启动后端

```bash
# 生产请先设置 PB_ENCRYPTION_KEY，见 docs/DEPLOY.md
docker compose up -d pocketbase
```

- API：`http://localhost:8090/api`
- Admin：`http://localhost:8090/_/`
- 导入集合：`packages/pocketbase/pb_schema.json`（须勾选 **Merge**）
- 一键演示数据：`./scripts/seed-demo.sh`

### 2. 客户端

```bash
cd packages/miniapp
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8090/api
npm install
npm run dev:mp-weixin  # 或 dev:h5
```

推荐 HBuilderX 打开 `packages/miniapp`（见该目录 README）。

### 3. 生产（H5 + HTTPS）

```bash
cd packages/miniapp && npm run build:h5
docker compose --profile full up -d
```

详见 **[docs/DEPLOY.md](docs/DEPLOY.md)**。

### 后台登不上？

见 **[docs/PB_ADMIN_LOGIN.md](docs/PB_ADMIN_LOGIN.md)**，或执行：

```bash
./scripts/pb-reset-admin.sh
```

## 核心能力

- 服务按 SKU 分类定价
- 家属支付、平台结算（V1 字段预留）
- 管理员派单 + 老人/学生双向就近匹配
- 院校合作与指定老人（**非按校租户**）
- 管理端导出（无监督端）

## 文档

**完整手册（Markdown + PDF）**：运行 `node scripts/build-docs-pdf.mjs` 后查看  
`docs/暖伴勤工-完整文档手册.pdf`

| 文档 | 说明 |
|------|------|
| [docs/README.md](docs/README.md) | **文档索引** |
| [docs/PRODUCT.md](docs/PRODUCT.md) | **产品资料**（规则 + V1 实现状态） |
| [docs/TECH_STACK_SIMPLE.md](docs/TECH_STACK_SIMPLE.md) | 极简栈与成本 |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Docker Compose 部署 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 系统架构 |
| [docs/API.md](docs/API.md) | PocketBase API |
| [docs/LOGIN_STATE.md](docs/LOGIN_STATE.md) | 登录与多角色 |
| [docs/MINIAPP_ROUTING.md](docs/MINIAPP_ROUTING.md) | 小程序路由 |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | 故障排查 |

## License

Private / 项目内部使用
