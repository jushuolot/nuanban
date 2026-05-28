#!/usr/bin/env node
/**
 * 合并 docs/*.md 为完整手册并生成 PDF
 * 用法: node scripts/build-docs-pdf.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const docsDir = join(root, 'docs');
const outMd = join(docsDir, '暖伴勤工-完整文档手册.md');
const outPdf = join(docsDir, '暖伴勤工-完整文档手册.pdf');

const sections = [
  { title: '文档说明', file: null, content: intro() },
  { title: '第一部分 产品规格', file: 'PRODUCT.md' },
  { title: '第二部分 技术架构', file: 'TECH_STACK_SIMPLE.md' },
  { title: '第三部分 系统架构', file: 'ARCHITECTURE.md' },
  { title: '第四部分 部署指南', file: 'DEPLOY.md' },
  { title: '第五部分 快速上手（小白）', file: null, content: quickStart() },
  { title: '第六部分 数据导入与演示数据', file: null, content: dataSection() },
  { title: '第七部分 后台登录', file: 'PB_ADMIN_LOGIN.md' },
  { title: '第八部分 API 说明', file: 'API.md' },
  { title: '第九部分 登录与多角色', file: 'LOGIN_STATE.md' },
  { title: '第十部分 小程序路由', file: 'MINIAPP_ROUTING.md' },
  { title: '第十一部分 故障排查', file: 'TROUBLESHOOTING.md' },
  { title: '附录 名词与账号', file: null, content: appendix() },
];

function intro() {
  return `
**项目名称**：暖伴勤工  
**版本**：V1 精简栈（产品资料已与代码对齐，2025-05）  
**技术栈**：uni-app（微信小程序 + H5）+ PocketBase + Docker Compose  

本文档由 \`docs/\` 各专题合并生成。**产品规则以 PRODUCT.md 为准**，其中区分「产品目标」与「V1 已实现」。

### 阅读建议

| 读者 | 建议章节 |
|------|----------|
| 产品 / 运营 | 第一部分（产品资料） |
| 技术负责人 | 产品资料 + 技术架构 + 部署 + API |
| 运维 | 部署、后台登录、故障排查 |
| 前端 / 小程序 | 产品资料 §10、登录态、路由 |
| 首次搭建 | 快速上手、数据导入、附录账号 |
`;
}

function quickStart() {
  return readFileSync(join(root, 'README.md'), 'utf8')
    .replace(/^# .+\n/, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function dataSection() {
  const imp = existsSync(join(docsDir, 'PB_IMPORT.md'))
    ? readFileSync(join(docsDir, 'PB_IMPORT.md'), 'utf8')
    : '';
  const seed = existsSync(join(root, 'packages/pocketbase/SEED.md'))
    ? readFileSync(join(root, 'packages/pocketbase/SEED.md'), 'utf8')
    : '';
  return (
    stripMdLinks(imp) +
    '\n\n---\n\n## 一键写入演示数据\n\n' +
    stripMdLinks(seed) +
    '\n\n```bash\ncd ~/Projects/nuanban\ndocker compose restart pocketbase\n./scripts/seed-demo.sh\n```\n'
  );
}

function appendix() {
  return `
### 测试账号（执行 seed-demo 后）

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 后台管理员 | admin@nuanban.dev | Nuanban2025! |
| 学生 | student1@test.nuanban.dev | nuanban_dev_2025 |
| 家属 | family1@test.nuanban.dev | nuanban_dev_2025 |
| 老人 | elder1@test.nuanban.dev | nuanban_dev_2025 |

### H5 开发登录

- 使用登录页 **「开发账号登录（学生）」**
- \`.env\` 中 \`VITE_API_BASE_URL=/api\`（走 Vite 代理）
- 须先执行 \`./scripts/seed-demo.sh\`

### 仓库路径

| 路径 | 说明 |
|------|------|
| packages/miniapp | 单小程序（三角色分包） |
| packages/pocketbase | 后端数据与 Hooks |
| docker-compose.yml | Docker 部署 |
| docs/ | 分专题文档（本手册来源） |
`;
}

function stripMdLinks(text) {
  return text
    .replace(/\]\(\.\/[^)]+\)/g, ']')
    .replace(/\]\(\.\.\/[^)]+\)/g, ']')
    .replace(/^# /gm, '### ')
    .replace(/^## /gm, '#### ')
    .replace(/^### /gm, '##### ');
}

function loadSection(sec) {
  let body = sec.content || '';
  if (sec.file) {
    const p = join(docsDir, sec.file);
    if (!existsSync(p)) throw new Error(`缺少文件: ${p}`);
    body = readFileSync(p, 'utf8').replace(/^# [^\n]+\n+/, '');
    body = stripMdLinks(body);
  }
  return body;
}

let md = `---
title: 暖伴勤工 完整文档手册
author: 暖伴勤工项目组
date: 2025-05
lang: zh-CN
---

<div style="text-align:center;padding:80px 0;">

# 暖伴勤工

## 完整文档手册

V1 · uni-app + PocketBase

</div>

\\newpage

## 目录

1. 文档说明  
2. 第一部分 产品规格  
3. 第二部分 技术架构  
4. 第三部分 系统架构  
5. 第四部分 部署指南  
6. 第五部分 快速上手  
7. 第六部分 数据导入与演示数据  
8. 第七部分 后台登录  
9. 第八部分 API 说明  
10. 第九部分 登录与多角色  
11. 第十部分 小程序路由  
12. 第十一部分 故障排查  
13. 附录  

\\newpage

`;

for (const sec of sections) {
  md += `\n\n# ${sec.title}\n\n`;
  md += loadSection(sec);
  md += '\n\n\\newpage\n\n';
}

writeFileSync(outMd, md, 'utf8');
console.log('已生成:', outMd);

// PDF（fpdf2 + 系统中文字体，无需 Chrome / pandoc）
try {
  execSync(`python3 "${join(root, 'scripts/md-to-pdf-fpdf.py')}" "${outMd}"`, {
    stdio: 'inherit',
    cwd: root,
  });
} catch (e) {
  console.log('\nPDF 生成失败。可先安装依赖：');
  console.log('  pip3 install --user fpdf2');
  console.log(`  python3 scripts/md-to-pdf-fpdf.py "${outMd}"`);
  console.log('\n或打开 docs/暖伴勤工-完整文档手册.html → 浏览器打印 → 另存为 PDF');
}

if (existsSync(outPdf)) {
  const kb = Math.round(readFileSync(outPdf).length / 1024);
  console.log(`\n已生成 PDF (${kb} KB):`, outPdf);
}
