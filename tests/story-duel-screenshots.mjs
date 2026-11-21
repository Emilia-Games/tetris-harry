#!/usr/bin/env node
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'screenshots', 'story-duel-v2');
mkdirSync(out, { recursive: true });

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const file = url.pathname === '/' ? '/index.html' : url.pathname;
  const p = join(root, file);
  if (!existsSync(p)) res.writeHead(404), res.end();
  else res.writeHead(200), res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

async function setup(page, frontier = 'n01') {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('#btnModeStory');
  await page.fill('#profileNameInput', 'Emilia');
  await page.click('#profileCreateBtn');
  await page.waitForSelector('#storyHeroScreen.show');
  await page.evaluate((nodeId) => {
    const p = ProfileStore.activeProfile();
    p.story = {
      heroId: 'harry',
      nodeId,
      completedNodes: [],
      branches: {},
      spells: [],
      wins: 0,
      completed: false,
    };
    ProfileStore.setProgress(p.story);
    document.querySelector('.story-hero-card:not([disabled])')?.click();
  }, frontier);
  await page.click('#storyMapContinue');
}

async function advanceToIntro(page, nodeId) {
  await page.evaluate((id) => StoryMode.startNodeFlow(id), nodeId);
  for (let i = 0; i < 10; i++) {
    if (await page.locator('#storyDuelIntroOverlay.show').count()) return;
    if (await page.locator('#storyPanelScreen.show #storyPanelNext:not([hidden])').count()) {
      await page.click('#storyPanelNext');
      await page.waitForTimeout(120);
    } else break;
  }
  await page.waitForSelector('#storyDuelIntroOverlay.show', { timeout: 12000 });
}

const browser = await chromium.launch();

const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const phonePage = await phone.newPage();
await setup(phonePage, 'n01');
await advanceToIntro(phonePage, 'n01');
await phonePage.screenshot({ path: join(out, '390x844-duelo-contra-crabbe.png') });
await phonePage.click('#storyDuelStartBtn');
await phonePage.waitForSelector('#gameScreen.show');
await phonePage.waitForTimeout(2500);
await phonePage.screenshot({ path: join(out, '390x844-duelo-en-juego.png') });
await phone.close();

const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const deskPage = await desk.newPage();
await setup(deskPage, 'n01');
await advanceToIntro(deskPage, 'n01');
await deskPage.click('#storyDuelStartBtn');
await deskPage.waitForSelector('#gameScreen.show');
await deskPage.waitForTimeout(2500);
await deskPage.screenshot({ path: join(out, '1440x900-duelo-en-juego.png') });
await desk.close();

const reward = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const rPage = await reward.newPage();
await setup(rPage, 'n04f');
await advanceToIntro(rPage, 'n04f');
await rPage.click('#storyDuelStartBtn');
await rPage.waitForSelector('#gameScreen.show');
await rPage.evaluate(() => {
  Game.V.hp = 0;
  endGame(Game.V);
});
for (let i = 0; i < 15; i++) {
  if (await rPage.locator('#storyRewardOverlay.show').count()) break;
  if (await rPage.locator('#storyPanelScreen.show #storyPanelNext:not([hidden])').count()) {
    await rPage.click('#storyPanelNext');
  }
  await rPage.waitForTimeout(200);
}
await rPage.waitForSelector('#storyRewardOverlay.show', { timeout: 15000 });
await rPage.waitForTimeout(500);
await rPage.screenshot({ path: join(out, '390x844-recompensa-despues-victoria.png') });
await reward.close();

await browser.close();
server.close();
console.log('story-duel-screenshots OK →', out);