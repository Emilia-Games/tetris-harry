#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import harry from "./heroes/harry.mjs";
import hermione from "./heroes/hermione.mjs";
import ron from "./heroes/ron.mjs";
import neville from "./heroes/neville.mjs";
import luna from "./heroes/luna.mjs";
import ginny from "./heroes/ginny.mjs";

const MASTER_STORIES = { harry, hermione, ron, neville, luna, ginny };
const STORY_READY_HEROES = Object.keys(MASTER_STORIES);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const STORY_SPELLS = {
  lumos: { id: "lumos", icon: "💡", name: "Lumos", effect: "Cada línea te da un poquito de magia (+3 vida)." },
  expelliarmus: { id: "expelliarmus", icon: "🪄", name: "Expelliarmus", effect: "Tus hechizos hacen más daño (+30%)." },
  protego: { id: "protego", icon: "🛡️", name: "Protego", effect: "Los hechizos del rival pegan menos (−25% daño)." },
  patronus: { id: "patronus", icon: "🦌", name: "Expecto Patronum", effect: "¡2 líneas cuentan como hechizo fuerte (nivel 2)!" },
  stupefy: { id: "stupefy", icon: "⚡", name: "Stupefy", effect: "Puedes guardar hasta 5 hechizos en el botón ✨." },
  aguamenti: { id: "aguamenti", icon: "💧", name: "Aguamenti", effect: "Al usar ✨ también te curas un poco." },
  reparo: { id: "reparo", icon: "🔧", name: "Reparo", effect: "Si el tablero se llena, el rescate cuesta menos vida." },
  reducto: { id: "reducto", icon: "💥", name: "Reducto", effect: "+10 de daño en cada hechizo." },
};

/** Misma topología para todos los héroes; textos distintos en MASTER_STORIES */
const GRAPH_NODES = {
  n01: { type: "narrative", next: "n02" },
  n02: { type: "narrative", next: "n03" },
  n03: {
    type: "choice",
    choiceKey: "c1",
    promptFromContent: true,
    options: [
      { id: "A", branch: "forest", next: "n04f", labelFrom: "followUpA" },
      { id: "B", branch: "library", next: "n04l", labelFrom: "followUpB" },
    ],
  },
  n04f: { type: "narrative", next: "n05f" },
  n04l: { type: "narrative", next: "n05l" },
  n05f: { type: "duel", villainId: "goyle", spell: "lumos", rewardTitle: "¡Nueva magia!", next: "n06" },
  n05l: { type: "duel", villainId: "crabbe", spell: "lumos", rewardTitle: "¡Nueva magia!", next: "n06" },
  n06: { type: "narrative", next: "n07" },
  n07: { type: "narrative", next: "n08" },
  n08: {
    type: "choice",
    choiceKey: "c2",
    promptFromContent: true,
    options: [
      { id: "A", branch: "tower", next: "n09", labelFrom: "followUpA" },
      { id: "B", branch: "bridge", next: "n10p", labelFrom: "followUpB" },
    ],
  },
  n09: { type: "narrative", next: "n10t" },
  n10t: { type: "duel", villainId: "draco", spell: "expelliarmus", rewardTitle: "¡Nueva magia!", next: "n11" },
  n10p: { type: "duel", villainId: "colagusano", spell: "expelliarmus", rewardTitle: "¡Nueva magia!", next: "n11" },
  n11: { type: "narrative", next: "n12" },
  n12: { type: "duel", villainId: "quirrell", spell: "protego", rewardTitle: "¡Subiste de nivel!", next: "n13" },
  n13: { type: "narrative", next: "n14" },
  n14: {
    type: "choice",
    choiceKey: "c3",
    promptFromContent: true,
    options: [
      { id: "A", branch: "courtyard", next: "n15", labelFrom: "followUpA" },
      { id: "B", branch: "dungeon", next: "n16b", labelFrom: "followUpB" },
    ],
  },
  n15: { type: "narrative", next: "n16a" },
  n16a: { type: "duel", villainId: "basilisco", spell: "patronus", rewardTitle: "¡Nueva magia!", next: "n17" },
  n16b: { type: "duel", villainId: "dementor", spell: "patronus", rewardTitle: "¡Nueva magia!", next: "n17" },
  n17: { type: "narrative", next: "n18" },
  n18: { type: "duel", villainId: "snape", spell: "stupefy", rewardTitle: "¡Nueva magia!", next: "n19" },
  n19: { type: "narrative", next: "n20" },
  n20: { type: "duel", villainId: "bellatrix", spell: "reparo", rewardTitle: "¡Subiste de nivel!", next: "n21" },
  n21: { type: "narrative", next: "n22" },
  n22: { type: "duel", villainId: "lucius", spell: "reducto", rewardTitle: "¡Nueva magia!", next: "n23" },
  n23: { type: "narrative", next: "n24" },
  n24: {
    type: "duel",
    villainId: "voldemort",
    spell: "aguamenti",
    rewardTitle: "¡Historia completada!",
    next: null,
    finale: true,
  },
};

const MAP_ORDER = [
  "n01",
  "n02",
  "n03",
  "n04f",
  "n04l",
  "n05f",
  "n05l",
  "n06",
  "n07",
  "n08",
  "n09",
  "n10t",
  "n10p",
  "n11",
  "n12",
  "n13",
  "n14",
  "n15",
  "n16a",
  "n16b",
  "n17",
  "n18",
  "n19",
  "n20",
  "n21",
  "n22",
  "n23",
  "n24",
];

const ALL_HERO_IDS = [
  "harry",
  "hermione",
  "ron",
  "neville",
  "luna",
  "ginny",
  "fred",
  "george",
  "sirius",
  "mcgonagall",
  "molly",
  "arthur",
  "dobby",
];
for (const hid of STORY_READY_HEROES) {
  const n = Object.keys(MASTER_STORIES[hid]).length;
  if (n < 24) throw new Error(`${hid} solo tiene ${n} episodios`);
}

const out = `/* Generado por scripts/build-stories.mjs — no editar a mano */
"use strict";
window.StoryData = ${JSON.stringify(
  {
    STORY_SPELLS,
    GRAPH_NODES,
    MAP_ORDER,
    MASTER_STORIES,
    START_NODE: "n01",
    HERO_IDS: ALL_HERO_IDS,
    STORY_READY_HEROES,
    EPISODES_PER_HERO: Object.fromEntries(
      ALL_HERO_IDS.map((h) => [h, MASTER_STORIES[h] ? Object.keys(MASTER_STORIES[h]).length : 0])
    ),
  },
  null,
  0
)};
`;

writeFileSync(join(root, "stories.js"), out);
console.log("Wrote stories.js", STORY_READY_HEROES.length, "ready heroes,", MAP_ORDER.length, "graph nodes");