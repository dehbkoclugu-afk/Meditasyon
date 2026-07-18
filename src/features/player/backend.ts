import { createExpoAudioBackend } from './expoAudioBackend';
import type { AudioBackend } from './types';

// Web ve jest bu dosyayı görür (Metro çözümlemesi: .native.ts cihazda kazanır).
let singleton: AudioBackend | null = null;

export function getAudioBackend(): AudioBackend {
  if (!singleton) singleton = createExpoAudioBackend();
  return singleton;
}
