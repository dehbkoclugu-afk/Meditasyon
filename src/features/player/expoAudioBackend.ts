import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import type { AudioBackend, PlaybackStatus, TrackMeta } from './types';

// expo-audio tabanlı backend: web önizlemesi ve Expo Go için.
// Kilit ekranı kontrolleri yoktur; cihazdaki gerçek deneyim RNTP backend'indedir.

export function createExpoAudioBackend(): AudioBackend {
  let player: AudioPlayer | null = null;
  let finished = false;

  return {
    async load(asset: number, _meta: TrackMeta, startAtSec: number) {
      await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(
        () => {}, // web'de desteklenmeyen alanlar sessizce geçilir
      );
      player = createAudioPlayer(asset);
      finished = false;
      player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) finished = true;
      });
      if (startAtSec > 0) await player.seekTo(startAtSec);
    },

    async play() {
      player?.play();
    },

    async pause() {
      player?.pause();
    },

    async seekTo(sec: number) {
      await player?.seekTo(Math.max(0, sec));
    },

    async setVolume(volume: number) {
      if (player) player.volume = Math.min(1, Math.max(0, volume));
    },

    async getStatus(): Promise<PlaybackStatus> {
      if (!player) return { isPlaying: false, positionSec: 0, durationSec: 0, didJustFinish: false };
      const didJustFinish = finished;
      finished = false;
      return {
        isPlaying: player.playing,
        positionSec: player.currentTime ?? 0,
        durationSec: player.duration ?? 0,
        didJustFinish,
      };
    },

    async unload() {
      player?.remove();
      player = null;
    },
  };
}
