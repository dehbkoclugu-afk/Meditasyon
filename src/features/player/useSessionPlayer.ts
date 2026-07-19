import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { getAudioBackend } from './backend';
import { playBellIfEnabled } from './bell';
import { fadeVolume, findProgramDay, isSessionCompleted, sleepTimerSeconds, type SleepTimerChoice } from './logic';
import { brand } from '@/config/brand';
import { audioAssets } from '@/content/audio-map';
import { catalog } from '@/content/catalog';
import type { Session } from '@/content/schema';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';
import { useStats } from '@/stores/stats';

const POLL_MS = 500;
const FADE_STEPS = 10;
const FADE_STEP_MS = 1000; // 10 sn'de yumuşak fade-out

export type PlayerState = {
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  finished: boolean;
  sleepTimer: SleepTimerChoice;
  /** Aktif uyku zamanlayıcısında kalan saniye; kapalıysa null. */
  sleepRemainingSec: number | null;
};

export function useSessionPlayer(session: Session) {
  const backend = getAudioBackend();
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    positionSec: 0,
    durationSec: session.durationSec,
    finished: false,
    sleepTimer: null,
    sleepRemainingSec: null,
  });

  const savePosition = useProgress((s) => s.savePosition);
  const markCompleted = useProgress((s) => s.markCompleted);
  const completeProgramDay = useProgress((s) => s.completeProgramDay);

  // Poll döngüsünün gördüğü son durum — unmount'ta pozisyon kaydı için ref'te tutulur.
  const lastStatus = useRef({ positionSec: 0, durationSec: session.durationSec });
  const completedRef = useRef(false);
  const sleepDeadline = useRef<number | null>(null); // epoch ms
  const fadeStep = useRef(0);

  const finalize = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    markCompleted(session.id);
    const day = findProgramDay(catalog, session.id);
    if (day) completeProgramDay(day.program.id, day.dayIndex);
    useStats.getState().recordSession(session.durationSec);
    playBellIfEnabled();
    if (Platform.OS !== 'web' && useSettings.getState().hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [completeProgramDay, markCompleted, session.durationSec, session.id]);

  // Yükleme + durum döngüsü
  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    (async () => {
      // Kayıtlı pozisyon effect içinde BİR KEZ okunur (abonelik değil):
      // store güncellemeleri (tamamlama, pozisyon kaydı) yeniden yükleme tetiklememeli.
      const startPosition = useProgress.getState().sessions[session.id]?.lastPositionSec ?? 0;
      // Bitmesine <30 sn kala kaldıysa baştan başlat — "devam et" anlamsız olur.
      const resumeAt =
        session.durationSec - startPosition > 30 && startPosition > 5 ? startPosition : 0;
      await backend.load(
        audioAssets[session.id],
        { id: session.id, title: session.title.tr, artist: brand.name },
        resumeAt,
      );
      if (cancelled) return;
      await backend.play();

      interval = setInterval(async () => {
        const status = await backend.getStatus();
        if (cancelled) return;
        lastStatus.current = {
          positionSec: status.positionSec,
          durationSec: status.durationSec || session.durationSec,
        };

        // Uyku zamanlayıcısı: son 10 sn'de fade, sonra duraklat
        let sleepRemainingSec: number | null = null;
        if (sleepDeadline.current !== null) {
          const remainingMs = sleepDeadline.current - Date.now();
          sleepRemainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
          if (remainingMs <= FADE_STEPS * FADE_STEP_MS) {
            fadeStep.current += 1;
            await backend.setVolume(fadeVolume(fadeStep.current, FADE_STEPS));
            if (fadeStep.current >= FADE_STEPS) {
              await backend.pause();
              await backend.setVolume(1);
              sleepDeadline.current = null;
              fadeStep.current = 0;
              sleepRemainingSec = null;
              setState((s) => ({ ...s, sleepTimer: null }));
            }
          }
        }

        const finishedNow =
          status.didJustFinish ||
          (status.durationSec > 0 && status.positionSec >= status.durationSec - 0.5);
        if (finishedNow) finalize();

        setState((s) => ({
          ...s,
          isPlaying: status.isPlaying,
          positionSec: status.positionSec,
          durationSec: status.durationSec || session.durationSec,
          finished: s.finished || finishedNow,
          sleepRemainingSec,
        }));
      }, POLL_MS);
    })();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      const { positionSec, durationSec } = lastStatus.current;
      // Çıkışta: ≥%80 dinlendiyse tamamlandı say, değilse pozisyonu kaydet.
      if (isSessionCompleted(positionSec, durationSec)) {
        finalize();
      } else if (positionSec > 5 && !completedRef.current) {
        savePosition(session.id, Math.floor(positionSec));
      }
      backend.unload();
    };
  }, [backend, finalize, savePosition, session]);

  const toggle = useCallback(async () => {
    const status = await backend.getStatus();
    if (status.isPlaying) await backend.pause();
    else await backend.play();
  }, [backend]);

  const seekBy = useCallback(
    async (deltaSec: number) => {
      if (Platform.OS !== 'web' && useSettings.getState().hapticsEnabled) {
        Haptics.selectionAsync().catch(() => {});
      }
      const status = await backend.getStatus();
      await backend.seekTo(status.positionSec + deltaSec);
    },
    [backend],
  );

  const setSleepTimer = useCallback(
    (choice: SleepTimerChoice) => {
      const seconds = sleepTimerSeconds(choice, lastStatus.current.positionSec, lastStatus.current.durationSec);
      sleepDeadline.current = seconds === null ? null : Date.now() + seconds * 1000;
      fadeStep.current = 0;
      if (seconds === null) backend.setVolume(1);
      setState((s) => ({ ...s, sleepTimer: choice, sleepRemainingSec: seconds }));
    },
    [backend],
  );

  return { state, toggle, seekBy, setSleepTimer };
}
