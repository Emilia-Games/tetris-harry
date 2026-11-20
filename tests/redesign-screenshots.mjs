import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'screenshots', 'redesign');
mkdirSync(outDir, { recursive: true });
const url = 'file://' + join(root, 'index.html');

const sizes = [
  { name: '375x667', width: 375, height: 667, minCell: 12 },
  { name: '390x844', width: 390, height: 844, minCell: 16 },
  { name: '844x390', width: 844, height: 390 },
  { name: '820x1180', width: 820, height: 1180 },
  { name: '1180x820', width: 1180, height: 820 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];

async function prep(page) {
  await page.addInitScript(() => {
    localStorage.setItem('thp_music', 'off');
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
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
      const sw = document.documentElement.scrollWidth;
      if (sw > iw + 1) {
        issues.push(`${label}: overflow horizontal scrollWidth=${sw} > innerWidth=${iw}`);
      }
      if (!document.getElementById('gameScreen')?.classList.contains('show')) return { issues, cell: null };
      const cv = document.getElementById('pBoard');
      const dock = document.getElementById('touchDock');
      const dockVis = dock && getComputedStyle(dock).display !== 'none';
      let cell = null;
      if (cv) {
        const rows = 20;
        cell = cv.getBoundingClientRect().height / rows;
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
              `${label}: marco más alto que canvas (exceso ${slack.toFixed(1)}px, frame ${fr.height.toFixed(1)} vs canvas ${cr.height.toFixed(1)})`
            );
          }
        }
        const rows = 20;
        cell = cr.height / rows;
        const layout = document.body.dataset.layout;
        if (layout === 'phone-p' && minC != null && cell < minC - 0.25) {
          issues.push(`${label}: celda ${cell.toFixed(1)}px < mínimo ${minC}px`);
        }
      }
      if (label.endsWith('-duel') && document.body.dataset.layout === 'phone-l') {
        const vh = window.innerHeight;
        for (const id of ['pFrame', 'vFrame']) {
          const fr = document.getElementById(id);
          if (!fr) continue;
          const b = fr.getBoundingClientRect().bottom;
          if (b > vh + 1) {
            issues.push(`${label}: ${id} bottom ${b.toFixed(1)} > innerHeight ${vh}`);
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
    hasTouch: s.width < 900,
    isMobile: s.width < 900,
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
    cellReport.push({
      viewport: s.name,
      cellPx: Math.round(duel.cell * 10) / 10,
      boardW: Math.round(duel.cell * 10),
      boardH: Math.round(duel.cell * 20),
    });
  }
  await page.screenshot({ path: join(outDir, `${s.name}-duel.png`) });
  if (s.width < 900) {
    const dock = page.locator('#touchDock');
    if (await dock.isVisible().catch(() => false)) {
      await page.locator('#touch .tbtn[data-a="right"]').first().tap();
    }
  }
  await ctx.close();
}

await browser.close();
const flat = errors.filter((e) => typeof e === 'string' && e.length > 0);
console.log('Saved to', outDir);
console.log('\nTamaño de celda (duelo):');
for (const r of cellReport) {
  console.log(`  ${r.viewport}: ${r.cellPx}px/celda (tablero ~${r.boardW}×${r.boardH}px)`);
}
if (flat.length) {
  console.error(flat.join('\n'));
  process.exit(1);
}
console.log('\nOK — aserciones de layout (14 capturas)');