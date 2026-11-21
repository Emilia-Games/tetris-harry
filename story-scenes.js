"use strict";
/** Ilustraciones tipo libro ilustrado — escenas llenas en SVG */

const SCENE_LABELS = {
  tunnel: "Pasillo secreto",
  corridor: "Corredor de piedra",
  classroom: "Aula de magia",
  library: "Biblioteca",
  garden: "Jardín",
  forest: "Bosque prohibido",
  greenhouse: "Invernadero",
  kitchen: "Cocina",
  lake: "Gran lago",
  feast: "Gran comedor",
  tower: "Torre",
  winCastle: "Hogwarts",
  bridge: "Puente",
  chamber: "Cámara secreta",
  mirror: "Espejo mágico",
  stars: "Noche estrellada",
  dementor: "Sombras frías",
  basilisk: "La serpiente",
  patronusLight: "Luz de Patronus",
  duelWin: "Duelo mágico",
  finalDuel: "Duelo final",
  voldemort: "Batalla final",
  darkMark: "Señal en el cielo",
  victory: "¡Victoria!",
  troll: "El troll",
};

function sparkles() {
  let s = "";
  const pts = [
    [50, 40], [120, 55], [310, 45], [350, 90], [180, 30], [260, 70], [90, 120], [330, 150],
  ];
  pts.forEach(([x, y], i) => {
    s += `<g transform="translate(${x},${y})"><path d="M0-5 L1.5-1.5 5 0 1.5 1.5 0 5 -1.5 1.5 -5 0 -1.5-1.5Z" fill="#ffd86b" opacity="${0.5 + (i % 3) * 0.15}"/></g>`;
  });
  return s;
}

function heroFigure(heroId) {
  const scale = 0.95;
  const y = 118;
  const x = 42;
  if (typeof window !== "undefined" && window.AV?.[heroId]) {
    const raw = window.AV[heroId]();
    const inner = raw.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
    return `<g transform="translate(${x},${y}) scale(${scale})">${inner}</g>`;
  }
  return `<g transform="translate(${x},${y})"><circle cx="50" cy="50" r="48" fill="#ffcf6b"/><text x="50" y="58" text-anchor="middle" font-size="36">🧙</text></g>`;
}

function villainFigure(villainId, bossName) {
  const x = 248;
  const y = 108;
  const label = (bossName || villainId || "Rival").slice(0, 16);
  let body = "";
  switch (villainId) {
    case "goyle":
      body = `<ellipse cx="0" cy="25" rx="48" ry="55" fill="#6b5344"/><circle cx="0" cy="-15" r="32" fill="#8b7355"/><circle cx="-12" cy="-20" r="5" fill="#1a1a1a"/><circle cx="12" cy="-20" r="5" fill="#1a1a1a"/><rect x="-22" y="50" width="20" height="35" rx="6" fill="#5a4335"/><rect x="2" y="50" width="20" height="35" rx="6" fill="#5a4335"/>`;
      break;
    case "crabbe":
      body = `<ellipse cx="0" cy="25" rx="50" ry="52" fill="#7a6a55"/><circle cx="0" cy="-12" r="30" fill="#9a8a70"/><path d="M-18 -8 Q0 2 18 -8" stroke="#4a3020" stroke-width="3" fill="none"/>`;
      break;
    case "draco":
      body = `<circle cx="0" cy="-10" r="28" fill="#f0d0b0"/><rect x="-22" y="15" width="44" height="55" rx="8" fill="#1a3a2a"/><rect x="-18" y="18" width="36" height="12" fill="#c0a060"/>`;
      break;
    case "colagusano":
      body = `<ellipse cx="0" cy="30" rx="55" ry="40" fill="#3a2a1a"/><circle cx="-30" cy="-5" r="14" fill="#1a1a1a"/><circle cx="-10" cy="-5" r="14" fill="#1a1a1a"/><circle cx="10" cy="-5" r="14" fill="#1a1a1a"/><circle cx="30" cy="-5" r="14" fill="#1a1a1a"/><circle cx="-20" cy="-5" r="5" fill="#ff2020"/><circle cx="0" cy="-5" r="5" fill="#ff2020"/><circle cx="20" cy="-5" r="5" fill="#ff2020"/>`;
      break;
    case "quirrell":
      body = `<circle cx="0" cy="-8" r="26" fill="#e8d8c8"/><rect x="-30" y="25" width="60" height="50" fill="#6b5a4a"/><ellipse cx="0" cy="-22" rx="28" ry="18" fill="#4a3020"/>`;
      break;
    case "basilisco":
      body = `<ellipse cx="0" cy="35" rx="70" ry="28" fill="#2d8a45"/><ellipse cx="-22" cy="20" rx="16" ry="14" fill="#ffcf6b" stroke="#222" stroke-width="2"/><ellipse cx="22" cy="20" rx="16" ry="14" fill="#ffcf6b" stroke="#222" stroke-width="2"/><path d="M-70 35 Q-90 10 -60 -10" stroke="#2d8a45" stroke-width="12" fill="none" stroke-linecap="round"/>`;
      break;
    case "dementor":
      body = `<ellipse cx="0" cy="-5" rx="32" ry="40" fill="#1a1a2a"/><path d="M-40 30 Q0 -5 40 30 L50 75 L-50 75Z" fill="#0a0a18"/><circle cx="-10" cy="-8" r="4" fill="#bbb"/><circle cx="10" cy="-8" r="4" fill="#bbb"/>`;
      break;
    case "voldemort":
      body = `<ellipse cx="0" cy="-5" rx="30" ry="34" fill="#e8e0d0"/><ellipse cx="-12" cy="-10" rx="5" ry="9" fill="#ff3030"/><ellipse cx="12" cy="-10" rx="5" ry="9" fill="#ff3030"/><path d="M0 -38 L-25 -55 L25 -55Z" fill="#111"/><rect x="-25" y="25" width="50" height="55" fill="#111" rx="6"/><circle cx="0" cy="12" r="18" fill="#7dffb0" opacity=".35"/>`;
      break;
    default:
      body = `<circle cx="0" cy="10" r="40" fill="#4a2a6a" stroke="#ffd86b" stroke-width="3"/><text x="0" y="18" text-anchor="middle" font-size="28" fill="#fff">⚡</text>`;
  }
  return `<g transform="translate(${x},${y})">${body}<text x="0" y="95" text-anchor="middle" fill="#ffd86b" font-size="11" font-weight="700">${label}</text></g>`;
}

function propObject(villainId, art) {
  if (art === "tunnel" || art === "corridor") {
    return `<g transform="translate(300,175)"><circle cx="0" cy="0" r="22" fill="#9fe3ff" opacity=".8"/><circle cx="0" cy="0" r="14" fill="#ffd86b"/></g>`;
  }
  if (art === "garden" || art === "greenhouse" || art === "forest") {
    return `<g transform="translate(285,160)"><circle cx="0" cy="20" r="28" fill="#4a8a3a"/><circle cx="-15" cy="5" r="18" fill="#6bc04a"/><circle cx="15" cy="5" r="18" fill="#6bc04a"/></g>`;
  }
  return "";
}

function sceneCorridor() {
  return `
    <defs><linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5a5a72"/><stop offset="100%" stop-color="#3a3a52"/></linearGradient></defs>
    <rect width="400" height="280" fill="#1a1148"/>
  ` + perspectiveHall() + torches() + stoneFloor();
}

function perspectiveHall() {
  return `<path d="M0 280 L0 60 L200 20 L400 60 L400 280Z" fill="url(#wallG)"/>
    <path d="M120 280 L200 90 L280 280Z" fill="#2b2a45" opacity=".9"/>
    <path d="M155 280 L200 120 L245 280Z" fill="#1e1e35"/>
    <path d="M175 280 L200 155 L225 280Z" fill="#12122a"/>
    <ellipse cx="200" cy="55" rx="45" ry="20" fill="#ffd86b" opacity=".25"/>`;
}

function torches() {
  return `<g fill="#ff9f43"><rect x="55" y="100" width="8" height="40" fill="#6b5344"/><ellipse cx="59" cy="88" rx="14" ry="18" fill="#ffcf6b" opacity=".9"/><ellipse cx="59" cy="88" rx="22" ry="26" fill="#ff9f43" opacity=".35"/>
    <rect x="337" y="100" width="8" height="40" fill="#6b5344"/><ellipse cx="341" cy="88" rx="14" ry="18" fill="#ffcf6b" opacity=".9"/><ellipse cx="341" cy="88" rx="22" ry="26" fill="#ff9f43" opacity=".35"/></g>`;
}

function stoneFloor() {
  return `<rect y="218" width="400" height="62" fill="#2b2640"/>` +
    Array.from({ length: 8 }, (_, i) => `<rect x="${i * 52}" y="222" width="48" height="24" fill="#3a3550" stroke="#4a4560" stroke-width="1"/>`).join("");
}

function sceneClassroom() {
  return `<rect width="400" height="280" fill="#1a2850"/>
    <rect x="20" y="40" width="360" height="160" rx="8" fill="#4a3a6a"/>
    <rect x="40" y="55" width="320" height="75" rx="4" fill="#1a3320" stroke="#8b7355" stroke-width="4"/>
    <text x="200" y="95" text-anchor="middle" fill="#d4e8d4" font-size="14" font-family="serif">Abracadabra</text>
    ${[70, 130, 190, 250, 310].map((x) => `<rect x="${x}" y="175" width="36" height="28" rx="3" fill="#6b5344"/><rect x="${x + 4}" y="165" width="28" height="12" fill="#8b7355"/>`).join("")}
    ${[90, 150, 210, 270, 330].map((x) => `<circle cx="${x}" cy="130" r="6" fill="#ffcf6b" opacity=".85"/><ellipse cx="${x}" cy="128" rx="10" ry="14" fill="#ffd86b" opacity=".2"/>`).join("")}`;
}

function sceneLibrary() {
  const shelves = [25, 95, 165, 235, 305];
  return `<rect width="400" height="280" fill="#1a1148"/>
    ${shelves.map((x, i) => `<rect x="${x}" y="35" width="62" height="190" fill="#5a4028" stroke="#8b6a44"/><g>${[0, 1, 2, 3, 4, 5].map((r) => `<rect x="${x + 6}" y="${45 + r * 28}" width="50" height="20" rx="2" fill="${["#b3001b", "#1e5a9a", "#2d8a45", "#9a5a1a", "#6a2a8a", "#c07a20"][r]}" opacity=".9"/>`).join("")}</g>`).join("")}
    <rect x="350" y="120" width="12" height="100" fill="#6b5344"/>
    <circle cx="368" cy="200" r="18" fill="#ffcf6b" opacity=".8"/>
    <ellipse cx="368" cy="198" rx="28" ry="32" fill="#ffd86b" opacity=".15"/>`;
}

function sceneGreenhouse() {
  return `<rect width="400" height="280" fill="#87ceeb" opacity=".4"/><rect width="400" height="280" fill="#0a2a1a" opacity=".55"/>
    <path d="M20 260 L20 80 L200 35 L380 80 L380 260Z" fill="#c8e8ff" opacity=".35" stroke="#9fe3ff" stroke-width="2"/>
    <line x1="200" y1="35" x2="200" y2="260" stroke="#8ac4e8" stroke-width="2"/>
    ${[60, 140, 220, 300].map((x) => `<line x1="${x}" y1="90" x2="${x}" y2="255" stroke="#8ac4e8" stroke-width="1.5" opacity=".6"/>`).join("")}
    ${[50, 120, 200, 280, 330].map((x, i) => `<ellipse cx="${x}" cy="230" rx="22" ry="14" fill="#8b5a2b"/><rect x="${x - 4}" y="200" width="8" height="35" fill="#4a8a3a"/><ellipse cx="${x}" cy="195" rx="28" ry="22" fill="#${i % 2 ? "3d9a50" : "2d7a40"}"/>`).join("")}`;
}

function sceneForest() {
  return `<rect width="400" height="280" fill="#0a1820"/>
    <ellipse cx="200" cy="260" rx="220" ry="40" fill="#0d2818" opacity=".8"/>
    ${[30, 90, 150, 210, 270, 330, 370].map((x, i) => `<polygon points="${x},260 ${x + 20},${80 + (i % 3) * 20} ${x + 45},260" fill="#${i % 2 ? "1a5a30" : "145a28"}"/>`).join("")}
    ${Array.from({ length: 12 }, (_, i) => `<circle cx="${30 + i * 32}" cy="${140 + (i % 4) * 25}" r="3" fill="#9fe3ff" opacity="${0.4 + (i % 3) * 0.2}"/>`).join("")}
    <ellipse cx="200" cy="180" rx="160" ry="50" fill="#9fe3ff" opacity=".08"/>`;
}

function sceneLake() {
  return `<rect width="400" height="280" fill="#0a1648"/>
    <circle cx="320" cy="55" r="28" fill="#fff8e0"/><circle cx="320" cy="55" r="36" fill="#ffd86b" opacity=".15"/>
    ${[40, 80, 360].map((x) => `<circle cx="${x}" cy="${30 + (x % 50)}" r="2" fill="#fff"/>`).join("")}
    <path d="M0 120 L60 100 L200 70 L340 100 L400 130 L400 280 L0 280Z" fill="#2b1650"/>
    <ellipse cx="200" cy="230" rx="195" ry="45" fill="#1e4a9a"/>
    <path d="M20 220 Q80 200 120 225 T200 215 T280 228 T380 218" stroke="#5a9ae8" stroke-width="3" fill="none" opacity=".6"/>`;
}

function sceneFeast() {
  return `<rect width="400" height="280" fill="#2b1650"/>
    <rect x="15" y="100" width="370" height="120" fill="#1a0a30" opacity=".5"/>
    ${[50, 120, 200, 280, 350].map((x) => `<rect x="${x - 35}" y="155" width="70" height="55" fill="#6b4028"/><line x1="${x}" y1="100" x2="${x}" y2="155" stroke="#8b6a44" stroke-width="4"/>`).join("")}
    ${[70, 160, 240, 320].map((x) => `<circle cx="${x}" cy="125" r="7" fill="#ffcf6b"/><ellipse cx="${x}" cy="122" rx="12" ry="16" fill="#ffd86b" opacity=".25"/>`).join("")}
  ` + bannerRow();
}

function bannerRow() {
  return `<rect x="30" y="45" width="50" height="35" fill="#b3001b"/><rect x="100" y="45" width="50" height="35" fill="#1e3a8a"/><rect x="250" y="45" width="50" height="35" fill="#1a7a3f"/><rect x="320" y="45" width="50" height="35" fill="#ffcf6b"/>`;
}

function sceneChamber() {
  return `<rect width="400" height="280" fill="#0a1810"/>
    ${[80, 200, 320].map((x) => `<rect x="${x}" y="50" width="28" height="200" fill="#3a4a4a"/><ellipse cx="${x + 14}" cy="45" rx="20" ry="12" fill="#4a5a5a"/>`).join("")}
    <ellipse cx="200" cy="230" rx="150" ry="30" fill="#1a4a2a" opacity=".7"/>
    <circle cx="200" cy="140" r="60" fill="#4be37a" opacity=".2"/>
    <path d="M40 250 Q200 60 360 250" stroke="#4be37a" stroke-width="8" fill="none" opacity=".6"/>`;
}

function sceneVoldemort() {
  return `<rect width="400" height="280" fill="#0a0518"/>
    <path d="M0 80 Q100 40 200 50 Q300 40 400 80" stroke="#4a3a7a" stroke-width="3" fill="none"/>
    ${Array.from({ length: 8 }, (_, i) => `<line x1="${50 + i * 45}" y1="30" x2="${80 + i * 40}" y2="120" stroke="#9fe3ff" stroke-width="2" opacity=".4"/>`).join("")}
    <ellipse cx="200" cy="200" rx="140" ry="25" fill="#7dffb0" opacity=".15"/>`;
}

function sceneTunnel() {
  return sceneCorridor() + `<rect x="165" y="155" width="70" height="90" rx="6" fill="#12122a" stroke="#ffd86b" stroke-width="2"/>`;
}

function sceneBg(art, optsVillain) {
  const key = art === "garden" ? "greenhouse" : art;
  switch (key) {
    case "corridor":
      return sceneCorridor();
    case "tunnel":
      return sceneTunnel();
    case "classroom":
      return sceneClassroom();
    case "library":
      return sceneLibrary();
    case "greenhouse":
      return sceneGreenhouse();
    case "forest":
      return sceneForest();
    case "lake":
      return sceneLake();
    case "feast":
    case "kitchen":
      return sceneFeast();
    case "chamber":
      return sceneChamber();
    case "victory":
      return optsVillain === "voldemort" ? sceneVoldemort() : sceneFeast();
    case "voldemort":
    case "finalDuel":
    case "darkMark":
      return sceneVoldemort();
    case "basilisk":
      return sceneChamber() + `<ellipse cx="300" cy="170" rx="55" ry="22" fill="#2d8a45"/>`;
    case "dementor":
      return sceneForest().replace('fill="#0a1820"', 'fill="#050510"');
    case "winCastle":
    case "tower":
      return sceneLake();
    default:
      return sceneCorridor();
  }
}

function renderStoryScene(art, opts = {}) {
  const { heroId, villainId, bossName } = opts;
  const cap = SCENE_LABELS[art] || SCENE_LABELS.corridor;
  const showVillain = villainId || bossName || ["duelWin", "finalDuel", "voldemort", "basilisk", "dementor", "troll"].includes(art);
  const parts = [
    `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${cap}" data-scene-rich="1">`,
    sceneBg(art || "corridor", villainId),
    sparkles(),
    heroId ? heroFigure(heroId) : "",
    showVillain ? villainFigure(villainId || "villain", bossName) : propObject(villainId, art),
    `<text x="200" y="22" text-anchor="middle" fill="#ffd86b" font-size="12" font-weight="700">${cap}</text>`,
    "</svg>",
  ];
  return parts.join("");
}

function sceneLooksBlank(html) {
  if (!html || html.length < 400) return true;
  const fills = html.match(/fill="#[0-9a-fA-F]{3,8}"/g) || [];
  const uniqueFills = new Set(fills).size;
  const shapes = (html.match(/<(path|polygon|ellipse|rect|circle|line)\b/gi) || []).length;
  if (shapes < 18) return true;
  if (uniqueFills < 6) return true;
  if (!html.includes("data-scene-rich")) return true;
  return false;
}

window.StoryScenes = { renderStoryScene, sceneLooksBlank, sceneBg };