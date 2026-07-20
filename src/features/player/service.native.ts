import { NativeModules } from 'react-native';

import { useSettings } from '@/stores/settings';

// RNTP playback service: kilit ekranı / bildirim kontrollerinden gelen
// uzaktan komutları işler. index.js'te uygulama açılırken kaydedilir.

export function registerPlaybackServiceIfAvailable(): void {
  if (NativeModules.TrackPlayerModule == null) return; // Expo Go / RNTP'siz ortam

  /* eslint-disable @typescript-eslint/no-require-imports */
  const TrackPlayer = require('react-native-track-player')
    .default as typeof import('react-native-track-player').default;
  const { Event } =
    require('react-native-track-player') as typeof import('react-native-track-player');
  /* eslint-enable @typescript-eslint/no-require-imports */

  TrackPlayer.registerPlaybackService(() => async () => {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteJumpForward, async ({ interval }) => {
      const { position } = await TrackPlayer.getProgress();
      await TrackPlayer.seekTo(position + interval);
    });
    TrackPlayer.addEventListener(Event.RemoteJumpBackward, async ({ interval }) => {
      const { position } = await TrackPlayer.getProgress();
      await TrackPlayer.seekTo(Math.max(0, position - interval));
    });
    TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => TrackPlayer.seekTo(position));
    // Kesinti yönetimi (PLAN §4.2/§6.4): çağrı sırasında duraklat;
    // kesinti bitince kullanıcı ayarına göre otomatik devam et.
    let pausedByInterruption = false;
    TrackPlayer.addEventListener(Event.RemoteDuck, async ({ paused, permanent }) => {
      if (paused || permanent) {
        pausedByInterruption = !permanent;
        await TrackPlayer.pause();
        return;
      }
      if (pausedByInterruption && useSettings.getState().autoResumeAfterCall) {
        pausedByInterruption = false;
        await TrackPlayer.play();
      }
    });
  });
}
