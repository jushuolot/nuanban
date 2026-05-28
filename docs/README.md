# 暖伴勤工 · 文档中心

## 核心产品资料（请先读）

| 文档 | 说明 |
|------|------|
| **[PRODUCT.md](./PRODUCT.md)** | **产品资料主文档**：定位、规则、V1 实现状态、二期路线 |
| [API.md](./API.md) | `/api/nuanban/*` 自定义接口 + PB REST |
| [LOGIN_STATE.md](./LOGIN_STATE.md) | 登录、多角色、开发账号 |
| [MINIAPP_ROUTING.md](./MINIAPP_ROUTING.md) | 分包与页面（以 `pages.json` 为准） |

## 技术与运维

| 文档 | 说明 |
|------|------|
| [TECH_STACK_SIMPLE.md](./TECH_STACK_SIMPLE.md) | 极简栈、成本、仓库对照 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 架构图与模块 |
| [DEPLOY.md](./DEPLOY.md) | Docker Compose 部署 |
| [PB_IMPORT.md](./PB_IMPORT.md) | Schema 分步导入 |
| [PB_ADMIN_LOGIN.md](./PB_ADMIN_LOGIN.md) | 后台登录失败 |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 常见问题 |

## 完整手册（打印 / PDF）

| 文件 | 说明 |
|------|------|
| [暖伴勤工-完整文档手册.md](./暖伴勤工-完整文档手册.md) | 合并版（由脚本生成） |
| [暖伴勤工-完整文档手册.pdf](./暖伴勤工-完整文档手册.pdf) | PDF（同上） |

```bash
cd ~/Projects/nuanban
node scripts/build-docs-pdf.mjs
```

依赖：`pip3 install --user fpdf2`（首次生成 PDF）

## 代码内文档

| 路径 | 说明 |
|------|------|
| [../README.md](../README.md) | 仓库快速开始 |
| [../packages/pocketbase/COLLECTIONS.md](../packages/pocketbase/COLLECTIONS.md) | 集合字段 |
| [../packages/pocketbase/SEED.md](../packages/pocketbase/SEED.md) | 演示数据 |

## 阅读顺序（新人）

1. [PRODUCT.md](./PRODUCT.md) §1～§5（业务规则）→ §11（V1 验收）  
2. [../README.md](../README.md) 启动 Docker + seed + 小程序  
3. [DEPLOY.md](./DEPLOY.md) / [PB_IMPORT.md](./PB_IMPORT.md) 上线前
