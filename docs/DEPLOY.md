# 暖伴勤工 · Docker Compose 部署指南

本文档描述 **V1 推荐栈**：PocketBase +（可选）Caddy 反代 H5。约 15 分钟可在单机完成自托管。

## 前置条件

| 项 | 要求 |
|----|------|
| 服务器 | Linux（推荐 Ubuntu 22.04+），1 核 1G 起 |
| 软件 | Docker 24+、Docker Compose v2 |
| 域名（生产） | 已备案，解析到服务器（小程序需 HTTPS API） |
| 本地开发 | macOS / Windows + Docker Desktop 亦可 |

## 目录与数据持久化

```
nuanban/
├── docker-compose.yml
├── Caddyfile                    # full profile 时使用
└── packages/pocketbase/
    ├── pb_data/                 # SQLite + 上传文件（勿删）
    ├── pb_public/               # 可选静态资源
    └── pb_schema.json           # 集合导入
```

`pb_data` 已在 `.gitignore`，**备份 = 定期打包 `pb_data` 目录**。

---

## 一、仅启动 PocketBase（开发 / 最小生产）

### 1. 克隆与进入目录

```bash
git clone <your-repo-url> nuanban
cd nuanban
```

### 2. 配置加密密钥（生产必做）

```bash
export PB_ENCRYPTION_KEY="$(openssl rand -hex 16)"
# 写入 .env 供 compose 读取（勿提交 git）
echo "PB_ENCRYPTION_KEY=${PB_ENCRYPTION_KEY}" > .env
```

`PB_ENCRYPTION_KEY` 至少 32 字符；生产禁止使用 `docker-compose.yml` 中的默认值。

### 3. 启动

```bash
docker compose up -d pocketbase
docker compose ps
docker compose logs -f pocketbase
```

### 4. 健康检查

```bash
curl -s http://localhost:8090/api/health
```

浏览器打开管理后台：**http://localhost:8090/_/**

首次访问创建超级管理员账号。

### 5. 导入数据模型

1. 登录 Admin → **Settings** → **Import collections**
2. 选择 `packages/pocketbase/pb_schema.json`
3. 或对照 `packages/pocketbase/COLLECTIONS.md` 手工建表

### 6. 客户端指向 API

`packages/miniapp/.env`：

```env
VITE_API_BASE_URL=http://localhost:8090/api
```

微信小程序正式环境须使用 **HTTPS 域名**（见下文生产）。

---

## 二、PocketBase + Caddy（H5 静态 + API 反代）

适用于：同一域名提供 H5 页面，并将 `/api/*` 转发到 PocketBase。

### 1. 构建 H5

```bash
cd packages/miniapp
cp .env.example .env
# 生产将 VITE_API_BASE_URL 设为 https://你的域名/api
npm install
npm run build:h5
```

产物目录：`packages/miniapp/dist/build/h5`（需与 `docker-compose.yml` 中 Caddy 挂载路径一致）。

### 2. 修改 Caddyfile（生产）

将 `Caddyfile` 首行 `:80` 改为你的域名，例如：

```caddyfile
api.example.com {
    handle /api/* {
        reverse_proxy pocketbase:8090
    }
    handle {
        root * /srv/h5
        try_files {path} /index.html
        file_server
    }
}
```

Caddy 会自动申请 Let’s Encrypt 证书（需 80/443 可从公网访问）。

### 3. 启动 full profile

```bash
docker compose --profile full up -d
```

服务：

| 容器 | 端口 | 说明 |
|------|------|------|
| `nuanban-pocketbase` | 8090 | API + Admin `/_/` |
| `nuanban-caddy` | 80, 443 | H5 + 反代 |

仅本机调试 Caddy 时可访问 `http://localhost`（H5）与 `http://localhost/api`（API）。

---

## 三、生产检查清单

- [ ] 已更换 `PB_ENCRYPTION_KEY` 并保存在密钥管理（非仓库）
- [ ] Admin 使用强密码；禁用或删除测试账号
- [ ] 仅通过 HTTPS 暴露（Caddy 或云负载均衡终止 TLS）
- [ ] 防火墙：公网仅开放 80/443；**不要**将 8090 直接暴露公网（经反代访问）
- [ ] 定期备份 `packages/pocketbase/pb_data`
- [ ] 微信小程序后台配置 request 合法域名 = API 域名
- [ ] `VITE_API_BASE_URL` 与线上域名一致后重新 `build:h5` / 上传小程序

---

## 四、常用运维命令

```bash
# 查看日志
docker compose logs -f pocketbase

# 重启
docker compose restart pocketbase

# 停止
docker compose down

# 升级 PocketBase 镜像
docker compose pull pocketbase
docker compose up -d pocketbase
```

---

## 五、故障排查

| 现象 | 处理 |
|------|------|
| `8090` 无法访问 | `docker compose ps` 确认容器 Up；检查端口占用 |
| healthcheck 失败 | 容器内 `wget` 探测；查看 `logs` 是否迁移错误 |
| H5 白屏 | 确认已 `build:h5` 且 `dist/build/h5` 已挂载到 Caddy |
| API 404 | 客户端 URL 应为 `.../api` 而非 `/api/v1` |
| 小程序域名校验失败 | 微信后台添加 HTTPS 域名；开发工具可勾选不校验 |

更多开发环境问题见 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)。

---

## 六、与旧栈的关系

仓库中 `packages/api`（NestJS）、`packages/admin-web`、`database/*.sql` 为 **历史参考**，V1 部署不再依赖 PostgreSQL。新业务以 PocketBase 集合为准，见 [TECH_STACK_SIMPLE.md](./TECH_STACK_SIMPLE.md)。
