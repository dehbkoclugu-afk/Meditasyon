// Kilit ekranı / Now Playing kapak görselleri: her sesli seans için 600x600 PNG.
// CoverArt bileşenindeki seed'li kompozisyonun kare uyarlaması (aynı algoritma:
// fnv1a hash + mulberry32 + catmull-rom blob). Çıktı: content/art/<id>.png +
// src/content/artwork-map.ts (statik require haritası).
//
// Kullanım: node scripts/gen-artwork.mjs
// Not: Katalog değişince yeniden çalıştırın (CI content:validate haritayı denetler).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
const artDir = path.join(root, 'content', 'art');
const catalog = JSON.parse(readFileSync(path.join(root, 'content', 'catalog.json'), 'utf8'));

const CATEGORY_COLORS = {
  uyku: '#7C8FC9', odak: '#C9A96B', nefes: '#86B8A8', 'stres-kaygi': '#B98FA6',
  sabah: '#D9B98A', 'beden-taramasi': '#9FB08A', sukran: '#D0A98F', 'oz-sefkat': '#C39BB4',
};
const BG = '#0D1412';
const INK = '#F1EDE4';
const S = 600;

function hashSeed(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function blobPath(rand, cx, cy, r) {
  const n = 8;
  const pts = Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2;
    const radius = r * (0.72 + rand() * 0.4);
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  });
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    if (i === 0) d += `M ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} `;
    d += `C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return d + 'Z';
}

function sceneSvg(session) {
  const color = CATEGORY_COLORS[session.categories[0]] ?? '#C9A96B';
  const rand = mulberry32(hashSeed(session.id));
  let body = '';
  if (session.type === 'sleep_story') {
    const moonX = S * (0.55 + rand() * 0.25);
    let stars = '';
    for (let i = 0; i < 18; i++) {
      stars += `<circle cx="${(rand() * S).toFixed(0)}" cy="${(rand() * S * 0.65).toFixed(0)}" r="${(1.5 + rand() * 3).toFixed(1)}" fill="${INK}" opacity="${(0.3 + rand() * 0.6).toFixed(2)}"/>`;
    }
    const hill = blobPath(rand, S * 0.4, S * 1.25, S * 0.35);
    body = `<circle cx="${moonX}" cy="${S * 0.32}" r="${S * 0.22}" fill="url(#glow)"/>${stars}
      <circle cx="${moonX}" cy="${S * 0.32}" r="26" fill="${INK}" opacity="0.9"/>
      <path d="${hill}" fill="${color}66"/>`;
  } else if (session.type === 'breathing') {
    const cx = S / 2, cy = S / 2;
    body = [30, 60, 95, 135, 180]
      .map((r, i) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="3" opacity="${(0.9 - i * 0.16).toFixed(2)}"/>`)
      .join('') + `<circle cx="${cx}" cy="${cy}" r="10" fill="${color}"/>`;
  } else {
    const moonX = S * (0.25 + rand() * 0.5);
    const blob1 = blobPath(rand, S * (0.35 + rand() * 0.3), S * 0.58, S * 0.28);
    const blob2 = blobPath(rand, S * (0.45 + rand() * 0.25), S * (0.35 + rand() * 0.25), S * 0.16);
    body = `<circle cx="${moonX}" cy="${S * 0.4}" r="${S * 0.22}" fill="url(#glow)"/>
      <path d="${blob1}" fill="${color}55"/><path d="${blob2}" fill="${color}88"/>
      <circle cx="${moonX}" cy="${S * 0.4}" r="12" fill="${INK}" opacity="0.85"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    <defs><radialGradient id="glow"><stop offset="0%" stop-color="${color}" stop-opacity="0.5"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>
    <rect width="${S}" height="${S}" fill="${BG}"/><rect width="${S}" height="${S}" fill="${color}1F"/>${body}
  </svg>`;
}

const sessions = catalog.sessions.filter((s) => s.hasAudio);
mkdirSync(artDir, { recursive: true });

const { chromium } = require('playwright-core');
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM ?? '/opt/pw-browsers/chromium',
});
const page = await browser.newPage({ viewport: { width: S, height: S } });

for (const session of sessions) {
  await page.setContent(`<style>*{margin:0}</style>${sceneSvg(session)}`);
  const buffer = await page.screenshot({ type: 'png' });
  writeFileSync(path.join(artDir, `${session.id}.png`), buffer);
}
await browser.close();

const lines = sessions.map(
  (s) => `  '${s.id}': require('../../content/art/${s.id}.png'),`,
);
writeFileSync(
  path.join(root, 'src', 'content', 'artwork-map.ts'),
  `// OTOMATİK ÜRETİLDİ — elle düzenlemeyin. Yeniden üretmek için: node scripts/gen-artwork.mjs

export const artworkAssets: Record<string, number> = {
${lines.join('\n')}
};
`,
);
console.log(`${sessions.length} kapak + artwork-map.ts yazıldı.`);
