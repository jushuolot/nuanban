# 演示数据（PocketBase）

## 一键导入（推荐）

确保 PocketBase 已启动后，在项目根目录执行：

```bash
chmod +x scripts/seed-demo.sh
./scripts/seed-demo.sh
```

或：

```bash
curl -X POST "http://localhost:8090/api/nuanban/seed-demo?key=nuanban_dev_seed"
```

可重复执行，不会重复创建同名学校/老人/用户。

**统一测试密码**：`nuanban_dev_2025`

| 角色 | 示例账号 |
|------|----------|
| 学生 | student1@test.nuanban.dev |
| 家属 | family1@test.nuanban.dev |
| 老人 | elder1@test.nuanban.dev |
| 兼容旧文档 | student@test / family@test / elder@test |

---

## 手工录入（可选）

在 **http://localhost:8090/_/** 导入 `pb_schema.json` 后，也可按下列顺序手工录入。

## 1. 基础字典

| 集合 | 示例 |
|------|------|
| `school_dict` | name=`示范大学`, enabled=true |
| `organizations` | name=`暖伴示范养老院`, latitude=31.23, longitude=121.47, enabled=true |
| `communities` | org=上一步, name=`A区` |
| `service_categories` | name=`陪护` |
| `service_items` | category=陪护, name=`陪伴2小时`, price_cents=8000, duration_minutes=120, enabled=true |

## 2. 老人档案

`elders`: org=养老院, name=`张奶奶`, latitude=31.2304, longitude=121.4737, enabled=true

记下 **elder id**（如 `abc123`）。

## 3. 测试账号（Auth → users）

创建 3 个用户（密码统一 `nuanban_dev_2025`，与 hooks 开发登录一致）：

| 邮箱 | 用途 |
|------|------|
| elder@test.nuanban.dev | 老人端 |
| family@test.nuanban.dev | 家属端 |
| student@test.nuanban.dev | 学生端 |

## 4. user_roles

| user | role | status | 附加 |
|------|------|--------|------|
| elder@test | elder | active | elder_profile=张奶奶 id |
| family@test | family | active | — |
| student@test | student | active | display_name=`小李`, school=示范大学, latitude=31.231, longitude=121.474 |

## 5. 家属绑定

`family_elder_bindings`: family_user=家属用户 id, elder=张奶奶 id, is_primary_payer=true

## 6. 小程序联调

`packages/miniapp/.env`:

```env
VITE_API_BASE_URL=http://localhost:8090/api
```

- **微信登录**：hooks 按 `code` 自动创建 `wx_*@nuanban.dev` 用户（无角色时需注册页补角色）。
- **开发快捷登录**（H5）：登录页「开发账号登录」使用 `student@test.nuanban.dev` / `nuanban_dev_2025`。

## 7. 验证流程

1. 老人端：附近陪护 → 选学生 → 下单 → 订单 `pending_accept`
2. 学生端：发现页待接单 → 接受 → `pending_service`（或外出待批）
3. 家属端：待支付订单 → 模拟支付；外出审批页通过/拒绝
