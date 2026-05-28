#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const input = process.argv[2];
if (!input || !existsSync(input)) {
  console.error('用法: node scripts/md-to-pdf-playwright.mjs <file.md>');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outPdf = input.replace(/\.md$/i, '.pdf');
const outHtml = input.replace(/\.md$/i, '.html');

const md = readFileSync(input, 'utf8');

// 简易 Markdown → HTML（表格、代码块、标题）
function mdToHtml(src) {
  let html = src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.trimEnd()}</code></pre>`;
  });

  html = html.replace(/^---[\s\S]*?---\n/m, '');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');

  html = html.replace(/^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)+)/gm, (_, head, body) => {
    const ths = head.split('|').filter(Boolean).map((c) => `<th>${c.trim()}</th>`).join('');
    const rows = body
      .trim()
      .split('\n')
      .map((row) => {
        const tds = row.split('|').filter(Boolean).map((c) => `<td>${c.trim()}</td>`).join('');
        return `<tr>${tds}</tr>`;
      })
      .join('');
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^---$/gm, '<hr/>');
  html = html.replace(/\\newpage/g, '<div class="page-break"></div>');

  html = html
    .split(/\n\n+/)
    .map((block) => {
      const t = block.trim();
      if (!t) return '';
      if (/^<(h[1-6]|table|pre|ul|blockquote|div|hr)/.test(t)) return t;
      return `<p>${t.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return html;
}

const body = mdToHtml(md);
const title = basename(input, '.md');
const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<style>
  @page { size: A4; margin: 22mm 18mm; }
  body {
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    font-size: 11pt;
    line-height: 1.65;
    color: #1a1a1a;
    max-width: 100%;
  }
  h1 { font-size: 22pt; margin: 1.2em 0 0.6em; color: #0d47a1; page-break-before: always; }
  h1:first-of-type, .cover h1 { page-break-before: avoid; }
  h2 { font-size: 16pt; margin: 1em 0 0.5em; color: #1565c0; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.2em; }
  h3 { font-size: 13pt; margin: 0.8em 0 0.4em; }
  h4, h5 { font-size: 11pt; margin: 0.6em 0 0.3em; }
  p { margin: 0.5em 0; }
  pre {
    background: #f5f7fa;
    border: 1px solid #e8ecf0;
    border-radius: 4px;
    padding: 10px 12px;
    font-size: 9pt;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
  code { font-family: Menlo, Monaco, monospace; font-size: 9.5pt; background: #f0f0f0; padding: 1px 4px; border-radius: 2px; }
  pre code { background: none; padding: 0; }
  table { width: 100%; border-collapse: collapse; margin: 0.8em 0; font-size: 10pt; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  th { background: #e3f2fd; }
  ul { margin: 0.4em 0; padding-left: 1.4em; }
  blockquote { border-left: 3px solid #90caf9; margin: 0.6em 0; padding-left: 12px; color: #555; }
  .page-break { page-break-after: always; height: 0; }
  .cover { text-align: center; padding: 120px 0 80px; }
  .cover h1 { font-size: 28pt; border: none; }
  .cover h2 { border: none; color: #666; font-weight: normal; }
</style>
</head>
<body>
${body.replace(
  /<h1>暖伴勤工<\/h1>\s*<h2>完整文档手册<\/h2>/,
  '<div class="cover"><h1>暖伴勤工</h1><h2>完整文档手册</h2><p>V1 · uni-app + PocketBase</p><p>2025年5月</p></div>'
)}
</body>
</html>`;

writeFileSync(outHtml, fullHtml, 'utf8');
console.log('HTML:', outHtml);

const runner = join(root, 'scripts', '_pdf-playwright-run.mjs');
writeFileSync(
  runner,
  `
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';

const htmlPath = process.argv[2];
const pdfPath = process.argv[3];
const html = readFileSync(htmlPath, 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', right: '15mm', bottom: '18mm', left: '15mm' },
});
await browser.close();
console.log('PDF:', pdfPath);
`,
  'utf8'
);

try {
  execSync('npm ls playwright 2>/dev/null', { cwd: root, stdio: 'pipe' });
} catch {
  console.log('安装 playwright（仅首次）…');
  execSync('npm install --no-save playwright@1.49.1', { cwd: root, stdio: 'inherit' });
  execSync('npx playwright install chromium', { cwd: root, stdio: 'inherit' });
}

execSync(`node "${runner}" "${outHtml}" "${outPdf}"`, { cwd: root, stdio: 'inherit' });
