# 暖伴勤工 · 系统架构（V1 精简栈）

> 产品能力见 [PRODUCT.md](./PRODUCT.md)；选型与成本见 [TECH_STACK_SIMPLE.md](./TECH_STACK_SIMPLE.md)；部署见 [DEPLOY.md](./DEPLOY.md)。

## 逻辑架构

```mermaid
flowchart LR
  subgraph clients [客户端]
    MP[微信小程序]
    H5[H5 浏览器]
  end
  subgraph edge [可选边缘]
    Caddy[Caddy 443]
  end
  subgraph backend [后端]
    PB[PocketBase]
    SQLite[(SQLite pb_data)]
  end
  subgraph admin [管理]
    PBA[PocketBase Admin /_/]
  end
  MP --> Caddy
  H5 --> Caddy
  Caddy -->|/api/*| PB
  Caddy -->|/| 静态 H5|
  MP -.->|开发直连| PB
  PBA --> PB
  PB --> SQLite
```

## 仓库模块

| 路径 | 状态 | 职责 |
|------|------|------|
| `packages/miniapp` | **主客户端** | uni-app：老人 / 家属 / 学生三分包 + 公共登录 |
| `packages/pocketbase` | **主后端** | Schema、数据目录、Hooks（二期） |
| `docker-compose.yml` + `Caddyfile` | **部署** | PocketBase 容器；可选 Caddy 反代 |
| `packages/api` | 遗留 | NestJS，不再用于 V1 部署 |
| `packages/admin-web` | 遗留 | Vue Admin，由 PB Admin 替代 |
| `database/` | 遗留参考 | PostgreSQL DDL，字段对照用 |

## 身份与多角色

- 账号：`users`（PocketBase 内置认证）
- 角色：`user_roles` 集合，一人可多角色
- 客户端：`activeRole` + 请求头 `X-Active-Role`（详见 [LOGIN_STATE.md](./LOGIN_STATE.md)）
- 管理端：`org_admin` / `platform_admin` 使用 PocketBase Admin，无独立监督端

## 核心业务数据

集合关系见 `packages/pocketbase/COLLECTIONS.md`。主干：

`organizations` → `elders` → `orders` → `schedules`；`service_items` 定价；`school_*` 院校合作（**非租户**）。

## 客户端路由

单 AppID、分包按角色隔离；深链经 `pages/common/launch`。详见 [MINIAPP_ROUTING.md](./MINIAPP_ROUTING.md)。

## V1 边界

| 在 V1 | 二期 |
|-------|------|
| `pb_hooks/nuanban.pb.js`：登录、附近学生、下单、接单、模拟支付、外出审批 | 全量状态机、完成/签到、自动结算 |
| 集合 CRUD + Admin 派单/导出 | 行级 API 规则、`X-Active-Role` 服务端校验 |
| Haversine 附近学生（**不含** 学校合作过滤） | 合作范围 filter、PostGIS |
| `wx-login` / `dev-login` 演示 | 微信 code2session、支付 V3 |

产品细节见 [PRODUCT.md](./PRODUCT.md)。
