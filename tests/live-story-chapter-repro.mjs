#!/usr/bin/env node
/** Informe repro live: capítulos 1–3 (antes del fix = solo mapa tras lectura). */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const LIVE = 'https://www.simgular.com/tetris-harry-potter/';
const out = join('screenshots', 'live-debug');
mkdirSync(out, { recursive: true });
const report = [];

const sizes = [
  { id: '390x844', w: 390, h: 844, touch: true },
  { id: '1024x768', w: 1024, h: 768, touch: true },
  { id: '1440x900', w: 1440, h: 900, touch: false },
];

for (const s of sizes) {
  const browser = await chromium.launch();
  const page = await (
    await browser.newContext({ viewport: { width: s.w, height: s.h }, hasTouch: s.touch, isMobile: s.touch })
  ).newPage();
  await page.goto(LIVE, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('#btnModeStory');
  await page.fill('#profileNameInput', `Live${s.id}`);
  await page.click('#profileCreateBtn');
  await page.waitForSelector('#storyHeroScreen.show');
  await page.evaluate(() => {
    const p = ProfileStore.activeProfile();
    p.story.heroId = 'harry';
    p.story.nodeId = 'n01';
    p.story.completedNodes = [];
    ProfileStore.setProgress(p.story);
    document.querySelector('.story-hero-card:not([disabled])')?.click();
  });
  await page.click('#storyMapContinue');

  for (const ch of ['n01', 'n02', 'n03']) {
    await page.evaluate((id) => StoryMode.startNodeFlow(id), ch);
    for (let i = 0; i < 10; i++) {
      if (await page.locator('#storyChoiceRow:not([hidden])').count()) {
        await page.click('#storyChoiceA');
        break;
      }
      if (await page.locator('#storyPanelScreen.show #storyPanelNext:not([hidden])').count()) {
        await page.click('#storyPanelNext');
        await page.waitForTimeout(120);
      } else break;
    }
    await page.waitForTimeout(400);
    const st = await page.evaluate(() => ({
      game: document.getElementById('gameScreen')?.classList.contains('show'),
      map: document.getElementById('storyMapScreen')?.classList.contains('show'),
      intro: document.getElementById('storyDuelIntroOverlay')?.classList.contains('show'),
      running: Game?.running,
    }));
    report.push({ viewport: s.id, chapter: ch, ...st });
    await page.screenshot({ path: join(out, `live-${s.id}-after-${ch}.png`), fullPage: true });
    if (st.map) continue;
    if (st.game || st.intro) await page.click('#backBtn').catch(() => {});
    await page.waitForSelector('#storyMapScreen.show', { timeout: 8000 }).catch(() => {});
  }
  await browser.close();
}

writeFileSync(join(out, 'live-chapter-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
console.log('Si game:false tras cada capítulo en live, el build antiguo solo muestra lectura (sin duelo).');