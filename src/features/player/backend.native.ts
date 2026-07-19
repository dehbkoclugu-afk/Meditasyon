import { NativeModules } from 'react-native';

import { createExpoAudioBackend } from './expoAudioBackend';
import type { AudioBackend, PlaybackStatus, TrackMeta } from './types';

// Cihaz backend'i: react-native-track-player (kilit ekranı + background).
// RNTP native modülü yoksa (Expo Go) expo-audio'ya düşer — uygulama yine çalışır,
// yalnız kilit ekranı kontrolleri dev build ister.

function hasTrackPlayerModule(): boolean {
  return NativeModules.TrackPlayerModule != null;
}

function createTrackPlayerBackend(): AudioBackend {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const TrackPlayer = require('react-native-track-player')
    .default as typeof import('react-native-track-player').default;
  const { Capability, State, Event } =
    require('react-native-track-player') as typeof import('react-native-track-player');
  /* eslint-enable @typescript-eslint/no-require-imports */

  let setupDone = false;
  let finished = false;

  async function ensureSetup() {
    if (setupDone) return;
    await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
    await TrackPlayer.updateOptions({
      forwardJumpInterval: 15,
      backwardJumpInterval: 15,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.JumpForward,
        Capability.JumpBackward,
        Capability.SeekTo,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
      finished = true;
    });
    setupDone = true;
  }

  return {
    async load(asset: number, meta: TrackMeta, startAtSec: number) {
      await ensureSetup();
      finished = false;
      await TrackPlayer.reset();
      // url tipinde require() numaraları görünmüyor ama RNTP çalışma zamanında destekler
      await TrackPlayer.add({
        url: asset as unknown as string,
        title: meta.title,
        artist: meta.artist,
        artwork: meta.artwork as unknown as string,
      });
      if (startAtSec > 0) await TrackPlayer.seekTo(startAtSec);
    },

    async play() {
      await TrackPlayer.play();
    },

    async pause() {
      await TrackPlayer.pause();
    },

    async seekTo(sec: number) {
      await TrackPlayer.seekTo(Math.max(0, sec));
    },

    async setVolume(volume: number) {
      await TrackPlayer.setVolume(Math.min(1, Math.max(0, volume)));
    },

    async getStatus(): Promise<PlaybackStatus> {
      const [{ position, duration }, playback] = await Promise.all([
        TrackPlayer.getProgress(),
        TrackPlayer.getPlaybackState(),
      ]);
      const didJustFinish = finished;
      finished = false;
      return {
        isPlaying: playback.state === State.Playing,
        positionSec: position,
        durationSec: duration,
        didJustFinish,
      };
    },

    async unload() {
      await TrackPlayer.reset();
    },
  };
}

let singleton: AudioBackend | null = null;

export function getAudioBackend(): AudioBackend {
  if (!singleton) {
    singleton = hasTrackPlayerModule() ? createTrackPlayerBackend() : createExpoAudioBackend();
  }
  return singleton;
}
