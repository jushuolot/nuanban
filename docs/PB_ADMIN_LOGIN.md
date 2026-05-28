# PocketBase 后台登录不了？（小白版）

## 现象

打开 `http://localhost:8090/_/#/login` 提示 **Invalid login credentials**。

## 最常见原因

1. **还没创建超级管理员**（第一次不能直接随便登录）
2. 执行 `superuser upsert` 时 **少了 `--dir=/pb_data`**（账号写到了错误目录）
3. 以前用过别的镜像，`pb_data` 里旧数据和现在 **加密密钥 `.env` 不一致**
4. 密码里有特殊字符，终端没加引号，实际密码和想的不一样

---

## 方案一：只重置管理员（保留已有数据）

在项目根目录执行：

```bash
cd ~/Projects/nuanban
chmod +x scripts/pb-reset-admin.sh
./scripts/pb-reset-admin.sh
```

然后用固定账号登录：

| 项 | 值 |
|----|-----|
| 地址 | http://localhost:8090/_/#/login |
| 邮箱 | `admin@nuanban.dev` |
| 密码 | `Nuanban2025!` |

---

## 方案二：彻底重来（推荐第一次搞不定时用）

会清空本地数据库，但最干净：

```bash
cd ~/Projects/nuanban
chmod +x scripts/pb-fresh-start.sh
./scripts/pb-fresh-start.sh
```

按提示输入 `y` 确认。

成功后同样用：

- 邮箱：`admin@nuanban.dev`
- 密码：`Nuanban2025!`

---

## 手动命令（和脚本等价）

```bash
cd ~/Projects/nuanban
docker compose exec pocketbase /pb/pocketbase superuser upsert admin@nuanban.dev 'Nuanban2025!' --dir=/pb_data
```

注意：

- 必须有 **`--dir=/pb_data`**
- 密码建议用 **单引号** 包起来

---

## 验证服务正常

```bash
curl -i http://localhost:8090/api/health --max-redirs 0
```

应看到 **`HTTP/1.1 200`**（不要出现跳转到 `https://localhost:443`）。

---

## 登录成功后下一步

1. **Settings → Import collections** → 选 `packages/pocketbase/pb_schema.json`
2. 按 `packages/pocketbase/SEED.md` 建演示账号
