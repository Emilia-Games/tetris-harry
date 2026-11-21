"use strict";
/* Modo Historia — perfiles, ramas y episodios por héroe (StoryData) */

const STORY_SVG = {
  tunnel: `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg"><rect fill="#1a1148" width="400" height="280"/><rect y="200" width="400" height="80" fill="#2b1650"/><path d="M0 200 Q200 120 400 200" fill="#3b2a8a"/><ellipse cx="200" cy="230" rx="120" ry="40" fill="#0a0824"/><text x="200" y="190" text-anchor="middle" fill="#ffd86b" font-size="42">🧱</text></svg>`,
  troll: `<svg viewBox="0 0 400 280"><rect fill="#2b1650" width="400" height="280"/><circle cx="200" cy="130" r="70" fill="#8b7355"/><text x="200" y="255" text-anchor="middle" fill="#ffd86b">Troll</text></svg>`,
  winCastle: `<svg viewBox="0 0 400 280"><rect fill="#0a0824" width="400" height="280"/><path d="M0 220 L200 100 L400 220 L400 280 L0 280Z" fill="#2b1650"/><text x="200" y="250" text-anchor="middle" fill="#ffd86b" font-size="28">🏰</text></svg>`,
  corridor: `<svg viewBox="0 0 400 280"><rect fill="#1a1148" width="400" height="280"/><rect x="60" y="40" width="280" height="200" fill="#2b1650"/></svg>`,
  duelWin: `<svg viewBox="0 0 400 280"><rect fill="#1a1148" width="400" height="280"/><text x="200" y="160" text-anchor="middle" font-size="56">⚡✨</text></svg>`,
  classroom: `<svg viewBox="0 0 400 280"><rect fill="#2b1650" width="400" height="280"/><rect x="40" y="60" width="320" height="160" rx="12" fill="#4a3a9a"/></svg>`,
  mirror: `<svg viewBox="0 0 400 280"><rect fill="#0a0824" width="400" height="280"/><ellipse cx="200" cy="130" rx="100" ry="120" fill="#9fe3ff" opacity=".35" stroke="#ffd86b" stroke-width="4"/></svg>`,
  chamber: `<svg viewBox="0 0 400 280"><rect fill="#0b0820" width="400" height="280"/><path d="M50 250 Q200 50 350 250" fill="none" stroke="#4be37a" stroke-width="8"/><text x="200" y="130" font-size="64" text-anchor="middle">🐍</text></svg>`,
  basilisk: `<svg viewBox="0 0 400 280"><rect fill="#1a1148" width="400" height="280"/><ellipse cx="200" cy="150" rx="120" ry="40" fill="#1a7a3f"/></svg>`,
  forest: `<svg viewBox="0 0 400 280"><rect fill="#0a2a1a" width="400" height="280"/><polygon points="200,250 220,80 240,250" fill="#2ecc71"/></svg>`,
  dementor: `<svg viewBox="0 0 400 280"><rect fill="#050318" width="400" height="280"/><ellipse cx="200" cy="120" rx="70" ry="90" fill="#111"/></svg>`,
  patronusLight: `<svg viewBox="0 0 400 280"><rect fill="#0a0824" width="400" height="280"/><text x="200" y="155" text-anchor="middle" font-size="72">🦌</text></svg>`,
  tower: `<svg viewBox="0 0 400 280"><rect fill="#1a1148" width="400" height="280"/><rect x="150" y="60" width="100" height="170" fill="#3b2a8a"/><polygon points="140,60 200,10 260,60" fill="#2b1650"/></svg>`,
  stars: `<svg viewBox="0 0 400 280"><rect fill="#0a0824" width="400" height="280"/><text x="200" y="150" text-anchor="middle" font-size="48">⭐</text></svg>`,
  darkMark: `<svg viewBox="0 0 400 280"><rect fill="#050318" width="400" height="280"/><path d="M200 40 Q260 100 200 160 Q140 100 200 40" fill="none" stroke="#7dffb0" stroke-width="6"/></svg>`,
  friends: `<svg viewBox="0 0 400 280"><rect fill="#1a1148" width="400" height="280"/><circle cx="120" cy="150" r="40" fill="#b3001b"/><circle cx="200" cy="150" r="40" fill="#1e3a8a"/><circle cx="280" cy="150" r="40" fill="#ffcf6b"/></svg>`,
  finalDuel: `<svg viewBox="0 0 400 280"><rect fill="#2b1650" width="400" height="280"/><text x="200" y="120" text-anchor="middle" font-size="56">⚡</text></svg>`,
  voldemort: `<svg viewBox="0 0 400 280"><rect fill="#0b0820" width="400" height="280"/><ellipse cx="200" cy="130" rx="55" ry="60" fill="#e8e0d0"/></svg>`,
  victory: `<svg viewBox="0 0 400 280"><rect fill="#1a1148" width="400" height="280"/><text x="200" y="100" text-anchor="middle" font-size="64">🎉</text></svg>`,
  feast: `<svg viewBox="0 0 400 280"><rect fill="#2b1650" width="400" height="280"/><rect x="40" y="160" width="320" height="60" rx="8" fill="#8b5a2b"/></svg>`,
  library: `<svg viewBox="0 0 400 280"><rect fill="#1a1148" width="400" height="280"/><rect x="50" y="50" width="300" height="180" fill="#4a3a9a"/><text x="200" y="160" text-anchor="middle" font-size="48">📚</text></svg>`,
  bridge: `<svg viewBox="0 0 400 280"><rect fill="#0a0824" width="400" height="280"/><path d="M40 200 Q200 80 360 200" stroke="#9fe3ff" stroke-width="10" fill="none"/></svg>`,
  kitchen: `<svg viewBox="0 0 400 280"><rect fill="#2b1650" width="400" height="280"/><circle cx="120" cy="140" r="35" fill="#ffcf6b"/><circle cx="280" cy="140" r="35" fill="#ff9f43"/></svg>`,
  garden: `<svg viewBox="0 0 400 280"><rect fill="#0a2a1a" width="400" height="280"/><circle cx="200" cy="140" r="60" fill="#2ecc71" opacity=".5"/></svg>`,
};

const Story = { activeNode: null, pendingReward: null, panelQueue: [], panelIdx: 0, onPanelsDone: null };

function data() {
  return window.StoryData;
}

function progress() {
  return window.ProfileStore?.getProgress?.();
}

function playerName() {
  return window.ProfileStore?.activeProfile?.()?.name || "mago";
}

function saveProgress() {
  window.ProfileStore?.setProgress?.(progress());
}

function defaultProgress() {
  return window.ProfileStore?.defaultStoryProgress?.() || {
    heroId: null,
    nodeId: "n01",
    completedNodes: [],
    branches: {},
    spells: [],
    wins: 0,
    completed: false,
  };
}

function loadStoryProgress() {
  const p = progress();
  if (!p) return defaultProgress();
  if (!p.nodeId) p.nodeId = "n01";
  if (!p.completedNodes) p.completedNodes = [];
  if (!p.branches) p.branches = {};
  if (!p.spells) p.spells = [];
  return p;
}

function heroContent(nodeId) {
  const p = loadStoryProgress();
  const heroId = p.heroId;
  if (!heroId || !data()?.MASTER_STORIES?.[heroId]) return null;
  return data().MASTER_STORIES[heroId][nodeId] || null;
}

function nodeMeta(nodeId) {
  return data()?.GRAPH_NODES?.[nodeId] || null;
}

function personalize(lines) {
  return window.ProfileStore?.personalizePanels?.(
    [{ lines }],
    playerName()
  )[0].lines;
}

function resolveChapterBattle(nodeId) {
  const meta = nodeMeta(nodeId);
  const battle = data().STORY_NODE_BATTLE?.[nodeId] || {};
  const villainId = meta?.villainId || battle.villainId;
  if (!villainId) return null;
  return {
    villainId,
    spell: meta?.spell || battle.spell,
    rewardTitle: meta?.rewardTitle || battle.rewardTitle,
    finale: !!(meta?.finale || battle.finale),
    displayName: battle.displayName,
  };
}

function panelSceneMeta(nodeId) {
  const p = loadStoryProgress();
  const c = heroContent(nodeId);
  const battle = resolveChapterBattle(nodeId);
  return {
    heroId: p.heroId,
    villainId: battle?.villainId,
    bossName: c?.bossName || battle?.displayName,
  };
}

function paintScene(art, meta) {
  if (window.StoryScenes?.renderStoryScene) {
    return window.StoryScenes.renderStoryScene(art, meta || {});
  }
  return `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg"><rect fill="#1a1148" width="400" height="280"/></svg>`;
}

function panelsFrom(nodeId, extra) {
  const c = heroContent(nodeId);
  if (!c) return extra || [];
  const scene = panelSceneMeta(nodeId);
  return [
    {
      art: c.art,
      lines: personalize(c.lines),
      heroId: scene.heroId,
      villainId: scene.villainId,
      bossName: scene.bossName,
    },
  ];
}

function canEnterNode(nodeId, p) {
  if (!p) p = loadStoryProgress();
  if (p.completedNodes.includes(nodeId)) return true;
  const cur = p.nodeId || data().START_NODE || "n01";
  return nodeId === cur;
}

/** Solo nodos sin combate (p. ej. elección pura). El resto avanza en handleStoryWin. */
function completeNarrativeNode(nodeId) {
  const p = loadStoryProgress();
  const meta = nodeMeta(nodeId);
  if (!meta || meta.type === "duel" || resolveChapterBattle(nodeId)) return;
  const cur = p.nodeId || data().START_NODE || "n01";
  if (nodeId !== cur) return;
  if (!p.completedNodes.includes(nodeId)) p.completedNodes.push(nodeId);
  if (meta.next) p.nodeId = meta.next;
  saveProgress();
}

function shouldAutoSkipBattleNode(wonId, candidateId) {
  const won = resolveChapterBattle(wonId);
  const cand = resolveChapterBattle(candidateId);
  const cm = nodeMeta(candidateId);
  return (
    !!won?.villainId &&
    !!cand?.villainId &&
    won.villainId === cand.villainId &&
    cm?.type === "duel"
  );
}

function nextChapterAfterWin(nodeId) {
  let next = nodeMeta(nodeId)?.next;
  const p = loadStoryProgress();
  while (next && shouldAutoSkipBattleNode(nodeId, next)) {
    if (!p.completedNodes.includes(next)) p.completedNodes.push(next);
    next = nodeMeta(next)?.next;
  }
  return next;
}

function pathUsesNode(nodeId, branches) {
  const G = data().GRAPH_NODES;
  const walk = (id, depth = 0) => {
    if (!id || depth > 40) return false;
    if (id === nodeId) return true;
    const n = G[id];
    if (!n) return false;
    if (n.type === "choice") {
      const pick = branches[n.choiceKey];
      if (!pick) return n.options.some((o) => walk(o.next, depth + 1));
      const opt = n.options.find((o) => o.branch === pick || o.id === pick);
      if (opt) return walk(opt.next, depth + 1);
      return false;
    }
    if (n.next) return walk(n.next, depth + 1);
    return false;
  };
  return walk(data().START_NODE || "n01");
}

function effectiveHeroLv() {
  const p = loadStoryProgress();
  return Math.min(5, 1 + (p.wins || 0));
}

function hasSpell(id) {
  return loadStoryProgress().spells?.includes(id);
}

function applyStoryPassives(game) {
  if (!game.storyMode) return;
  game.storyDmgMult = 1;
  game.storyProt = 0;
  game.storySpellMax = 4;
  game.storyPatronus = false;
  game.storyDmgFlat = 0;
  if (hasSpell("expelliarmus")) game.storyDmgMult *= 1.3;
  if (hasSpell("reducto")) game.storyDmgFlat = 10;
  if (hasSpell("protego")) game.storyProt = 0.25;
  if (hasSpell("patronus")) game.storyPatronus = true;
  if (hasSpell("stupefy")) game.storySpellMax = 5;
}

function storyLineTier(n) {
  if (!Game?.storyMode || !hasSpell("patronus")) return n;
  if (n === 2) return 3;
  return n;
}

function storyCastDmg(base, attacker) {
  let dmg = base;
  if (attacker?.side === "p" && Game.storyMode) {
    dmg = Math.round(dmg * (Game.storyDmgMult || 1) + (Game.storyDmgFlat || 0));
  }
  if (attacker?.side === "v" && Game.storyMode && Game.storyProt) {
    dmg = Math.max(1, Math.round(dmg * (1 - Game.storyProt)));
  }
  return dmg;
}

function onStoryLineClear() {
  if (!Game?.storyMode || typeof isP !== "function" || !isP(Game.P)) return;
  if (hasSpell("lumos")) {
    Game.P.hp = Math.min(Game.P.hpMax, Game.P.hp + 3);
    updateHUD(Game.P);
  }
}

function storyRescueCost(maxHp) {
  if (Game?.storyMode && hasSpell("reparo")) return Math.round(maxHp * 0.1);
  return Math.round(maxHp * 0.2);
}

function onManualStorySpell() {
  if (!Game?.storyMode || !hasSpell("aguamenti")) return;
  Game.P.hp = Math.min(Game.P.hpMax, Game.P.hp + 8);
  updateHUD(Game.P);
}

function hideChoiceUI() {
  document.getElementById("storyChoiceRow")?.setAttribute("hidden", "");
  document.getElementById("storyPanelNext")?.removeAttribute("hidden");
}

function showChoiceUI(nodeId) {
  const c = heroContent(nodeId);
  const meta = nodeMeta(nodeId);
  if (!c?.prompt || !meta?.options) return false;
  const row = document.getElementById("storyChoiceRow");
  const prompt = document.getElementById("storyChoicePrompt");
  const btnA = document.getElementById("storyChoiceA");
  const btnB = document.getElementById("storyChoiceB");
  document.getElementById("storyPanelNext")?.setAttribute("hidden", "");
  row?.removeAttribute("hidden");
  prompt.textContent = window.ProfileStore.personalizeText(c.prompt, playerName());
  const optA = meta.options[0];
  const optB = meta.options[1];
  const labA = c[optA.labelFrom] || optA;
  const labB = c[optB.labelFrom] || optB;
  btnA.textContent = labA.label || "Opción A";
  btnB.textContent = labB.label || "Opción B";
  btnA.onclick = () => pickChoice(nodeId, optA);
  btnB.onclick = () => pickChoice(nodeId, optB);
  return true;
}

function pickChoice(nodeId, opt) {
  const p = loadStoryProgress();
  const cur = p.nodeId || data().START_NODE || "n01";
  if (nodeId !== cur) return;
  const meta = nodeMeta(nodeId);
  if (meta?.choiceKey) p.branches[meta.choiceKey] = opt.branch || opt.id;
  if (!p.completedNodes.includes(nodeId)) p.completedNodes.push(nodeId);
  p.nodeId = opt.next;
  saveProgress();
  hideChoiceUI();
  if (typeof SFX !== "undefined") SFX.select();
  const content = heroContent(nodeId);
  const follow = content?.[opt.labelFrom];
  if (follow?.lines) {
    const scene = panelSceneMeta(nodeId);
    showStoryPanels(
      [
        {
          art: content.art,
          lines: personalize(follow.lines),
          heroId: scene.heroId,
          villainId: scene.villainId,
          bossName: scene.bossName,
        },
      ],
      () => startNodeFlow(opt.next)
    );
  } else startNodeFlow(opt.next);
}

function renderStoryHeroes() {
  const box = document.getElementById("storyHeroCards");
  const p = loadStoryProgress();
  if (!box) return;
  box.innerHTML = "";
  const ready = data().STORY_READY_HEROES || [];
  window.HEROES?.forEach((ch) => {
    const b = document.createElement("button");
    b.type = "button";
    const ok = ready.includes(ch.id);
    b.className =
      "card story-hero-card" +
      (p.heroId === ch.id ? " sel" : "") +
      (ok ? "" : " story-soon");
    b.disabled = !ok;
    const soon = ok ? "" : `<span class="story-soon-tag">Próximamente</span>`;
    b.innerHTML = window.AV[ch.id]() + `<div class="nm">${ch.n.split(" ")[0]}</div>${soon}`;
    if (ok) {
      b.onclick = () => {
        p.heroId = ch.id;
        if (!p.nodeId) p.nodeId = data().START_NODE || "n01";
        saveProgress();
        box.querySelectorAll(".card").forEach((x) => x.classList.toggle("sel", x === b));
        document.getElementById("storyMapContinue").disabled = false;
        if (typeof SFX !== "undefined") SFX.select();
      };
    }
    box.appendChild(b);
  });
}

function renderStoryMap() {
  const map = document.getElementById("storyMapPath");
  if (!map) return;
  const p = loadStoryProgress();
  const prof = window.ProfileStore?.activeProfile?.();
  const hero = p.heroId ? window.HEROES?.find((h) => h.id === p.heroId) : null;
  document.getElementById("storyMapHero").innerHTML = hero && window.AV ? window.AV[hero.id]() : "";
  const who = prof?.name || playerName();
  document.getElementById("storyMapTitle").textContent = hero
    ? `${who}: historia de ${hero.n.split(" ")[0]}`
    : "Elige un héroe";
  document.getElementById("storyMapMeta").textContent = `Nivel ${effectiveHeroLv()} · ${p.spells.length} magias · ${p.completedNodes.length} episodios`;
  map.innerHTML = "";
  const order = data().MAP_ORDER || [];
  let idx = 0;
  order.forEach((nodeId) => {
    if (!pathUsesNode(nodeId, p.branches)) return;
    const c = heroContent(nodeId);
    const meta = nodeMeta(nodeId);
    if (!c && !meta) return;
    idx++;
    const done = p.completedNodes.includes(nodeId);
    const current = p.nodeId === nodeId && !p.completed;
    const locked = !done && p.nodeId !== nodeId;
    const node = document.createElement("button");
    node.type = "button";
    node.className =
      "story-node" +
      (locked ? " locked" : "") +
      (done ? " done" : "") +
      (current ? " current" : "") +
      (meta?.type === "choice" ? " story-choice-node" : "");
    const battle = resolveChapterBattle(nodeId);
    const vRec = battle
      ? window.VILLAINS?.find((v) => v.id === battle.villainId)
      : null;
    const boss =
      c?.bossName ||
      battle?.displayName ||
      vRec?.n ||
      (meta?.type === "choice" ? "Decisión" : meta?.type === "duel" ? "Duelo" : "Cuento");
    node.innerHTML = `<span class="story-node-num">${idx}</span><span class="story-node-t">${c?.title || nodeId}</span><span class="story-node-b">${boss}</span>`;
    if (!locked) {
      const id = nodeId;
      node.onclick = () => startNodeFlow(id);
    }
    map.appendChild(node);
    const line = document.createElement("div");
    line.className = "story-connector" + (done ? " lit" : "");
    map.appendChild(line);
  });
}

function isNextUnlocked(nodeId, p) {
  if (p.nodeId === nodeId) return true;
  const order = data().MAP_ORDER.filter((id) => pathUsesNode(id, p.branches));
  const cur = order.indexOf(p.nodeId);
  const target = order.indexOf(nodeId);
  return target >= 0 && cur >= 0 && target <= cur + 1;
}

function buildDuelChapter(nodeId) {
  const c = heroContent(nodeId);
  const battle = resolveChapterBattle(nodeId);
  if (!battle) return null;
  const vill = window.VILLAINS.find((v) => v.id === battle.villainId);
  const bossName =
    c?.bossName || battle.displayName || vill?.n || battle.villainId;
  return {
    id: nodeId,
    title: c?.title || nodeId,
    villainId: battle.villainId,
    bossName,
    spell: battle.spell,
    rewardTitle: battle.rewardTitle,
    outro: [
      {
        art: "victory",
        lines: personalize([
          `¡Bien hecho, {name}! Ganaste este duelo.`,
          "Tu varita brilla con orgullo.",
        ]),
      },
    ],
    finale: !!battle.finale,
  };
}

function showStoryDuelIntro(nodeId, battle, onStart) {
  const p = loadStoryProgress();
  const hero = window.HEROES.find((h) => h.id === p.heroId);
  const vill = window.VILLAINS.find((v) => v.id === battle.villainId);
  const name = battle.displayName || vill?.n || battle.villainId;
  const c = heroContent(nodeId);
  document.getElementById("storyDuelIntroTitle").textContent =
    `¡Duelo contra ${name}!`;
  document.getElementById("storyDuelIntroSub").textContent =
    c?.title
      ? `${c.title} — completa filas para lanzar hechizos y vaciar la magia del rival.`
      : "Completa filas para lanzar hechizos y vaciar la magia del rival.";
  document.getElementById("storyDuelIntroHero").innerHTML =
    hero && window.AV ? window.AV[hero.id]() : "";
  document.getElementById("storyDuelIntroVillain").innerHTML =
    vill && window.AV ? window.AV[vill.id]() : "";
  Story._duelIntroCb = onStart;
  document.getElementById("storyDuelIntroOverlay").classList.add("show");
}

function beginChapterBattle(nodeId) {
  const battle = resolveChapterBattle(nodeId);
  if (!battle?.villainId) {
    completeNarrativeNode(nodeId);
    renderStoryMap();
    show("storyMapScreen");
    return;
  }
  const chapter = buildDuelChapter(nodeId);
  if (!chapter) return;
  showStoryDuelIntro(nodeId, battle, () => startStoryDuel(chapter));
}

function startNodeFlow(nodeId) {
  const p = loadStoryProgress();
  if (!p.heroId) return;
  if (!canEnterNode(nodeId, p)) return;
  const meta = nodeMeta(nodeId);
  const c = heroContent(nodeId);
  if (!meta || !c) return;
  Story.activeNode = nodeId;
  const cur = p.nodeId || data().START_NODE || "n01";
  if (!p.completedNodes.includes(nodeId) && nodeId === cur) {
    p.nodeId = nodeId;
    saveProgress();
  }
  if (meta.type === "choice") {
    show("storyPanelScreen");
    const artEl = document.getElementById("storyPanelArt");
    artEl.innerHTML = paintScene(c.art, panelSceneMeta(nodeId));
    document.getElementById("storyPanelText").innerHTML = personalize(c.lines)
      .map((l) => `<p>${l}</p>`)
      .join("");
    document.getElementById("storyPanelStep").textContent = "Elige";
    showChoiceUI(nodeId);
    return;
  }
  if (meta.type === "narrative" || meta.type === "duel") {
    showStoryPanels(panelsFrom(nodeId), () => beginChapterBattle(nodeId));
    return;
  }
  showStoryPanels(panelsFrom(nodeId), () => {
    completeNarrativeNode(nodeId);
    renderStoryMap();
    show("storyMapScreen");
  });
}

function showStoryPanels(panels, done) {
  document.getElementById("storyDuelIntroOverlay")?.classList.remove("show");
  hideChoiceUI();
  Story.panelQueue = panels.slice();
  Story.panelIdx = 0;
  Story.onPanelsDone = done;
  show("storyPanelScreen");
  renderStoryPanel();
}

function renderStoryPanel() {
  hideChoiceUI();
  const p = Story.panelQueue[Story.panelIdx];
  if (!p) return;
  document.getElementById("storyPanelArt").innerHTML = paintScene(p.art, {
    heroId: p.heroId,
    villainId: p.villainId,
    bossName: p.bossName,
  });
  document.getElementById("storyPanelText").innerHTML = p.lines.map((l) => `<p>${l}</p>`).join("");
  document.getElementById("storyPanelStep").textContent = `${Story.panelIdx + 1} / ${Story.panelQueue.length}`;
}

function advanceStoryPanel() {
  Story.panelIdx++;
  if (Story.panelIdx >= Story.panelQueue.length) {
    const cb = Story.onPanelsDone;
    Story.onPanelsDone = null;
    document.getElementById("storyPanelScreen")?.classList.remove("show");
    if (cb) cb();
    return;
  }
  renderStoryPanel();
}

function syncDuelHud(storyOn) {
  const on = storyOn !== false && !!Game?.storyMode;
  const btn = document.getElementById("backBtn");
  const cap = document.getElementById("storyDuelCaption");
  if (btn) {
    const lbl = btn.querySelector(".back-lbl");
    const ico = btn.querySelector(".back-ico");
    if (on) {
      if (lbl) lbl.textContent = "Mapa";
      if (ico) ico.textContent = "🗺️";
    } else {
      if (lbl) lbl.textContent = "Personajes";
      if (ico) ico.textContent = "🏠";
    }
  }
  if (cap) {
    if (on && Game.storyChapter) {
      const ch = Game.storyChapter;
      cap.hidden = false;
      const bit = ch.bossName || ch.title || "";
      cap.textContent = ch.title && ch.bossName ? `${ch.title} · ${ch.bossName}` : bit;
    } else cap.hidden = true;
  }
}

function startStoryDuel(chapter) {
  const p = loadStoryProgress();
  const heroId = p.heroId || window.sel?.hero;
  const hero = window.HEROES.find((h) => h.id === heroId);
  const vill = window.VILLAINS.find((v) => v.id === chapter.villainId);
  if (!hero || !vill) {
    console.error("startStoryDuel: héroe o rival no encontrado", heroId, chapter.villainId);
    return;
  }
  const theme = window.sel?.theme || "gryffindor";
  if (window.sel) {
    window.sel.hero = hero.id;
    window.sel.villain = vill.id;
    window.sel.theme = theme;
  }
  Game.storyMode = true;
  Game.storyChapter = chapter;
  Game.storyDuelNode = chapter.id;
  if (typeof ac === "function") ac();
  window.startGame();
  syncDuelHud(true);
}
window.startStoryDuel = startStoryDuel;

function handleStoryWin() {
  const ch = Game.storyChapter;
  const p = loadStoryProgress();
  if (!ch) return;
  const cur = p.nodeId || data().START_NODE || "n01";
  if (ch.id !== cur && !p.completedNodes.includes(ch.id)) return;
  Game.running = false;
  Game.over = true;
  p.wins = (p.wins || 0) + 1;
  if (ch.spell && !p.spells.includes(ch.spell)) p.spells.push(ch.spell);
  if (!p.completedNodes.includes(ch.id)) p.completedNodes.push(ch.id);
  const next = nextChapterAfterWin(ch.id);
  if (ch.finale) {
    p.completed = true;
    p.nodeId = null;
  } else if (next) p.nodeId = next;
  saveProgress();
  Story.pendingReward =
    ch.spell || ch.rewardTitle
      ? { chapter: ch, lv: effectiveHeroLv() }
      : null;
  if (ch.outro?.length) {
    showStoryPanels(ch.outro, () => {
      if (Story.pendingReward) showStoryReward();
      else {
        renderStoryMap();
        show("storyMapScreen");
      }
    });
  } else if (Story.pendingReward) showStoryReward();
  else {
    renderStoryMap();
    show("storyMapScreen");
  }
}

function showStoryReward() {
  const pr = Story.pendingReward;
  if (!pr) return;
  const sp = data().STORY_SPELLS?.[pr.chapter.spell];
  document.getElementById("storyRewardTitle").textContent = pr.chapter.rewardTitle || "¡Nueva magia!";
  document.getElementById("storyRewardLvl").textContent =
    pr.lv > 1 ? `¡Subiste de nivel! (Nivel ${pr.lv})` : "";
  if (sp) {
    document.getElementById("storyRewardIcon").textContent = sp.icon;
    document.getElementById("storyRewardName").textContent = sp.name;
    document.getElementById("storyRewardEffect").textContent = sp.effect;
  } else {
    document.getElementById("storyRewardIcon").textContent = "🏆";
    document.getElementById("storyRewardName").textContent = "¡Victoria!";
    document.getElementById("storyRewardEffect").textContent = `¡Bien hecho, ${playerName()}!`;
  }
  document.getElementById("storyRewardOverlay").classList.add("show");
  Story.pendingReward = null;
}

function closeStoryReward() {
  document.getElementById("storyRewardOverlay").classList.remove("show");
  renderStoryMap();
  show("storyMapScreen");
}

function resetStoryProgress() {
  const p = defaultProgress();
  p.heroId = loadStoryProgress().heroId;
  window.ProfileStore.setProgress(p);
}

function onProfilePicked(prof) {
  if (!prof.story) prof.story = defaultProgress();
  window.ProfileStore.setProgress(prof.story);
  if (!prof.story.heroId) {
    renderStoryHeroes();
    show("storyHeroScreen");
    return;
  }
  renderStoryMap();
  show("storyMapScreen");
}

function enterStoryWithProfile(prof, cont) {
  onProfilePicked(prof);
  if (cont && prof.story?.nodeId && !prof.story.completed) {
    startNodeFlow(prof.story.nodeId);
  }
}

function openStoryEntry() {
  window.ProfileStore.loadProfiles();
  const active = window.ProfileStore.activeProfile();
  if (!active) {
    window.ProfileStore.renderProfileScreen();
    show("profileScreen");
    return;
  }
  onProfilePicked(active);
}

function wireStoryUI() {
  document.getElementById("btnModeNormal")?.addEventListener("click", () => {
    Game.storyMode = false;
    show("selScreen");
    if (typeof SFX !== "undefined") SFX.select();
  });
  document.getElementById("btnModeStory")?.addEventListener("click", () => {
    if (typeof SFX !== "undefined") SFX.select();
    openStoryEntry();
  });
  document.getElementById("storyMapContinue")?.addEventListener("click", () => {
    const p = loadStoryProgress();
    if (!p.heroId) return;
    renderStoryMap();
    show("storyMapScreen");
  });
  document.getElementById("storyHeroBack")?.addEventListener("click", () => show("profileScreen"));
  document.getElementById("storyMapBack")?.addEventListener("click", () => show("profileScreen"));
  document.getElementById("storyDuelStartBtn")?.addEventListener("click", () => {
    if (typeof SFX !== "undefined") SFX.select();
    document.getElementById("storyDuelIntroOverlay")?.classList.remove("show");
    const cb = Story._duelIntroCb;
    Story._duelIntroCb = null;
    if (cb) cb();
  });
  document.getElementById("storyDuelIntroBack")?.addEventListener("click", () => {
    if (typeof SFX !== "undefined") SFX.select();
    document.getElementById("storyDuelIntroOverlay")?.classList.remove("show");
    Story._duelIntroCb = null;
    renderStoryMap();
    show("storyMapScreen");
  });
  document.getElementById("storyMapRestart")?.addEventListener("click", () => {
    if (confirm("¿Empezar la historia desde el principio? Se pierde el camino actual.")) {
      resetStoryProgress();
      renderStoryMap();
    }
  });
  document.getElementById("storyPanelNext")?.addEventListener("click", () => {
    if (typeof SFX !== "undefined") SFX.select();
    advanceStoryPanel();
  });
  document.getElementById("storyRewardOk")?.addEventListener("click", () => {
    if (typeof SFX !== "undefined") SFX.select();
    closeStoryReward();
  });
}

window.StoryMode = {
  STORY_SPELLS: () => data()?.STORY_SPELLS,
  STORY_CHAPTERS: () => data()?.MAP_ORDER,
  EPISODES_PER_HERO: () => data()?.EPISODES_PER_HERO,
  Story,
  loadProgress: loadStoryProgress,
  wireStoryUI,
  handleStoryWin,
  applyStoryPassives,
  effectiveHeroLv,
  storyLineTier,
  storyCastDmg,
  onStoryLineClear,
  storyRescueCost,
  onManualStorySpell,
  renderStoryMap,
  renderStoryHeroes,
  showStoryPanels,
  startStoryDuel,
  startNodeFlow,
  onProfilePicked,
  enterStoryWithProfile,
  openStoryEntry,
  resetStoryProgress,
  playerName,
  syncDuelHud,
  paintScene,
};