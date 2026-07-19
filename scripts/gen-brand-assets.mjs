// Marka görselleri üreteci: uygulama ikonu, splash, Android adaptive katmanları,
// favicon. Chromium (playwright-core) ile SVG'den PNG render eder.
// Motif: gece ormanı zemininde amber nefes halkası + hale (BreathRing imzası).
//
// Kullanım: node scripts/gen-brand-assets.mjs
// Gereksinim: playwright-core + Chromium (CI/geliştirme ortamında mevcut;
// PLAYWRIGHT_CHROMIUM yolu ile özelleştirilebilir).

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
const out = (...p) => path.join(root, 'assets', 'images', ...p);

const BG = '#0D1412';
const AMBER = '#E4B75D';
const HALO = 'rgba(228, 183, 93, 0.14)';

// ring: [dış yarıçap oranı, çizgi kalınlığı oranı]
function ringSvg({ size, bg, ringScale = 1, withBg = true }) {
  const c = size / 2;
  const r = size * 0.30 * ringScale;
  const halo = size * 0.42 * ringScale;
  const stroke = Math.max(4, size * 0.022 * ringScale);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  ${withBg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : ''}
  <circle cx="${c}" cy="${c}" r="${halo}" fill="${HALO}"/>
  <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${AMBER}" stroke-width="${stroke}"/>
  <circle cx="${c}" cy="${c - r}" r="${stroke * 1.6}" fill="#F1EDE4"/>
</svg>`;
}

async function render(page, svg, size, file) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>*{margin:0;padding:0}body{background:transparent}</style>${svg}`,
  );
  const buffer = await page.screenshot({ omitBackground: true, type: 'png' });
  writeFileSync(file, buffer);
  console.log(path.relative(root, file), `${(buffer.length / 1024).toFixed(0)} KB`);
}

const { chromium } = require('playwright-core');
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM ?? '/opt/pw-browsers/chromium',
});
const page = await browser.newPage();

// 1024 ana ikon (iOS + genel)
await render(page, ringSvg({ size: 1024, bg: BG }), 1024, out('icon.png'));
// Splash: şeffaf zemin, yalnız halka (arka plan rengi app.json'da)
await render(page, ringSvg({ size: 512, bg: BG, withBg: false }), 512, out('splash-icon.png'));
// Android adaptive: ön katman (şeffaf, güvenli alan için küçük halka), arka düz renk zaten app.json'da
await render(page, ringSvg({ size: 1024, bg: BG, ringScale: 0.62, withBg: false }), 1024, out('android-icon-foreground.png'));
// Android arka plan katmanı: düz zemin
await render(page, `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${BG}"/></svg>`, 1024, out('android-icon-background.png'));
// Monochrome (Android 13 temalı ikon): tek renk halka
await render(
  page,
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
    <circle cx="512" cy="512" r="196" fill="none" stroke="white" stroke-width="40"/>
    <circle cx="512" cy="316" r="52" fill="white"/>
  </svg>`,
  1024,
  out('android-icon-monochrome.png'),
);
// Favicon
await render(page, ringSvg({ size: 48, bg: BG }), 48, out('favicon.png'));

await browser.close();
console.log('Marka görselleri üretildi.');
