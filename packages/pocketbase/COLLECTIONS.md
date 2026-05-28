# PocketBase 集合说明

导入 `pb_schema.json` 后的集合一览。ID 规则：PocketBase 自动生成 record id。

## 核心集合

| 集合 | 用途 |
|------|------|
| `school_dict` | 学校字典（非租户） |
| `organizations` | 养老院/福利院 |
| `communities` | 机构下社区服务点 |
| `school_cooperation` | 学校 ↔ 机构合作 |
| `school_designated_elder` | 学校项目指定老人 |
| `elders` | 老人档案 |
| `user_roles` | 用户角色（关联 `users`） |
| `service_categories` | 服务大类 |
| `service_items` | SKU 定价项 |
| `orders` | 订单 |
| `schedules` | 排班/服务单 |
| `outdoor_approvals` | 外出审批 |
| `settlements` | 结算记录 |
| `export_tasks` | 导出任务 |
| `family_elder_bindings` | 家属绑定老人 |
| `schedules` | 排班/服务单 |
| `outdoor_approvals` | 外出审批 |
| `settlements` | 结算记录 |
| `school_designated_elder` | 学校指定老人 |

## 自定义 API（pb_hooks）

| 路径 | 说明 |
|------|------|
| `POST /api/nuanban/wx-login` | 微信 code 开发态登录 |
| `GET /api/nuanban/auth/me` | 当前用户角色 |
| `GET /api/nuanban/elder/caregivers/nearby` | 附近学生 |
| `POST /api/nuanban/elder/orders` | 老人下单 |
| `POST /api/nuanban/student/order-requests/:id/accept` | 学生接单 |
| `POST /api/nuanban/family/orders/:id/pay` | 模拟支付 |

## 内置

- `users`：登录账号（手机/邮箱）；微信 openid 可存 `oauth` 或扩展字段 `wx_openid`（schema 已加可选字段）

## 权限（V1 建议）

在 Admin 中按集合调整；默认 schema 为 **仅认证用户可读，管理员可写**。上线前：

- `elders`、订单：老人/家属/学生仅能读与自己相关的记录（需 Hooks 或 view 规则细化）
- `export_tasks`：仅 `platform_admin` / `org_admin` 角色

## 关系简图

```
school_dict ── school_cooperation ── organizations
                      │
school_designated_elder ── elders ── orders ── schedules
users ── user_roles          │              │
                             └── service_items
```
