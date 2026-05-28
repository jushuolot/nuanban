# 暖伴勤工 · API 说明（PocketBase V1）

**Base URL**：`http://localhost:8090/api`（生产为 `https://<域名>/api`）  
**无** `/api/v1` 前缀。客户端 `VITE_API_BASE_URL` 应指向上述根（H5 开发可用 `/api` 走 Vite 代理）。

---

## 1. 认证头

```
Authorization: Bearer <pocketbase_token>
X-Active-Role: elder | family | student   # 客户端传递；V1 Hooks 未统一校验
```

---

## 2. 自定义业务 API（V1 主路径）

实现文件：`packages/pocketbase/pb_hooks/nuanban.pb.js`

### 2.1 登录与账号

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/nuanban/wx-login` | body: `{ code }`；演示用，按 code 创建/查找 `wx_*@nuanban.dev` |
| POST | `/nuanban/dev-login` | body: `{ email }`；**不校验密码**；须 seed |
| GET | `/nuanban/auth/me` | 需登录；返回 `user`、`roles[]` |
| POST | `/nuanban/auth/register` | 需登录；body: `{ role, displayName? }`；学生 → `pending` |

完整 URL 示例：`POST http://localhost:8090/api/nuanban/dev-login`

### 2.2 老人端

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/nuanban/elder/caregivers/nearby` | query: `lat`, `lng`, `radiusKm`（默认 5） |
| POST | `/nuanban/elder/orders` | body: `elderId`, `serviceItemId`, 可选 `studentId`, `scheduledAt`, `requirePayment` |

### 2.3 学生端

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/nuanban/student/orders/pending` | 待接单列表 |
| POST | `/nuanban/student/order-requests/{id}/accept` | 接单 |
| POST | `/nuanban/student/order-requests/{id}/reject` | body: `{ reason? }` |

### 2.4 家属端

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/nuanban/family/orders/{id}/pay` | 模拟支付（仅 `pending_payment`） |
| POST | `/nuanban/family/outdoor/{id}/approve` | body: `{ approved, reason? }` |

### 2.5 演示数据

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/nuanban/seed-demo?key=nuanban_dev_seed` | 一键写入学校/机构/用户/订单等 |

---

## 3. PocketBase 标准 REST

列表：`GET /collections/<name>/records?filter=...&sort=-created`  
单条 CRUD：`/collections/<name>/records/:id`  
用户认证：`POST /collections/users/auth-with-password` 等（小程序 V1 主路径走 §2）

常用集合：`elders`、`service_items`、`orders`、`user_roles`、`family_elder_bindings` …  
字段见 `packages/pocketbase/COLLECTIONS.md`。

---

## 4. 与历史 NestJS 的对照

`packages/api` 中 `/elder/*`、`/family/*`、`/admin/*` **V1 不部署**。能力映射：

| 原 Nest | V1 |
|---------|-----|
| `GET /elder/caregivers/nearby` | `GET /nuanban/elder/caregivers/nearby` |
| `POST /elder/orders` | `POST /nuanban/elder/orders` |
| `POST /family/orders/:id/pay` | `POST /nuanban/family/orders/:id/pay` |
| `POST /admin/schedules/assign` | Admin 写 `schedules` 或后续 Hook |

---

## 5. 健康检查

```
GET /api/health
```

---

## 6. 管理端

- Admin UI：`http://<host>:8090/_/`
- 不使用 `packages/admin-web`
