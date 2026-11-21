#!/usr/bin/env node
/** Regresa: Empezar crea perfil y abre selección de héroe (servidor local = build desplegable). */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const file = url.pathname === '/' ? '/index.html' : url.pathname;
  const p = join(root, file);
  if (!existsSync(p)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200);
  res.end(readFileSync(p));
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const { port } = server.address();
const base = `http://127.0.0.1:${port}/`;

const sizes = [
  { name: '390x844', width: 390, height: 844, touch: true },
  { name: '1440x900', width: 1440, height: 900, touch: false },
];

let failed = false;
for (const s of sizes) {
  const browser = await chromium.launch();
  const page = await (
    await browser.newContext({
      viewport: { width: s.width, height: s.height },
      hasTouch: !!s.touch,
      isMobile: !!s.touch,
    })
  ).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  const shadow = await page.evaluate(
    () => window.ProfileStore === ProfileStore && typeof ProfileStore?.wireProfileUI !== 'function'
  );
  if (shadow) {
    console.error(`${s.name}: global ProfileStore still shadows window.ProfileStore`);
    failed = true;
  }
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('#btnModeStory');
  await page.waitForSelector('#profileScreen.show');
  await page.fill('#profileNameInput', 'Emilia');
  await page.click('#profileCreateBtn');
  await page.waitForFunction(
    () =>
      document.getElementById('storyHeroScreen')?.classList.contains('show') ||
      document.getElementById('storyMapScreen')?.classList.contains('show'),
    null,
    { timeout: 8000 }
  );
  const ok = await page.evaluate(() => ({
    hero: document.getElementById('storyHeroScreen')?.classList.contains('show'),
    map: document.getElementById('storyMapScreen')?.classList.contains('show'),
    name: window.ProfileStore?.activeProfile?.()?.name,
  }));
  if (!ok.name || (!ok.hero && !ok.map)) {
    console.error(`${s.name}: Empezar failed`, ok, errors);
    failed = true;
  } else {
    console.log(`${s.name}: OK → ${ok.name}`, ok.hero ? 'hero' : 'map');
  }
  if (s.name === '390x844') {
    await page.screenshot({
      path: join(root, 'screenshots', 'live-debug', '390x844-after-empezar.png'),
    });
  }
  await browser.close();
}

server.close();
if (failed) process.exit(1);
console.log('profile-empezar: OK');