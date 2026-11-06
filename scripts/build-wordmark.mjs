/**
 * Builds the footer wordmark as a clean vector SVG at build time:
 * "@PALOMAGTZR" in Fredoka 700 converted to paths (fontkit), a slime cap per
 * letter (the letter's own outline widened by a round stroke, clipped to a wavy
 * top band), rounded drips and white gloss. No font is loaded in the browser.
 * Output: src/assets/palomagtzr_wordmark.inline.svg + src/data/wordmark.json
 */
import { openSync } from 'fontkit';
import { writeFileSync } from 'node:fs';

const TEXT = '@PALOMAGTZR';
const TARGET_WIDTH = 2172;
const TRACKING = -0.035; // em
const EXPAND = 12; // stroke width → ~6 units of expansion
const RIM = 6;

const font = openSync('node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff2');
const run = font.layout(TEXT);
const upm = font.unitsPerEm;
const advUnits = run.positions.reduce((a, p) => a + p.xAdvance, 0) + TRACKING * upm * (run.glyphs.length - 1);
const S = TARGET_WIDTH / advUnits; // font units → SVG units
const f2 = (n) => Number(n.toFixed(1));

// seeded pseudo-random so the drawing is stable between builds
let seed = 7;
const rnd = (a, b) => { seed = (seed * 9301 + 49297) % 233280; return a + (seed / 233280) * (b - a); };

// ---- letters ----
let x = 0;
const letters = [];
run.glyphs.forEach((g, i) => {
  const pos = run.positions[i];
  const path = g.path.transform(S, 0, 0, -S, x + pos.xOffset * S, 0); // y-down, baseline at 0
  const b = path.bbox;
  letters.push({ ch: TEXT[i], d: path.toSVG(), minX: b.minX, maxX: b.maxX, minY: b.minY, maxY: b.maxY });
  x += pos.xAdvance * S + TRACKING * upm * S;
});
const top = Math.min(...letters.map((l) => l.minY));
const bottom = Math.max(...letters.map((l) => l.maxY));

// ---- slime band per letter: wavy bottom edge (cubic beziers only) ----
function band(l) {
  const H = l.maxY - l.minY;
  const x0 = l.minX - EXPAND, x1 = l.maxX + EXPAND;
  const yTop = l.minY - EXPAND - 4;
  const edge = l.minY + H * 0.45;
  const bumps = Math.max(2, Math.round((x1 - x0) / 95));
  const w = (x1 - x0) / bumps;
  let d = `M${f2(x1)} ${f2(yTop)} L${f2(x0)} ${f2(yTop)} L${f2(x0)} ${f2(edge)}`;
  // wave from left to right
  let px = x0, py = edge;
  for (let k = 0; k < bumps; k++) {
    const amp = H * rnd(0.05, 0.11);
    const nx = px + w, ny = edge + (k === bumps - 1 ? 0 : rnd(-H * 0.03, H * 0.03));
    d += ` C${f2(px + w * 0.3)} ${f2(py + amp)} ${f2(px + w * 0.7)} ${f2(ny - amp * 0.6)} ${f2(nx)} ${f2(ny)}`;
    px = nx; py = ny;
  }
  d += ' Z';
  return { d, edge, x0, x1, H };
}

// ---- rounded drip hanging from the band edge ----
function drip(cx, y0, w, L) {
  const r = w * 0.95; // bulb wider than the neck so it reads as a drop
  const yb = y0 + L;
  return [
    `M${f2(cx - w / 2)} ${f2(y0)}`,
    `C${f2(cx - w / 2)} ${f2(y0 + L * 0.5)} ${f2(cx - r)} ${f2(yb - r * 1.6)} ${f2(cx - r)} ${f2(yb - r * 0.9)}`,
    `C${f2(cx - r)} ${f2(yb - r * 0.1)} ${f2(cx - r * 0.55)} ${f2(yb)} ${f2(cx)} ${f2(yb)}`,
    `C${f2(cx + r * 0.55)} ${f2(yb)} ${f2(cx + r)} ${f2(yb - r * 0.1)} ${f2(cx + r)} ${f2(yb - r * 0.9)}`,
    `C${f2(cx + r)} ${f2(yb - r * 1.6)} ${f2(cx + w / 2)} ${f2(y0 + L * 0.5)} ${f2(cx + w / 2)} ${f2(y0)}`,
    'Z',
  ].join(' ');
}

const HANGING = new Set([0, 2, 4, 6, 8, 10]); // "@", "A", "O", "A", "T", "R" get a drip that hangs below the letter
const defs = [];
const ink = [];
const slimeShadow = [];
const slimeMain = [];
const dripShadow = [];
const dripMain = [];
const gloss = [];
const tips = [];

letters.forEach((l, i) => {
  const bd = band(l);
  defs.push(`<clipPath id="wb${i}"><path d="${bd.d}"/></clipPath>`);
  defs.push(`<clipPath id="wu${i}"><path d="${bd.d}" transform="translate(0 -${RIM})"/></clipPath>`);
  defs.push(`<clipPath id="wl${i}"><path d="${l.d}"/></clipPath>`);
  ink.push(l.d);
  const letter = `<path d="${l.d}" stroke-width="${EXPAND}" stroke-linejoin="round" stroke-linecap="round"`;
  slimeShadow.push(`<g clip-path="url(#wb${i})" opacity="0.4">${letter} fill="#B87F00" stroke="#B87F00"/></g>`);
  slimeMain.push(`<g clip-path="url(#wu${i})">${letter} fill="url(#wm-grad)" stroke="url(#wm-grad)"/></g>`);

  // drips: one or two per letter, hanging ones go below the baseline
  const W = bd.x1 - bd.x0;
  const n = W > 190 ? 2 : 1;
  for (let k = 0; k < n; k++) {
    const cx = bd.x0 + W * (n === 1 ? rnd(0.3, 0.7) : k === 0 ? rnd(0.18, 0.36) : rnd(0.62, 0.82));
    const hang = HANGING.has(i) && k === (n - 1);
    const w = hang ? rnd(20, 26) : rnd(22, 30);
    const L = hang ? l.maxY + rnd(36, 84) - (bd.edge - 10) : bd.H * rnd(0.16, 0.3);
    const d = drip(cx, bd.edge - 10, w, L);
    dripShadow.push(`<path d="${d}" fill="#B87F00" opacity="0.4" transform="translate(0 ${RIM})"/>`);
    dripMain.push(`<path d="${d}" fill="url(#wm-grad)"/>`);
    if (hang) tips.push([f2(cx), f2(bd.edge - 10 + L)]);
  }

  // gloss: an arc at the top-left of the slime plus a dot, kept inside the letter
  const cxl = (l.minX + l.maxX) / 2;
  const ax = cxl - W * 0.24, ay = l.minY + bd.H * 0.3;
  const bx = cxl - W * 0.02, by = l.minY + bd.H * 0.09;
  gloss.push(`<g clip-path="url(#wl${i})"><path d="M${f2(ax)} ${f2(ay)} C${f2(ax + (bx - ax) * 0.2)} ${f2(ay - (ay - by) * 0.7)} ${f2(ax + (bx - ax) * 0.6)} ${f2(by)} ${f2(bx)} ${f2(by)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="11" stroke-linecap="round"/><circle cx="${f2(bx + W * 0.12)}" cy="${f2(by + bd.H * 0.07)}" r="6" fill="#FFFFFF" fill-opacity="0.9"/></g>`);
});

const minX = Math.min(...letters.map((l) => l.minX)) - EXPAND - 4;
const maxX = Math.max(...letters.map((l) => l.maxX)) + EXPAND + 4;
const maxTip = Math.max(...tips.map((t) => t[1]));
const vb = { x: f2(minX), y: f2(top - EXPAND - 8), w: f2(maxX - minX), h: f2(maxTip + 24 - (top - EXPAND - 8)) };

const svg = `<defs>
<linearGradient id="wm-grad" gradientUnits="userSpaceOnUse" x1="0" y1="${f2(top)}" x2="0" y2="${f2(bottom)}"><stop offset="0" stop-color="#FFD23F"/><stop offset="1" stop-color="#E0A100"/></linearGradient>
${defs.join('\n')}
</defs>
<path id="wm-ink" d="${ink.join(' ')}" fill="#141414"/>
<g id="wm-slime">
${slimeShadow.join('\n')}
${dripShadow.join('\n')}
${slimeMain.join('\n')}
${dripMain.join('\n')}
</g>
<g id="wm-gloss">
${gloss.join('\n')}
</g>`;

writeFileSync('src/assets/palomagtzr_wordmark.inline.svg', svg);
writeFileSync('src/data/wordmark.json', JSON.stringify({ viewBox: `${vb.x} ${vb.y} ${vb.w} ${vb.h}`, tips, floor: f2(vb.y + vb.h + 110) }, null, 2));
writeFileSync('/private/tmp/claude-501/-Users-paloma-Developer-portfolio/f0a82c4a-b49e-403f-a319-4f98e0963b5e/scratchpad/wordmark-preview.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" width="${vb.w * 2}" height="${vb.h * 2}"><rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="#F6F4EE"/>${svg}</svg>`);
console.log('wordmark built', vb, 'tips', tips.length, 'bytes', svg.length);
