#!/usr/bin/env node
/** Regresión: cada capítulo → intro → tarjeta duelo → Tetris 2 jugadores; progreso solo al ganar. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shotDir = join(root, 'screenshots', 'live-debug');
mkdirSync(shotDir, { recursive: true });

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const file = url.pathname === '/' ? '/index.html' : url.pathname;
  const p = join(root, file);
  if (!existsSync(p)) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200);
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

async function advancePanels(page) {
  for (let i = 0; i < 12; i++) {
    if (!(await page.locator('#storyPanelScreen.show').count())) break;
    if (await page.locator('#storyChoiceRow:not([hidden])').count()) break;
    if (!(await page.locator('#storyPanelNext:not([hidden])').count())) break;
    await page.click('#storyPanelNext');
    await page.waitForTimeout(120);
  }
}

async function pickChoice(page, which) {
  const btn = which === 'A' ? '#storyChoiceA' : '#storyChoiceB';
  await page.waitForSelector(btn, { timeout: 8000 });
  await page.click(btn);
  await advancePanels(page);
}

async function setupHarryProfile(page) {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('#btnModeStory');
  await page.fill('#profileNameInput', 'Tester');
  await page.click('#profileCreateBtn');
  await page.waitForSelector('#storyHeroScreen.show');
  await page.evaluate(() => {
    const prof = window.ProfileStore.activeProfile();
    if (prof) {
      prof.story.heroId = 'harry';
      prof.story.nodeId = 'n01';
      prof.story.completedNodes = [];
      prof.story.spells = [];
      window.ProfileStore.setProgress(prof.story);
    }
    document.querySelector('.story-hero-card:not([disabled])')?.click();
  });
  await page.click('#storyMapContinue');
  await page.waitForSelector('#storyMapScreen.show');
}

function progress(page) {
  return page.evaluate(() => {
    const p = window.ProfileStore.getProgress();
    return {
      nodeId: p.nodeId,
      completed: [...(p.completedNodes || [])],
      spells: [...(p.spells || [])],
    };
  });
}

async function startNode(page, id) {
  await page.evaluate((nid) => window.StoryMode.startNodeFlow(nid), id);
  await advancePanels(page);
}

async function startStoryBattle(page, id) {
  await startNode(page, id);
  await page.waitForSelector('#storyDuelIntroOverlay.show', { timeout: 12000 });
  await page.click('#storyDuelStartBtn');
  await page.waitForSelector('#gameScreen.show', { timeout: 12000 });
}

async function forceStoryWin(page) {
  await page.evaluate(() => {
    Game.V.hp = 0;
    endGame(Game.V);
  });
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(200);
    if (await page.locator('#storyPanelScreen.show #storyPanelNext:not([hidden])').count()) {
      await page.click('#storyPanelNext');
      continue;
    }
    if (await page.locator('#storyRewardOverlay.show').count()) {
      await page.click('#storyRewardOk');
      break;
    }
    if (await page.locator('#storyMapScreen.show').count()) break;
  }
  await page.waitForSelector('#storyMapScreen.show', { timeout: 15000 });
}

let failed = false;
const fail = (msg) => {
  console.error('FAIL:', msg);
  failed = true;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
const page = await ctx.newPage();
page.on('pageerror', (e) => fail(`pageerror: ${e.message}`));

await setupHarryProfile(page);

// Capítulo 1: cuento + duelo vs Crabbe
await startStoryBattle(page, 'n01');
await page.screenshot({ path: join(shotDir, '390x844-story-duel-intro-n01.png') });
const y0 = await page.evaluate(() => Game.P?.cur?.y);
await page.waitForTimeout(2500);
const y1 = await page.evaluate(() => Game.P?.cur?.y);
const dual = await page.evaluate(
  () =>
    Game.running &&
    !!Game.P?.cur &&
    !!Game.V?.cur &&
    document.getElementById('vBoard')?.offsetWidth > 20
);
if (!dual || y0 === y1) fail('n01 duel must run with rival board');
await page.screenshot({ path: join(shotDir, '390x844-story-duel-midgame.png') });
await page.click('#backBtn');
await page.waitForSelector('#storyMapScreen.show');
let prog = await progress(page);
if (prog.completed.includes('n01')) fail('quit n01 must not complete');

await startStoryBattle(page, 'n01');
await forceStoryWin(page);
prog = await progress(page);
if (!prog.completed.includes('n01') || prog.nodeId !== 'n02') {
  fail(`n01 win → n02: ${JSON.stringify(prog)}`);
}

// Capítulo 2
await startStoryBattle(page, 'n02');
await forceStoryWin(page);
prog = await progress(page);
if (!prog.completed.includes('n02') || prog.nodeId !== 'n03') {
  fail(`n02 win → n03: ${JSON.stringify(prog)}`);
}

// Capítulo 3 elección bosque → n04f duelo Goyle (+ Lumos)
await page.evaluate(() => StoryMode.startNodeFlow('n03'));
await page.waitForSelector('#storyChoiceRow:not([hidden])');
await pickChoice(page, 'A');
await page.waitForSelector('#storyDuelIntroOverlay.show', { timeout: 12000 });
await page.screenshot({ path: join(shotDir, '390x844-story-duel-intro-n04f.png') });
await page.click('#storyDuelStartBtn');
await page.waitForSelector('#gameScreen.show');
await forceStoryWin(page);
prog = await progress(page);
if (!prog.completed.includes('n04f') || !prog.spells.includes('lumos')) {
  fail(`n04f win grants lumos: ${JSON.stringify(prog)}`);
}
if (prog.nodeId !== 'n06') {
  fail(`n04f win should skip to n06 (not n05f): ${JSON.stringify(prog)}`);
}
await page.screenshot({ path: join(shotDir, '390x844-story-reward-after-win.png') });

// Releer n01 no mueve frontera
await startNode(page, 'n01');
if (await page.locator('#storyDuelIntroOverlay.show').count()) {
  await page.click('#storyDuelIntroBack');
  await page.waitForSelector('#storyMapScreen.show');
}
prog = await progress(page);
if (prog.nodeId !== 'n06') fail(`replay n01 keeps frontier: ${JSON.stringify(prog)}`);

// Modo normal sigue funcionando
await page.evaluate(() => {
  Game.storyMode = false;
  show('modeScreen');
});
await page.click('#btnModeNormal');
await page.waitForSelector('#selScreen.show');
await page.evaluate(() => {
  sel.hero = 'harry';
  sel.villain = 'goyle';
  startGame();
});
await page.waitForSelector('#gameScreen.show');
if (!(await page.evaluate(() => Game.running && !Game.storyMode && !!Game.V?.cur))) {
  fail('normal mode duel did not start');
}

await ctx.close();
await browser.close();
server.close();

if (failed) process.exit(1);
console.log('story-duel-progress: OK');