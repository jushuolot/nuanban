# 暖伴勤工 · 登录态与鉴权

> V1 后端：PocketBase + `pb_hooks/nuanban.pb.js` 自定义登录路由。

## 1. 登录方式（V1）

| 场景 | 接口 | 说明 |
|------|------|------|
| H5 / 本地开发 | `POST /api/nuanban/dev-login` | body `{ email }`，不校验密码；默认 `student1@test.nuanban.dev` |
| 微信（演示） | `POST /api/nuanban/wx-login` | body `{ code }`；**非** 正式 code2session |
| 标准密码登录 | `POST /collections/users/auth-with-password` | seed 用户密码 `nuanban_dev_2025`；H5 跨域时优先 dev-login |

**前置**：`./scripts/seed-demo.sh` 或 Admin 已建用户与 `user_roles`。

## 2. 登录响应

```json
{
  "token": "<pocketbase_auth_token>",
  "user": { "id": "...", "nickname": "..." },
  "roles": [{ "role": "student", "status": "active", "elderProfileId": null }],
  "activeRole": "student"
}
```

- `activeRole`：优先取 `status=active` 的第一个角色。  
- 多角色且需切换 → `pages/common/role-select` → **本地** `roleStore.setActiveRole(role)`（勿调 Nest `switch-role`）。

## 3. 本地存储（uni-app）

| Key | 内容 |
|-----|------|
| `access_token` | PB token |
| `user` | `{ id, nickname, avatarUrl? }` |
| `roles` | 来自登录或 `/nuanban/auth/me` |
| `activeRole` | `elder` \| `family` \| `student` |

## 4. 请求头

`utils/request.ts` 自动附加：

- `Authorization: Bearer <access_token>`  
- `X-Active-Role: <activeRole>`（有值时）

**V1 限制**：业务 Hooks 仅 `requireAuth(e)`，**未** 按 `X-Active-Role` 拒绝越权；敏感写操作依赖二期规则 + Admin。

## 5. 注册

`POST /api/nuanban/auth/register`（需已登录）：

- 创建 `user_roles`；`student` → `status=pending`，其它 → `active`。  
- **不含**：绑定老人、学校学号等字段（产品目标见 [PRODUCT.md](./PRODUCT.md) §3.3）。

## 6. 401 / 403

| 情况 | 处理 |
|------|------|
| 401 | 清 token → `pages/common/login` |
| 学生未审核 | `nav-guard` 拦截 → 提示等待审核 |
| 角色与分包不符 | 提示切换身份 → `role-select` |

## 7. 生产演进（二期）

- 微信 openid 绑定 `users`  
- Hooks 校验 `X-Active-Role` 与 `user_roles`  
- 集合 List/View API 按 `elder_id` / `user_id` 行级过滤
