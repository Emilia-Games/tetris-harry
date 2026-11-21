#!/usr/bin/env node
/** Reproduce live-site Empezar flow — console + network + screenshot */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const LIVE = 'https://www.simgular.com/tetris-harry-potter/';
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'screenshots', 'live-debug');
mkdirSync(outDir, { recursive: true });

const cases = [
  { name: '390x844', width: 390, height: 844, touch: true, storage: 'empty' },
  { name: '390x844-legacy', width: 390, height: 844, touch: true, storage: 'legacy' },
  { name: '1440x900', width: 1440, height: 900, touch: false, storage: 'empty' },
];

const legacyLocalStorage = {
  thp_save: '{"level":1}',
  thp_settings: '{"music":"on"}',
  thp_profiles_v2: 'not-json{{{',
};

let failed = false;

for (const c of cases) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: c.width, height: c.height },
    hasTouch: c.touch,
    isMobile: c.touch,
  });
  const page = await ctx.newPage();
  const consoleErr = [];
  const http404 = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErr.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErr.push(`PAGE: ${err.message}`));
  page.on('response', (res) => {
    const u = res.url();
    if (res.status() === 404 && u.includes('tetris-harry-potter')) {
      http404.push(`${res.status()} ${u}`);
    }
  });

  await page.goto(LIVE, { waitUntil: 'networkidle', timeout: 90000 });
  if (c.storage === 'legacy') {
    await page.evaluate((ls) => {
      for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, v);
    }, legacyLocalStorage);
    await page.reload({ waitUntil: 'networkidle' });
  } else {
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
  }

  await page.click('#btnModeStory');
  await page.waitForSelector('#profileScreen.show', { timeout: 15000 });
  await page.fill('#profileNameInput', 'Emilia');
  await page.click('#profileCreateBtn');
  await page.waitForTimeout(1500);

  const state = await page.evaluate(() => ({
    profileShow: document.getElementById('profileScreen')?.classList.contains('show'),
    heroShow: document.getElementById('storyHeroScreen')?.classList.contains('show'),
    mapShow: document.getElementById('storyMapScreen')?.classList.contains('show'),
    hasStoryMode: typeof window.StoryMode !== 'undefined',
    activeName: window.ProfileStore?.activeProfile?.()?.name,
    wireBroken:
      typeof ProfileStore !== 'undefined' &&
      window.ProfileStore !== ProfileStore &&
      typeof ProfileStore?.wireProfileUI !== 'function',
  }));

  console.log(`\n=== ${c.name} (${c.storage}) ===`);
  console.log('UI state:', state);
  console.log('404s:', http404.length ? http404 : 'none');
  console.log('console errors:', consoleErr.length ? consoleErr : 'none');

  if (c.name.startsWith('390x844') && c.storage === 'empty') {
    await page.screenshot({ path: join(outDir, '390x844-after-empezar-live-broken.png'), fullPage: true });
    if (state.wireBroken) console.warn('LIVE: ProfileStore global shadow bug still present (fix not deployed)');
    if (!state.heroShow && !state.mapShow) failed = true;
  }
  if (!state.hasStoryMode || consoleErr.some((e) => e.includes('StoryMode'))) failed = true;

  await browser.close();
}

if (failed) {
  console.error('\nFAIL: Empezar did not navigate to hero/map');
  process.exit(1);
}
console.log('\nOK');