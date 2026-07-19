// Bitiş çanı sentezi: tibet kasesi benzeri, saf Node WAV (ffmpeg gerekmez).
// Temel 432 Hz + inharmonik üst tonlar, üstel sönüm — yumuşak tek vuruş.
// Gerçek kayıtla değiştirmek istersen: assets/audio/bell.wav dosyasının
// üzerine yaz (aynı ad), kod değişmez.
//
// Kullanım: node scripts/gen-bell.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'assets', 'audio');
const SAMPLE_RATE = 22050;
const SECONDS = 4;

// Çan modları: [frekans çarpanı, genlik, sönüm hızı]
const MODES = [
  [1.0, 0.55, 1.1],
  [2.71, 0.22, 1.9],
  [4.95, 0.12, 2.6],
  [7.4, 0.06, 3.4],
];
const BASE_HZ = 432;

const total = SAMPLE_RATE * SECONDS;
const samples = new Array(total).fill(0);
for (let i = 0; i < total; i++) {
  const t = i / SAMPLE_RATE;
  let v = 0;
  for (const [mult, amp, decay] of MODES) {
    v += amp * Math.sin(2 * Math.PI * BASE_HZ * mult * t) * Math.exp(-decay * t);
  }
  // vuruş yumuşatma: ilk 8 ms'de fade-in (tık sesini önler)
  const attack = Math.min(1, t / 0.008);
  samples[i] = v * attack * 0.5;
}

const dataSize = total * 2;
const buffer = Buffer.alloc(44 + dataSize);
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);
samples.forEach((s, i) => buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), 44 + i * 2));

mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'bell.wav'), buffer);
console.log(`bell.wav yazıldı (${(buffer.length / 1024).toFixed(0)} KB)`);
