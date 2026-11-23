import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = '/tmp/tetris-harry-before';
const outDir = join(repo, 'screenshots', 'responsive', 'before');
mkdirSync(outDir, { recursive: true });
const url = 'file://' + join(root, 'index.html');
const sizes = [
  { name: 'mobile-portrait', width: 375, height: 667 },
  { name: 'mobile-landscape', width: 667, height: 375 },
  { name: 'ipad', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
];
const browser = await chromium.launch();
for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, hasTouch: s.width < 900, isMobile: s.width < 900 });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('thp_music', 'off'));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(outDir, `${s.name}-selection.png`) });
  await page.evaluate(() => { document.querySelector('#heroCards .card')?.click(); document.querySelector('#villainCards .card')?.click(); });
  await page.evaluate(() => document.getElementById('playBtn')?.click());
  await page.waitForSelector('#gameScreen.show', { timeout: 8000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outDir, `${s.name}-duel.png`) });
  await ctx.close();
}
await browser.close();
console.log('before shots in', outDir);