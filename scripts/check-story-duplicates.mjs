#!/usr/bin/env node
import harry from "./heroes/harry.mjs";
import hermione from "./heroes/hermione.mjs";
import ron from "./heroes/ron.mjs";
import neville from "./heroes/neville.mjs";
import luna from "./heroes/luna.mjs";
import ginny from "./heroes/ginny.mjs";

const heroes = { harry, hermione, ron, neville, luna, ginny };
const banned = [
  "vibra como aviso",
  "debes decidir con cabeza fresca",
  "bloquea tu camino",
  "Usa piezas de Tetris como hechizos",
];

function collectLines(obj) {
  const out = [];
  for (const ep of Object.values(obj)) {
    ep.lines?.forEach((l) => out.push(l.trim()));
    ep.followUpA?.lines?.forEach((l) => out.push(l.trim()));
    ep.followUpB?.lines?.forEach((l) => out.push(l.trim()));
  }
  return out;
}

const byLine = new Map();
for (const [hid, data] of Object.entries(heroes)) {
  for (const line of collectLines(data)) {
    if (!line) continue;
    const key = line.replace(/\{name\}/gi, "NAME");
    if (!byLine.has(key)) byLine.set(key, []);
    byLine.get(key).push(hid);
  }
}

let dupAcross = 0;
let bannedHits = 0;
for (const [line, list] of byLine) {
  const unique = [...new Set(list)];
  if (unique.length > 1) {
    dupAcross++;
    if (dupAcross <= 5) console.error("DUPLICATE:", unique.join(","), "→", line.slice(0, 60));
  }
  for (const b of banned) {
    if (line.toLowerCase().includes(b.toLowerCase())) {
      bannedHits++;
      console.error("BANNED PHRASE:", b, "in", line.slice(0, 50));
    }
  }
}

const totalDup = [...byLine.entries()].filter(([, v]) => new Set(v).size > 1).length;
console.log(JSON.stringify({ heroes: 6, uniqueLines: byLine.size, duplicateAcrossHeroes: totalDup, bannedPhraseHits: bannedHits }, null, 2));
if (totalDup > 3 || bannedHits > 0) process.exit(1);