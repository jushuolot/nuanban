import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';

const htmlPath = process.argv[2];
const pdfPath = process.argv[3];
const chrome =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', right: '15mm', bottom: '18mm', left: '15mm' },
});
await browser.close();
console.log('OK', pdfPath);
