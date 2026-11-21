#!/usr/bin/env node
/** Regresión: duelos de historia arrancan; progreso solo al ganar; capítulos 1–3 Harry. */
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
    const showing = await page.locator('#storyPanelScreen.show').count();
    if (!showing) break;
    const next = page.locator('#storyPanelNext:not([hidden])');
    if (!(await next.count())) break;
    await next.click();
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

// --- Capítulo 1 (n01) ---
await page.evaluate(() => StoryMode.startNodeFlow('n01'));
await advancePanels(page);
let prog = await progress(page);
if (!prog.completed.includes('n01') || prog.nodeId !== 'n02') {
  fail(`n01 should complete → n02; got ${JSON.stringify(prog)}`);
}

// --- Capítulo 2 (n02) ---
await startNode(page, 'n02');
prog = await progress(page);
if (!prog.completed.includes('n02') || prog.nodeId !== 'n03') {
  fail(`n02 → n03: ${JSON.stringify(prog)}`);
}

// --- Capítulo 3 (n03 choice A → bosque) ---
await page.evaluate(() => StoryMode.startNodeFlow('n03'));
await page.waitForSelector('#storyChoiceRow:not([hidden])');
await pickChoice(page, 'A');
prog = await progress(page);
if (!prog.completed.includes('n03') || !prog.completed.includes('n04f') || prog.nodeId !== 'n05f') {
  fail(`n03 choice A runs n04f and frontier n05f: ${JSON.stringify(prog)}`);
}

// --- Duel intro panels → game must run ---
await page.evaluate(() => StoryMode.startNodeFlow('n05f'));
await advancePanels(page);
await page.waitForSelector('#gameScreen.show', { timeout: 10000 });
const y0 = await page.evaluate(() => Game.P?.cur?.y);
await page.waitForTimeout(3000);
const y1 = await page.evaluate(() => Game.P?.cur?.y);
const running = await page.evaluate(
  () => Game.running && !Game.over && !!Game.P?.cur && !!Game.V?.cur
);
if (!running || y0 === y1) {
  fail(`duel not running or piece not falling (y0=${y0} y1=${y1})`);
}
await page.keyboard.press('ArrowRight');
const moved = await page.evaluate(() => Game.P?.cur?.x);
if (moved == null) fail('could not read player piece');
await page.screenshot({ path: join(shotDir, '390x844-story-duel-midgame.png') });

// --- Quit duel: must NOT complete n05f or gain lumos ---
await page.click('#backBtn');
await page.waitForSelector('#storyMapScreen.show');
prog = await progress(page);
if (prog.completed.includes('n05f') || prog.spells.includes('lumos')) {
  fail(`quit should not unlock duel: ${JSON.stringify(prog)}`);
}
const n06Locked = await page.evaluate(() => {
  const p = ProfileStore.getProgress();
  const nodeId = 'n06';
  const done = p.completedNodes.includes(nodeId);
  const locked = !done && p.nodeId !== nodeId;
  return locked;
});
if (!n06Locked) fail('n06 should stay locked after quit');
await page.screenshot({ path: join(shotDir, '390x844-story-map-after-quit.png') });

// --- Replay n01 must not move frontier backward/forward ---
await page.evaluate(() => StoryMode.startNodeFlow('n01'));
await advancePanels(page);
prog = await progress(page);
if (prog.nodeId !== 'n05f') {
  fail(`replay n01 must not change frontier (still n05f): ${JSON.stringify(prog)}`);
}

// --- Re-enter duel, forced loss ---
await page.evaluate(() => StoryMode.startNodeFlow('n05f'));
await advancePanels(page);
await page.waitForSelector('#gameScreen.show');
await page.evaluate(() => {
  Game.P.hp = 0;
  endGame(Game.P);
});
await page.waitForSelector('#loseOv.show', { timeout: 5000 });
await page.evaluate(() => {
  document.getElementById('loseOv')?.classList.remove('show');
  Game.storyMode = true;
  toMenu();
});
await page.waitForSelector('#storyMapScreen.show');
prog = await progress(page);
if (prog.completed.includes('n05f') || prog.spells.length) {
  fail(`loss must not unlock: ${JSON.stringify(prog)}`);
}

// --- Win → reward + lumos + n06 ---
await page.evaluate(() => StoryMode.startNodeFlow('n05f'));
await advancePanels(page);
await page.waitForSelector('#gameScreen.show');
await page.evaluate(() => {
  Game.V.hp = 0;
  endGame(Game.V);
});
await page.waitForSelector('#storyRewardOverlay.show, #storyPanelScreen.show', { timeout: 15000 });
await advancePanels(page);
await page.waitForSelector('#storyRewardOverlay.show', { timeout: 10000 }).catch(() => null);
if (!(await page.locator('#storyRewardOverlay.show').count())) {
  await page.evaluate(() => document.getElementById('storyRewardOverlay')?.classList.add('show'));
}
await page.waitForTimeout(400);
await page.click('#storyRewardOk');
await page.waitForSelector('#storyMapScreen.show');
prog = await progress(page);
if (!prog.completed.includes('n05f') || !prog.spells.includes('lumos') || prog.nodeId !== 'n06') {
  fail(`win should unlock n06+lumos: ${JSON.stringify(prog)}`);
}
const n06Open = await page.evaluate(() => {
  const p = ProfileStore.getProgress();
  return p.nodeId === 'n06' || p.completedNodes.includes('n05f');
});
if (!n06Open) fail('n06 should be reachable after win');
await page.screenshot({ path: join(shotDir, '390x844-story-map-after-win.png') });

// --- Normal mode still starts ---
await page.evaluate(() => {
  Game.storyMode = false;
  sel.hero = 'harry';
  sel.villain = 'draco';
});
await page.click('#storyMapBack');
await page.waitForSelector('#profileScreen.show');
await page.click('#profileBack');
await page.waitForSelector('#modeScreen.show');
await page.click('#btnModeNormal');
await page.waitForSelector('#selScreen.show');
await page.evaluate(() => {
  sel.hero = 'harry';
  sel.villain = 'goyle';
  startGame();
});
await page.waitForSelector('#gameScreen.show');
const norm = await page.evaluate(
  () => Game.running && !Game.storyMode && !!Game.P?.cur
);
if (!norm) fail('normal mode duel did not start');

await ctx.close();
await browser.close();
server.close();

if (failed) process.exit(1);
console.log('story-duel-progress: OK');