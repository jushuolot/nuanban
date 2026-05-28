# PocketBase 导入 pb_schema 说明

## 报错原因

`user_roles ... The relation collection doesn't exist` 通常因为：

1. **未勾选** `Merge with the existing collections`（合并导入）  
   → 导入包里没有内置 `users` 表，但 schema 里有关联到 `users` 的字段。

2. 或一次性导入顺序/依赖有问题。

---

## 推荐做法（分两步，最稳）

### 第 1 步：导入基础表（无 users 关联）

1. 打开 **Settings → Import collections**
2. **勾选** `Merge with the existing collections`
3. 粘贴或选择文件：  
   `packages/pocketbase/pb_schema_phase1.json`
4. 确认导入

应新增：`school_dict`、`organizations`、`elders`、`service_items` 等。

### 第 2 步：导入业务表（含 users 关联）

1. 仍在 Import collections
2. **保持勾选** Merge
3. 粘贴或选择：  
   `packages/pocketbase/pb_schema_phase2.json`
4. 确认导入

应新增：`user_roles`、`orders`、`schedules` 等。

---

## 备选：整包一次导入

若你更熟悉，也可只导入完整 `pb_schema.json`，但**必须勾选 Merge**。

---

## 导入成功后

按 `packages/pocketbase/SEED.md` 录入演示数据，然后跑小程序。
