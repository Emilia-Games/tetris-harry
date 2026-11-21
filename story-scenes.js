"use strict";
/** Ilustraciones SVG para paneles de historia — fondo + héroe + rival/objeto */

const SCENE_LABELS = {
  tunnel: "Pasillo secreto",
  corridor: "Corredor del castillo",
  classroom: "Aula de magia",
  library: "Biblioteca",
  garden: "Jardín",
  forest: "Bosque",
  greenhouse: "Invernadero",
  kitchen: "Cocina",
  lake: "Lago",
  feast: "Gran comedor",
  tower: "Torre",
  winCastle: "Hogwarts",
  bridge: "Puente",
  chamber: "Sala oculta",
  mirror: "Espejo mágico",
  stars: "Cielo estrellado",
  stars_: "Noche",
  dementor: "Sombra fría",
  basilisk: "Serpiente",
  patronusLight: "Luz cálida",
  duelWin: "Duelo",
  finalDuel: "Duelo grande",
  voldemort: "Magia oscura",
  darkMark: "Señal verde",
  victory: "Victoria",
  troll: "Troll",
};

function bgLayer(art) {
  const sky = { tunnel: "#1a1148", forest: "#0a2a1a", garden: "#0a2a1a", greenhouse: "#0a2a1a", lake: "#0a2248", feast: "#2b1650", library: "#1a1148", kitchen: "#2b1650" }[art] || "#1a1148";
  const ground = art === "lake" ? "#1e3a8a" : "#2b1650";
  let decor = "";
  switch (art) {
    case "winCastle":
    case "tower":
      decor = `<path d="M40 230 L120 120 L200 80 L280 120 L360 230 L360 280 L40 280Z" fill="#3b2a8a"/><rect x="170" y="130" width="60" height="90" fill="#4a3a9a"/><polygon points="160,130 200,70 240,130" fill="#2b1650"/>`;
      break;
    case "library":
      decor = `<rect x="30" y="50" width="70" height="180" fill="#5a4a2a" opacity=".9"/><rect x="110" y="50" width="70" height="180" fill="#6b5a3a"/><rect x="190" y="50" width="70" height="180" fill="#5a4a2a"/><rect x="270" y="50" width="70" height="180" fill="#6b5a3a"/><text x="200" y="160" font-size="40" text-anchor="middle">📚</text>`;
      break;
    case "forest":
    case "garden":
    case "greenhouse":
      decor = `<polygon points="60,250 90,100 120,250" fill="#1a5a30"/><polygon points="170,250 200,70 230,250" fill="#2ecc71"/><polygon points="280,250 310,120 340,250" fill="#1a5a30"/><rect x="140" y="150" width="120" height="80" rx="8" fill="#9fe3ff" opacity=".35" stroke="#ffd86b"/>`;
      break;
    case "lake":
      decor = `<ellipse cx="200" cy="240" rx="170" ry="35" fill="#1e3a8a"/><path d="M50 200 Q200 120 350 200" fill="#2b6cb0" opacity=".5"/>`;
      break;
    case "feast":
    case "kitchen":
      decor = `<rect x="40" y="170" width="320" height="50" rx="8" fill="#8b5a2b"/><circle cx="100" cy="150" r="22" fill="#ffd86b"/><circle cx="200" cy="140" r="28" fill="#ff9f43"/><circle cx="300" cy="150" r="22" fill="#ffd86b"/>`;
      break;
    case "classroom":
      decor = `<rect x="40" y="60" width="320" height="150" rx="12" fill="#4a3a9a" stroke="#ffd86b" stroke-width="3"/><rect x="160" y="200" width="80" height="50" fill="#6b5344"/>`;
      break;
    case "corridor":
    case "tunnel":
      decor = `<rect x="80" y="40" width="240" height="200" rx="4" fill="#2b1650" stroke="#ffd86b" opacity=".6"/><path d="M200 40 L200 260" stroke="#ffd86b" stroke-width="2" opacity=".4"/>`;
      break;
    case "chamber":
      decor = `<path d="M50 250 Q200 40 350 250" fill="none" stroke="#4be37a" stroke-width="10"/><text x="200" y="150" font-size="56" text-anchor="middle">🐍</text>`;
      break;
    case "mirror":
      decor = `<ellipse cx="200" cy="140" rx="95" ry="110" fill="#9fe3ff" opacity=".4" stroke="#ffd86b" stroke-width="5"/>`;
      break;
    case "dementor":
    case "darkMark":
    case "voldemort":
      decor = `<circle cx="200" cy="100" r="35" fill="#7dffb0" opacity=".35"/><path d="M200 50 Q250 110 200 170 Q150 110 200 50" fill="none" stroke="#7dffb0" stroke-width="5"/>`;
      break;
    case "basilisk":
      decor = `<ellipse cx="200" cy="160" rx="130" ry="45" fill="#1a7a3f"/><circle cx="160" cy="140" r="14" fill="#ffcf6b"/><circle cx="240" cy="140" r="14" fill="#ffcf6b"/>`;
      break;
    case "patronusLight":
    case "victory":
      decor = `<circle cx="200" cy="130" r="75" fill="#9fe3ff" opacity=".45"/><text x="200" y="145" font-size="64" text-anchor="middle">✨</text>`;
      break;
    case "bridge":
      decor = `<path d="M30 220 Q200 90 370 220" stroke="#c4a574" stroke-width="14" fill="none"/><path d="M30 220 Q200 90 370 220" stroke="#8b7355" stroke-width="8" fill="none" opacity=".5"/>`;
      break;
  default:
      decor = `<rect x="60" y="80" width="280" height="140" rx="10" fill="#3b2a8a" opacity=".5"/>`;
  }
  return `<rect width="400" height="280" fill="${sky}"/><rect y="210" width="400" height="70" fill="${ground}"/>${decor}`;
}

function heroBadge(heroId) {
  if (typeof window !== "undefined" && window.AV?.[heroId]) {
    const svg = window.AV[heroId]();
    const inner = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
    return `<g transform="translate(24,140) scale(0.55)">${inner}</g>`;
  }
  return `<circle cx="70" cy="200" r="36" fill="#ffd86b"/><text x="70" y="208" text-anchor="middle" font-size="28">🧙</text>`;
}

function villainBadge(villainId, bossName) {
  const em = {
    goyle: "👹",
    crabbe: "😤",
    draco: "🐍",
    colagusano: "🕷️",
    quirrell: "🎭",
    basilisco: "🐍",
    dementor: "👻",
    snape: "🖤",
    bellatrix: "💜",
    lucius: "🦇",
    voldemort: "💀",
  }[villainId] || "⚡";
  const label = (bossName || villainId || "Rival").slice(0, 18);
  return `<g transform="translate(290,130)"><circle cx="0" cy="0" r="42" fill="#3b1a5a" stroke="#ffd86b" stroke-width="3"/><text x="0" y="8" text-anchor="middle" font-size="32">${em}</text><text x="0" y="58" text-anchor="middle" fill="#ffd86b" font-size="11">${label}</text></g>`;
}

function renderStoryScene(art, opts = {}) {
  const { heroId, villainId, bossName } = opts;
  const cap = SCENE_LABELS[art] || SCENE_LABELS.corridor;
  const title = `<text x="200" y="28" text-anchor="middle" fill="#ffd86b" font-size="13" font-weight="700">${cap}</text>`;
  return `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${cap}">${bgLayer(art || "corridor")}${title}${heroId ? heroBadge(heroId) : ""}${villainId || bossName ? villainBadge(villainId, bossName) : ""}</svg>`;
}

function sceneLooksBlank(html) {
  if (!html || html.length < 200) return true;
  if (!html.includes("<path") && !html.includes("<polygon") && !html.includes("<ellipse")) return true;
  return false;
}

window.StoryScenes = { renderStoryScene, sceneLooksBlank, bgLayer };