import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'screenshots', 'responsive', 'after');
mkdirSync(outDir, { recursive: true });
const url = 'file://' + join(root, 'index.html');

const sizes = [
  { name: 'mobile-portrait', width: 375, height: 667 },
  { name: 'mobile-landscape', width: 667, height: 375 },
  { name: 'ipad', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
];

async function prepPage(page) {
  await page.addInitScript(() => {
    localStorage.setItem('thp_music', 'off');
  });
  await page.goto(url, { waitUntil: 'networkidle' });
}

async function shotSelection(page, label) {
  await page.screenshot({ path: join(outDir, `${label}-selection.png`), fullPage: false });
}

async function startDuel(page) {
  await page.evaluate(() => {
    const h = document.querySelector('#heroCards .card');
    const v = document.querySelector('#villainCards .card');
    h?.click();
    v?.click();
  });
  await page.evaluate(() => document.getElementById('playBtn')?.click());
  await page.waitForSelector('#gameScreen.show', { timeout: 8000 });
  await page.waitForTimeout(600);
}

async function shotDuel(page, label) {
  await page.screenshot({ path: join(outDir, `${label}-duel.png`), fullPage: false });
}

const browser = await chromium.launch();
let errors = [];

for (const s of sizes) {
  const context = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    hasTouch: s.width < 900,
    isMobile: s.width < 900,
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`${s.name}: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${s.name} console: ${msg.text()}`);
  });
  await prepPage(page);
  await shotSelection(page, s.name);
  await startDuel(page);
  await shotDuel(page, s.name);
  if (s.width < 900) {
    const touch = await page.locator('#touch');
    await touch.waitFor({ state: 'visible', timeout: 3000 });
    await touch.locator('[data-a="right"]').tap();
    await touch.locator('[data-a="rot"]').tap();
  }
  await context.close();
}

await browser.close();
console.log('Screenshots in', outDir);
if (errors.length) {
  console.error('ERRORS:', errors.join('\n'));
  process.exit(1);
}
console.log('No console/page errors detected.');