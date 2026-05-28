# 暖伴勤工 · 小程序路由与分包

> 以 `packages/miniapp/src/pages.json` 为 **唯一真相**；下文「规划」页面尚未注册。

## 1. V1 已上线页面结构

```
主包 pages/common/
  launch           启动（深链 role/target/id）
  login            微信登录 + 开发账号登录
  role-select      多角色选择
  register         注册角色（写 user_roles）

分包 package-elder/
  home
  caregivers/list    找陪护（附近学生）
  caregivers/detail
  order/create       预约（POST /nuanban/elder/orders）
  order/list
  order/detail

分包 package-family/
  home
  order/pay          模拟支付
  outdoor/approve    外出审批

分包 package-student/
  home
  discover/list      待接单列表（GET /nuanban/student/orders/pending）
  order/request      接单 / 拒单
```

## 2. 深链

| 参数 | 说明 |
|------|------|
| `role` | `elder` \| `family` \| `student` |
| `target` | 页面 key（如 `order-pay`） |
| `id` | 业务 ID |

示例：`/pages/common/launch?role=family&target=order-pay&id=<orderId>`

`launch` 流程：校验 token → 若无 `activeRole` 则 `role-select` → `reLaunch` 到对应分包首页或目标页。

## 3. TabBar

未使用微信原生三套 tabBar。各分包首页内嵌 **`RoleTabBar`**（`config/tabs.ts`），按 `activeRole` 切换 Tab 配置。

## 4. 角色切换

- 存储：`pinia` `store/role.ts` + `uni.setStorageSync('activeRole')`  
- 多角色：登录后或 `role-select` 页选择  
- **注意**：切换身份应调用 `roleStore.setActiveRole()`，**不要** 请求已废弃的 Nest `POST /auth/switch-role`

## 5. 导航守卫

`utils/nav-guard.ts`：

1. 已登录（`access_token`）  
2. `activeRole` 与分包前缀一致  
3. 学生角色需 `user_roles.status === active`

## 6. 规划页面（未在 pages.json 注册）

| 分包 | 规划路径 | 说明 |
|------|----------|------|
| common | agreement | 用户协议 |
| elder | settings | 大字号等无障碍 |
| family | elder/bind, order/list, package/buy | 绑定、账单、服务包 |
| student | schedule/list, schedule/checkin, schedule/log, income/list, profile/edit | 排班、签到、收入、资料 |

产品说明见 [PRODUCT.md](./PRODUCT.md) §10、§12。
