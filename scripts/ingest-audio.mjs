// Ham kaydı (WAV) uygulama formatına işler — SENİN MAKİNENDE çalışır (ffmpeg gerekir).
//
// Kullanım:
//   npm run content:ingest -- content/raw/guided-uykuya-yumusak-gecis-tr.wav uykuya-yumusak-gecis
//   npm run content:ingest -- content/raw/amb-yagmur.wav amb-yagmur --ambience
//
// Yaptıkları:
//   1. Loudness normalizasyonu (konuşma -16 LUFS, ambience -20 LUFS; TP -1.5)
//   2. Baş/son sessizlik kırpma + 1.5 sn fade-in/out
//   3. AAC encode: konuşma 96 kbps mono, ambience 128 kbps stereo → content/audio/<id>.m4a
//   4. Süreyi ffprobe ile ölçüp catalog.json'daki durationSec'i günceller
//   5. Varsa .wav placeholder'ı siler, audio-map.ts'i yeniden üretir

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const [input, id, ...flags] = process.argv.slice(2);
const isAmbience = flags.includes('--ambience');

if (!input || !id) {
  console.error('Kullanım: npm run content:ingest -- <ham.wav> <seans-id> [--ambience]');
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`Girdi bulunamadı: ${input}`);
  process.exit(1);
}

try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
} catch {
  console.error('ffmpeg bulunamadı. Kurulum: https://ffmpeg.org/download.html (macOS: brew install ffmpeg)');
  process.exit(1);
}

const catalogPath = path.join(root, 'content', 'catalog.json');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const session = catalog.sessions.find((s) => s.id === id);
const ambience = catalog.ambiences.find((a) => a.id === id);
if (!session && !ambience) {
  console.error(`Katalogda '${id}' yok. Önce content/catalog.json'a ekleyin.`);
  process.exit(1);
}

const out = path.join(root, 'content', 'audio', `${id}.m4a`);
const loudness = isAmbience || ambience ? '-20' : '-16';
const bitrate = isAmbience || ambience ? '128k' : '96k';
const channels = isAmbience || ambience ? '2' : '1';

// silenceremove: baştaki ve sondaki -50dB altı sessizliği kırp; sonra fade.
// Süreyi fade için iki geçişte ölçüyoruz: önce trim'li ara dosya, sonra fade+encode.
const tmp = path.join(root, 'content', 'audio', `.${id}.tmp.wav`);
execFileSync('ffmpeg', [
  '-y', '-i', input,
  '-af',
  `silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.3,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.3,areverse,loudnorm=I=${loudness}:TP=-1.5:LRA=11`,
  tmp,
], { stdio: 'inherit' });

const durationSec = Math.round(
  parseFloat(
    execFileSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', tmp,
    ]).toString(),
  ),
);

execFileSync('ffmpeg', [
  '-y', '-i', tmp,
  '-af', `afade=t=in:d=1.5,afade=t=out:st=${Math.max(0, durationSec - 1.5)}:d=1.5`,
  '-c:a', 'aac', '-b:a', bitrate, '-ac', channels,
  out,
], { stdio: 'inherit' });
rmSync(tmp);

if (session) {
  session.durationSec = durationSec;
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
}

const placeholder = path.join(root, 'content', 'audio', `${id}.wav`);
if (existsSync(placeholder)) rmSync(placeholder);

execFileSync('node', [path.join(root, 'scripts', 'gen-asset-map.mjs')], { stdio: 'inherit' });

console.log(`Tamam: ${out} (${durationSec} sn). catalog.json ve audio-map.ts güncellendi.`);
console.log('Kontrol: dosyayı dinleyin, sonra commit edin.');
