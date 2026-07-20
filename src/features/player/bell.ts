import { createAudioPlayer } from 'expo-audio';

import { useSettings } from '@/stores/settings';

// Seans bitiş çanı — sentezlenmiş tibet kasesi (scripts/gen-bell.mjs).
// Gerçek kayıt gelirse assets/audio/bell.wav değiştirilir, kod aynı kalır.

const BELL = require('../../../assets/audio/bell.wav') as number;

export function playBell(volume = 0.6): void {
  try {
    const player = createAudioPlayer(BELL);
    player.volume = volume;
    player.play();
    setTimeout(() => player.remove(), 4500);
  } catch {
    // ses çalınamıyorsa sessizce geç — çan kritik değil
  }
}

export function playBellIfEnabled(): void {
  if (!useSettings.getState().bellEnabled) return;
  playBell();
}
