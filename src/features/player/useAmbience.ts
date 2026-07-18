import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import { audioAssets } from '@/content/audio-map';

// Ambience kanalı: anlatıcıdan bağımsız ikinci çalar (loop + ayrı ses seviyesi).
// Her platformda expo-audio kullanır; RNTP ile paralel miksler (PLAN.md §4.2).

export type AmbienceVolume = 0 | 0.35 | 0.7 | 1;

export function useAmbience() {
  const playerRef = useRef<AudioPlayer | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [volume, setVolumeState] = useState<AmbienceVolume>(0.7);

  const stop = useCallback(() => {
    playerRef.current?.remove();
    playerRef.current = null;
    setActiveId(null);
  }, []);

  const select = useCallback(
    (ambienceId: string | null) => {
      stop();
      if (ambienceId === null) return;
      const player = createAudioPlayer(audioAssets[ambienceId]);
      player.loop = true;
      player.volume = volume;
      player.play();
      playerRef.current = player;
      setActiveId(ambienceId);
    },
    [stop, volume],
  );

  const setVolume = useCallback((v: AmbienceVolume) => {
    setVolumeState(v);
    if (playerRef.current) playerRef.current.volume = v;
  }, []);

  useEffect(() => stop, [stop]); // unmount'ta ambience da durur

  return { activeId, volume, select, setVolume };
}
