import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import { audioAssets } from '@/content/audio-map';
import { useSettings } from '@/stores/settings';

// Ambience kanalı: anlatıcıdan bağımsız ikinci çalar (loop + ayrı ses seviyesi).
// Her platformda expo-audio kullanır; RNTP ile paralel miksler (PLAN.md §4.2).
// Son tercih settings'te saklanır ve sonraki seansta otomatik sürer.

export type AmbienceVolume = 0 | 0.35 | 0.7 | 1;

export function useAmbience() {
  const playerRef = useRef<AudioPlayer | null>(null);
  // Kayıtlı tercih bir kez okunur (lazy init) ve başlangıç durumudur;
  // mount effect'i setState çağırmadan çaları kurar.
  const [saved] = useState(() => useSettings.getState().ambience);
  const [activeId, setActiveId] = useState<string | null>(saved.id);
  const [volume, setVolumeState] = useState<AmbienceVolume>(
    (saved.volume as AmbienceVolume) || 0.7,
  );

  const startPlayer = useCallback((ambienceId: string, vol: number) => {
    const asset = audioAssets[ambienceId];
    if (asset == null) return;
    const player = createAudioPlayer(asset);
    player.loop = true;
    player.volume = vol;
    player.play();
    playerRef.current = player;
  }, []);

  const stop = useCallback(() => {
    playerRef.current?.remove();
    playerRef.current = null;
  }, []);

  const select = useCallback(
    (ambienceId: string | null) => {
      stop();
      setActiveId(ambienceId);
      useSettings.getState().setAmbience({ id: ambienceId, volume });
      if (ambienceId !== null) startPlayer(ambienceId, volume);
    },
    [startPlayer, stop, volume],
  );

  const setVolume = useCallback((v: AmbienceVolume) => {
    setVolumeState(v);
    if (playerRef.current) playerRef.current.volume = v;
    const current = useSettings.getState().ambience;
    useSettings.getState().setAmbience({ ...current, volume: v });
  }, []);

  // Kayıtlı tercih varsa seansla birlikte otomatik başlat (setState yok — ref işi)
  useEffect(() => {
    if (saved.id) startPlayer(saved.id, saved.volume);
    return stop;
  }, [saved, startPlayer, stop]);

  return { activeId, volume, select, setVolume };
}
