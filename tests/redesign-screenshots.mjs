import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'screenshots', 'redesign');
mkdirSync(outDir, { recursive: true });
const url = 'file://' + join(root, 'index.html');

const sizes = [
  { name: '375x667', width: 375, height: 667, minCell: 12, touch: true },
  { name: '390x844', width: 390, height: 844, minCell: 16, touch: true },
  { name: '844x390', width: 844, height: 390, touch: true },
  { name: '820x1180', width: 820, height: 1180, touch: true },
  { name: '1180x820', width: 1180, height: 820, touch: true },
  { name: '1180x700', width: 1180, height: 700, touch: true },
  { name: '1024x768', width: 1024, height: 768, touch: true },
  { name: '1194x834', width: 1194, height: 834, touch: true },
  { name: '1440x900', width: 1440, height: 900, touch: false },
  { name: '1920x1080', width: 1920, height: 1080, touch: false },
];

function rectsOverlap(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

async function enterNormalMode(page) {
  await page.waitForSelector('#modeScreen, #selScreen', { timeout: 15000 });
  if (await page.locator('#modeScreen.show').count()) {
    await page.locator('#btnModeNormal').click();
    await page.waitForFunction(
      () => document.getElementById('selScreen')?.classList.contains('show'),
      null,
      { timeout: 15000 }
    );
  }
}

async function prep(page) {
  await page.addInitScript(() => {
    localStorage.setItem('thp_music', 'off');
    localStorage.removeItem('thp_story_v1');
    localStorage.removeItem('thp_profiles_v2');
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await enterNormalMode(page);
}

async function startDuel(page) {
  await page.evaluate(() => {
    document.querySelector('#heroCards .card')?.click();
    document.querySelector('#villainCards .card')?.click();
  });
  await page.evaluate(() => document.getElementById('playBtn')?.click());
  await page.waitForSelector('#gameScreen.show', { timeout: 15000 });
  await page.waitForTimeout(4500);
  await page.evaluate(async () => {
    if (window.G?.P) {
      for (let i = 0; i < 8; i++) window.G.P.cur && (window.G.P.cur.y += 1);
      window.fitBoards?.();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      window.fitBoards?.();
    }
  });
  await page.waitForTimeout(400);
}

function assertLayout(page, name, phase, minCell) {
  return page.evaluate(
    ({ label, minCell: minC }) => {
      const issues = [];
      const iw = window.innerWidth;
      const ih = window.innerHeight;
      const sw = document.documentElement.scrollWidth;
      if (sw > iw + 1) {
        issues.push(`${label}: overflow horizontal scrollWidth=${sw} > innerWidth=${iw}`);
      }
      const intersects = (a, b) =>
        !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
      if (!document.getElementById('gameScreen')?.classList.contains('show')) return { issues, cell: null };
      const cv = document.getElementById('pBoard');
      const dock = document.getElementById('touchDock');
      const dockVis = dock && getComputedStyle(dock).display !== 'none';
      let cell = null;
      if (cv) {
        cell = cv.getBoundingClientRect().height / 20;
      }
      if (cv && dockVis) {
        const cr = cv.getBoundingClientRect();
        const dr = dock.getBoundingClientRect();
        const fr = cv.closest('.boardFrame')?.getBoundingClientRect();
        const stackBottom = Math.max(cr.bottom, fr?.bottom ?? cr.bottom);
        if (stackBottom > dr.top + 2) {
          issues.push(
            `${label}: tablero solapa dock (borde inferior ${stackBottom.toFixed(1)} > dock top ${dr.top.toFixed(1)})`
          );
        }
        if (fr) {
          const slack = fr.height - cr.height;
          if (slack > 22) {
            issues.push(
              `${label}: marco más alto que canvas (exceso ${slack.toFixed(1)}px)`
            );
          }
        }
        const layout = document.body.dataset.layout;
        if (layout === 'phone-p' && minC != null && cell < minC - 0.25) {
          issues.push(`${label}: celda ${cell.toFixed(1)}px < mínimo ${minC}px`);
        }
      }
      if (label.endsWith('-duel')) {
        const layout = document.body.dataset.layout;
        if (layout === 'phone-l' || layout === 'touch-l') {
          for (const id of ['pFrame', 'vFrame']) {
            const fr = document.getElementById(id);
            if (!fr) continue;
            const b = fr.getBoundingClientRect().bottom;
            if (b > ih + 1) {
              issues.push(`${label}: ${id} bottom ${b.toFixed(1)} > innerHeight ${ih}`);
            }
          }
        }
        if (['touch-l', 'phone-l', 'desktop', 'tablet'].includes(layout)) {
          const pFr = document.getElementById('pFrame')?.getBoundingClientRect();
          const vFr = document.getElementById('vFrame')?.getBoundingClientRect();
          if (pFr && vFr) {
            const d = (a, b) => Math.abs(a - b);
            if (d(pFr.top, vFr.top) > 1) {
              issues.push(
                `${label}: pFrame/vFrame top Δ=${d(pFr.top, vFr.top).toFixed(2)} (${pFr.top.toFixed(1)} vs ${vFr.top.toFixed(1)})`
              );
            }
            if (d(pFr.bottom, vFr.bottom) > 1) {
              issues.push(
                `${label}: pFrame/vFrame bottom Δ=${d(pFr.bottom, vFr.bottom).toFixed(2)}`
              );
            }
            if (d(pFr.width, vFr.width) > 1) {
              issues.push(
                `${label}: pFrame/vFrame width Δ=${d(pFr.width, vFr.width).toFixed(2)}`
              );
            }
            if (d(pFr.height, vFr.height) > 1) {
              issues.push(
                `${label}: pFrame/vFrame height Δ=${d(pFr.height, vFr.height).toFixed(2)}`
              );
            }
          }
          const pp = document.querySelector('.player-panel')?.getBoundingClientRect();
          const vp = document.querySelector('.rival-panel')?.getBoundingClientRect();
          if (pp && vp && Math.abs(pp.top - vp.top) > 1) {
            issues.push(
              `${label}: paneles top Δ=${Math.abs(pp.top - vp.top).toFixed(2)}`
            );
          }
        }
        if (layout === 'phone-l' && label.endsWith('-duel')) {
          const hud = document.getElementById('mobileHudScore');
          if (hud && !hud.hasAttribute('hidden')) {
            const hr = hud.getBoundingClientRect();
            for (const id of ['backBtn', 'gameMenuBtn']) {
              const btn = document.getElementById(id);
              if (!btn) continue;
              const br = btn.getBoundingClientRect();
              if (intersects(hr, br)) {
                issues.push(
                  `${label}: HUD solapa #${id} (HUD ${hr.left.toFixed(0)}-${hr.right.toFixed(0)} vs btn ${br.left.toFixed(0)}-${br.right.toFixed(0)})`
                );
              }
            }
          }
        }
        if (iw > ih) {
          const frames = ['pFrame', 'vFrame']
            .map((id) => document.getElementById(id)?.getBoundingClientRect())
            .filter(Boolean);
          const panelEls =
            layout === 'touch-l'
              ? [...document.querySelectorAll('#gameScreen .rival-panel')]
              : [...document.querySelectorAll('#gameScreen .panel')];
          const panels = panelEls.map((el) => el.getBoundingClientRect());
          const targets = [...frames, ...panels];
          const btns = [
            ...document.querySelectorAll(
              '#touchDock .tbtn, #touchL .tbtn, #touchR .tbtn, #touchPad .tbtn'
            ),
          ];
          for (const btn of btns) {
            const br = btn.getBoundingClientRect();
            if (br.width < 2 || br.height < 2) continue;
            for (const tr of targets) {
              if (intersects(br, tr)) {
                issues.push(
                  `${label}: control táctil solapa juego (botón ${btn.getAttribute('data-a') || '?'})`
                );
              }
            }
          }
        }
      }
      return { issues, cell };
    },
    { label: `${name}-${phase}`, minCell }
  );
}

const browser = await chromium.launch();
const errors = [];
const cellReport = [];

for (const s of sizes) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    hasTouch: s.touch !== false,
    isMobile: s.touch !== false,
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${s.name} page: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${s.name} console: ${msg.text()}`);
  });
  await prep(page);
  const sel = await assertLayout(page, s.name, 'selection');
  errors.push(...sel.issues);
  await page.screenshot({ path: join(outDir, `${s.name}-selection.png`) });
  await startDuel(page);
  const duel = await assertLayout(page, s.name, 'duel', s.minCell);
  errors.push(...duel.issues);
  if (duel.cell != null) {
    const layout = await page.evaluate(() => document.body.dataset.layout);
    const row = {
      viewport: s.name,
      layout,
      cellPx: Math.round(duel.cell * 10) / 10,
      boardW: Math.round(duel.cell * 10),
      boardH: Math.round(duel.cell * 20),
    };
    if (['touch-l', 'phone-l', 'desktop', 'tablet'].includes(layout)) {
      row.frames = await page.evaluate(() => {
        const r = (id) => {
          const fr = document.getElementById(id)?.getBoundingClientRect();
          if (!fr) return null;
          return {
            top: +fr.top.toFixed(2),
            bottom: +fr.bottom.toFixed(2),
            width: +fr.width.toFixed(2),
            height: +fr.height.toFixed(2),
          };
        };
        return { pFrame: r('pFrame'), vFrame: r('vFrame') };
      });
    }
    cellReport.push(row);
  }
  await page.screenshot({ path: join(outDir, `${s.name}-duel.png`) });
  if (s.touch) {
    const dock = page.locator('#touchDock');
    if (await dock.isVisible().catch(() => false)) {
      await page.locator('#touch .tbtn[data-a="right"]').first().tap();
    }
  }
  await ctx.close();
}

const storySizes = [
  { name: '390x844', width: 390, height: 844, touch: true },
  { name: '844x390', width: 844, height: 390, touch: true },
  { name: '1180x820', width: 1180, height: 820, touch: true },
  { name: '1440x900', width: 1440, height: 900, touch: false },
];
const storyDir = join(outDir, 'story');
mkdirSync(storyDir, { recursive: true });

for (const s of storySizes) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    hasTouch: s.touch !== false,
    isMobile: s.touch !== false,
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('thp_music', 'off'));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.screenshot({ path: join(storyDir, `${s.name}-mode.png`) });
  await page.click('#btnModeStory');
  await page.waitForSelector('#profileScreen.show', { timeout: 10000 });
  await page.screenshot({ path: join(storyDir, `${s.name}-profile.png`) });
  if (s.name === '390x844') await page.screenshot({ path: join(storyDir, `${s.name}-profile-v2.png`) });
  await page.evaluate(() => {
    const p = window.ProfileStore.createProfile('Emilia');
    window.StoryMode.onProfilePicked(p);
  });
  await page.waitForFunction(
    () =>
      document.getElementById('storyHeroScreen')?.classList.contains('show') ||
      document.getElementById('storyMapScreen')?.classList.contains('show'),
    null,
    { timeout: 20000 }
  );
  if (await page.locator('#storyHeroScreen.show').count()) {
    await page.evaluate(() =>
      document.querySelector('#storyHeroCards .story-hero-card:not([disabled])')?.click()
    );
    await page.click('#storyMapContinue');
    await page.waitForSelector('#storyMapScreen.show', { timeout: 15000 });
  }
  await page.evaluate(() => {
    const prog = window.ProfileStore.getProgress();
    prog.completedNodes = ['n01', 'n02'];
    prog.nodeId = 'n03';
    window.ProfileStore.setProgress(prog);
  });
  await page.screenshot({ path: join(storyDir, `${s.name}-story-map.png`) });
  await page.evaluate(() => StoryMode.startNodeFlow('n03'));
  await page.waitForSelector('#storyPanelScreen.show', { timeout: 5000 });
  await page.waitForSelector('#storyChoiceRow:not([hidden])', { timeout: 5000 });
  await page.screenshot({ path: join(storyDir, `${s.name}-story-choice.png`) });
  if (s.name === '390x844') await page.screenshot({ path: join(storyDir, `${s.name}-story-choice-v2.png`) });
  const artBlank = await page.evaluate(() => {
    const html = document.getElementById('storyPanelArt')?.innerHTML || '';
    return window.StoryScenes?.sceneLooksBlank?.(html) ?? html.length < 120;
  });
  if (artBlank) errors.push(`${s.name}-story-choice: panel art looks blank`);
  await page.evaluate(() => {
    StoryMode.showStoryPanels(
      [{ art: 'tunnel', lines: ['Emilia, un cuento especial comienza.', 'Toca siguiente para seguir.'] }],
      () => {}
    );
  });
  await page.waitForSelector('#storyPanelScreen.show', { timeout: 5000 });
  await page.screenshot({ path: join(storyDir, `${s.name}-story-scene.png`) });
  if (s.name === '390x844') await page.screenshot({ path: join(storyDir, `${s.name}-story-scene-v2.png`) });
  if (s.name === '1180x820') await page.screenshot({ path: join(storyDir, `${s.name}-story-scene-v2.png`) });
  const sceneBlank = await page.evaluate(() => {
    const html = document.getElementById('storyPanelArt')?.innerHTML || '';
    return window.StoryScenes?.sceneLooksBlank?.(html) ?? html.length < 120;
  });
  if (sceneBlank) errors.push(`${s.name}-story-scene: panel art looks blank`);
  await page.evaluate(() => {
    document.querySelectorAll('.screen').forEach((el) => el.classList.remove('show'));
    const card = document.getElementById('storyRewardOverlay');
    card.classList.add('show');
    document.getElementById('storyRewardTitle').textContent = '¡Nueva magia!';
    document.getElementById('storyRewardIcon').textContent = '💡';
    document.getElementById('storyRewardName').textContent = 'Lumos';
    document.getElementById('storyRewardEffect').textContent =
      'Cada línea te da un poquito de magia (+3 vida).';
    document.getElementById('storyRewardLvl').textContent = '¡Nivel 2!';
  });
  await page.screenshot({ path: join(storyDir, `${s.name}-story-reward.png`) });
  if (s.name === '390x844') await page.screenshot({ path: join(storyDir, `${s.name}-story-reward-v2.png`) });
  await page.evaluate(() => {
    document.getElementById('storyRewardOverlay').classList.remove('show');
    StoryMode.startStoryDuel({
      id: 'n05f',
      villainId: 'goyle',
      bossName: 'Un troll torpe',
      spell: 'lumos',
      rewardTitle: '¡Nueva magia!',
      intro: [{ art: 'troll', lines: ['¡Duelo de prueba!'] }],
      outro: [{ art: 'victory', lines: ['¡Ganaste!'] }],
    });
  });
  await page.waitForSelector('#gameScreen.show', { timeout: 15000 });
  await page.waitForTimeout(4000);
  await page.evaluate(async () => {
    window.fitBoards?.();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    window.fitBoards?.();
  });
  await assertLayout(page, s.name, 'story-duel', null);
  await page.screenshot({ path: join(storyDir, `${s.name}-story-duel.png`) });
  await ctx.close();
}

await browser.close();
const flat = errors.filter((e) => typeof e === 'string' && e.length > 0);
const n = sizes.length * 2;
console.log('Saved to', outDir);
console.log('\nTamaño de celda (duelo):');
for (const r of cellReport) {
  let line = `  ${r.viewport} [${r.layout}]: ${r.cellPx}px/celda (tablero ~${r.boardW}×${r.boardH}px)`;
  if (r.frames?.pFrame && r.frames?.vFrame) {
    const p = r.frames.pFrame;
    const v = r.frames.vFrame;
    line += `\n    pFrame t=${p.top} b=${p.bottom} ${p.width}×${p.height}`;
    line += `\n    vFrame t=${v.top} b=${v.bottom} ${v.width}×${v.height}`;
  }
  console.log(line);
}
if (flat.length) {
  console.error(flat.join('\n'));
  process.exit(1);
}
console.log(`\nCapturas historia en ${storyDir} (${storySizes.length * 7} imágenes)`);
console.log(`\nOK — aserciones de layout (${n} capturas + historia)`);