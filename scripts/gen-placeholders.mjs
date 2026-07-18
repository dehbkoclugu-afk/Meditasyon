// Geliştirme için placeholder sesler üretir (gerçek kayıtlar gelene kadar).
// Saf Node — ffmpeg gerektirmez: 3 sn'lik yumuşak sinüs/gürültü WAV dosyaları.
// Gerçek kayıt ingest edilince (scripts/ingest-audio.mjs) aynı id'li .m4a
// dosyası yazılır ve .wav placeholder silinir.
//
// Kullanım: npm run content:placeholders

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const audioDir = path.join(root, 'content', 'audio');
const catalog = JSON.parse(readFileSync(path.join(root, 'content', 'catalog.json'), 'utf8'));

const SAMPLE_RATE = 8000;
const SECONDS = 3;

function wavFromSamples(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt boyutu
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bit depth
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  samples.forEach((s, i) => buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2));
  return buffer;
}

function fade(i, total) {
  const edge = SAMPLE_RATE * 0.5;
  return Math.min(1, i / edge, (total - i) / edge);
}

// Seanslar: nazik 220 Hz ton; ambiences: yumuşak gürültü — kulakta ayırt edilsin.
function toneSamples() {
  const total = SAMPLE_RATE * SECONDS;
  return Array.from({ length: total }, (_, i) => {
    const t = i / SAMPLE_RATE;
    return Math.sin(2 * Math.PI * 220 * t) * 0.12 * fade(i, total);
  });
}

function noiseSamples() {
  const total = SAMPLE_RATE * SECONDS;
  let last = 0;
  return Array.from({ length: total }, (_, i) => {
    // kaba bir low-pass: beyaz gürültüyü yumuşat
    last = last * 0.95 + (Math.random() * 2 - 1) * 0.05;
    return last * 0.8 * fade(i, total);
  });
}

mkdirSync(audioDir, { recursive: true });

let created = 0;
let skipped = 0;

const targets = [
  ...catalog.sessions.filter((s) => s.hasAudio).map((s) => ({ id: s.id, kind: 'tone' })),
  ...catalog.ambiences.map((a) => ({ id: a.id, kind: 'noise' })),
];

for (const { id, kind } of targets) {
  const real = path.join(audioDir, `${id}.m4a`);
  const placeholder = path.join(audioDir, `${id}.wav`);
  if (existsSync(real) || existsSync(placeholder)) {
    skipped += 1;
    continue;
  }
  const samples = kind === 'noise' ? noiseSamples() : toneSamples();
  writeFileSync(placeholder, wavFromSamples(samples));
  created += 1;
}

console.log(`placeholder: ${created} üretildi, ${skipped} atlandı (mevcut).`);
