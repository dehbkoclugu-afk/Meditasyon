// content/audio/ içindeki dosyalardan statik require haritası üretir.
// Metro dinamik require desteklemediği için bu dosya otomatik üretilir.
// Kural: <id>.m4a varsa o, yoksa <id>.wav (placeholder).
//
// Kullanım: npm run content:map  (placeholders ve ingest sonrası otomatik çağrılır)

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const audioDir = path.join(root, 'content', 'audio');
const catalog = JSON.parse(readFileSync(path.join(root, 'content', 'catalog.json'), 'utf8'));

const ids = [
  ...catalog.sessions.filter((s) => s.hasAudio).map((s) => s.id),
  ...catalog.ambiences.map((a) => a.id),
];

const lines = [];
const missing = [];
for (const id of ids) {
  const ext = existsSync(path.join(audioDir, `${id}.m4a`))
    ? 'm4a'
    : existsSync(path.join(audioDir, `${id}.wav`))
      ? 'wav'
      : null;
  if (!ext) {
    missing.push(id);
    continue;
  }
  lines.push(`  '${id}': require('../../content/audio/${id}.${ext}'),`);
}

if (missing.length > 0) {
  console.error(`HATA: ses dosyası eksik: ${missing.join(', ')}`);
  console.error('Önce `npm run content:placeholders` veya ingest çalıştırın.');
  process.exit(1);
}

const out = `// OTOMATİK ÜRETİLDİ — elle düzenlemeyin. Yeniden üretmek için: npm run content:map

export const audioAssets: Record<string, number> = {
${lines.join('\n')}
};
`;

writeFileSync(path.join(root, 'src', 'content', 'audio-map.ts'), out);
console.log(`audio-map.ts: ${lines.length} kayıt yazıldı.`);
