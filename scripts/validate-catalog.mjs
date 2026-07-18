// Katalog yapısal doğrulaması — CI'da koşar (npm run content:validate).
// Zod şema doğrulaması jest tarafında (src/content/catalog.test.ts);
// burada dosya sistemi ve referans bütünlüğü denetlenir.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const audioDir = path.join(root, 'content', 'audio');
const catalog = JSON.parse(readFileSync(path.join(root, 'content', 'catalog.json'), 'utf8'));

const errors = [];

// 1. Benzersiz id'ler
const allIds = [
  ...catalog.sessions.map((s) => s.id),
  ...catalog.programs.map((p) => p.id),
  ...catalog.ambiences.map((a) => a.id),
];
const dupes = allIds.filter((id, i) => allIds.indexOf(id) !== i);
if (dupes.length) errors.push(`Tekrarlanan id: ${[...new Set(dupes)].join(', ')}`);

// 2. Program günleri var olan seanslara işaret etmeli
const sessionIds = new Set(catalog.sessions.map((s) => s.id));
for (const program of catalog.programs) {
  for (const day of program.days) {
    if (!sessionIds.has(day)) errors.push(`Program ${program.id}: bilinmeyen seans '${day}'`);
  }
}

// 3. Kategori referansları
const categoryIds = new Set(catalog.categories.map((c) => c.id));
for (const session of catalog.sessions) {
  for (const cat of session.categories) {
    if (!categoryIds.has(cat)) errors.push(`Seans ${session.id}: bilinmeyen kategori '${cat}'`);
  }
}

// 4. Ses dosyaları: hasAudio=true seanslar + tüm ambiences için dosya şart
const needAudio = [
  ...catalog.sessions.filter((s) => s.hasAudio).map((s) => s.id),
  ...catalog.ambiences.map((a) => a.id),
];
for (const id of needAudio) {
  const hasFile = existsSync(path.join(audioDir, `${id}.m4a`)) || existsSync(path.join(audioDir, `${id}.wav`));
  if (!hasFile) errors.push(`Ses dosyası eksik: ${id} (content/audio/${id}.m4a|.wav)`);
}

// 5. Yetim ses dosyaları (katalogda karşılığı olmayan)
const known = new Set(needAudio);
if (existsSync(audioDir)) {
  for (const file of readdirSync(audioDir)) {
    const id = file.replace(/\.(m4a|wav)$/, '');
    if (!known.has(id)) errors.push(`Yetim ses dosyası: content/audio/${file}`);
  }
}

// 6. audio-map.ts güncel mi
const mapPath = path.join(root, 'src', 'content', 'audio-map.ts');
if (!existsSync(mapPath)) {
  errors.push('src/content/audio-map.ts yok — `npm run content:map` çalıştırın');
} else {
  const map = readFileSync(mapPath, 'utf8');
  for (const id of needAudio) {
    if (!map.includes(`'${id}':`)) errors.push(`audio-map.ts eski: '${id}' yok — npm run content:map`);
  }
}

if (errors.length) {
  console.error('Katalog doğrulaması BAŞARISIZ:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `Katalog geçerli: ${catalog.sessions.length} seans, ${catalog.programs.length} program, ${catalog.ambiences.length} ambience.`,
);
