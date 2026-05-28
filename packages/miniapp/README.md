# 暖伴勤工 · 小程序

**单小程序、三角色分包**：`package-elder` / `package-family` / `package-student`。

## 推荐：HBuilderX

1. 安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html) 与微信开发者工具  
2. 文件 → 打开目录 → 选择本文件夹 `packages/miniapp`  
3. 运行 → 运行到小程序模拟器 → 微信开发者工具  
4. 在根目录复制 `.env.example` 为 `.env`，填写 `VITE_API_BASE_URL`

## 可选：CLI

```bash
cd packages/miniapp
cp .env.example .env
npm install   # 需可写 node_modules，见 docs/TROUBLESHOOTING.md
npm run dev:mp-weixin
```

## 入口与深链

- 启动页：`src/pages/common/launch.vue`
- 登录：`src/pages/common/login.vue`
- 角色存储：`src/store/role.ts`
- 路由说明：项目根目录 `docs/MINIAPP_ROUTING.md`

## 微信配置

在 `src/manifest.json` → `mp-weixin.appid` 填入正式 AppID。
