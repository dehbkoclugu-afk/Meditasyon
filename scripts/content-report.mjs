// İçerik stüdyo raporu: kayıt kapsamı + kalite özeti.
// - Hangi seansların gerçek kaydı (m4a) var, hangileri placeholder (wav)?
// - ffprobe varsa: dosya süresi ile katalogdaki durationSec karşılaştırması (±%20)
// - Kategori kapsamı ve öncelikli eksik listesi (ücretsizler önce)
//
// Kullanım: npm run content:report

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const audioDir = path.join(root, 'content', 'audio');
const catalog = JSON.parse(readFileSync(path.join(root, 'content', 'catalog.json'), 'utf8'));

let hasFfprobe = true;
try {
  execFileSync('ffprobe', ['-version'], { stdio: 'ignore' });
} catch {
  hasFfprobe = false;
}

function fileDuration(file) {
  if (!hasFfprobe) return null;
  try {
    return parseFloat(
      execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]).toString(),
    );
  } catch {
    return null;
  }
}

const rows = [];
for (const s of catalog.sessions.filter((x) => x.hasAudio)) {
  const m4a = path.join(audioDir, `${s.id}.m4a`);
  const wav = path.join(audioDir, `${s.id}.wav`);
  const real = existsSync(m4a);
  const file = real ? m4a : existsSync(wav) ? wav : null;
  const dur = file && real ? fileDuration(file) : null;
  const durOk = dur == null ? null : Math.abs(dur - s.durationSec) / s.durationSec <= 0.2;
  rows.push({ id: s.id, access: s.access, real, dur, planned: s.durationSec, durOk });
}
const ambMissing = catalog.ambiences.filter(
  (a) => !existsSync(path.join(audioDir, `${a.id}.m4a`)),
);

const recorded = rows.filter((r) => r.real);
const missing = rows.filter((r) => !r.real);
const missingFree = missing.filter((r) => r.access === 'free');
const missingPremium = missing.filter((r) => r.access === 'premium');

console.log('=== İÇERİK RAPORU ===\n');
console.log(`Kayıtlı (m4a): ${recorded.length}/${rows.length} seans`);
if (hasFfprobe) {
  const off = recorded.filter((r) => r.durOk === false);
  for (const r of off) {
    console.log(`  ⚠ ${r.id}: dosya ${Math.round(r.dur)} sn, katalog ${r.planned} sn (±%20 dışı)`);
  }
} else {
  console.log('  (ffprobe yok — süre karşılaştırması atlandı)');
}

console.log(`\nEksik kayıtlar: ${missing.length} seans + ${ambMissing.length} ambience`);
if (missingFree.length) {
  console.log('\nÖNCE BUNLAR (ücretsiz vitrin):');
  for (const r of missingFree) console.log(`  - ${r.id} (${Math.round(r.planned / 60)} dk)`);
}
if (missingPremium.length) {
  console.log('\nSonra (premium):');
  for (const r of missingPremium) console.log(`  - ${r.id} (${Math.round(r.planned / 60)} dk)`);
}
if (ambMissing.length) {
  console.log('\nAmbience:');
  for (const a of ambMissing) console.log(`  - ${a.id}`);
}

console.log('\nKategori kapsamı:');
for (const c of catalog.categories) {
  const inCat = catalog.sessions.filter((s) => s.categories.includes(c.id));
  const done = inCat.filter((s) => !s.hasAudio || existsSync(path.join(audioDir, `${s.id}.m4a`)));
  console.log(`  ${c.id}: ${done.length}/${inCat.length}`);
}

const totalMin = rows.reduce((sum, r) => sum + r.planned, 0) / 60;
console.log(`\nToplam planlanan içerik: ${Math.round(totalMin)} dk`);
