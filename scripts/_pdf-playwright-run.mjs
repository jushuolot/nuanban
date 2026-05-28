
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
