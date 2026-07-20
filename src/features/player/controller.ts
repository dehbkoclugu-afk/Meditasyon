import * as Haptics from 'expo-haptics';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import { create } from 'zustand';

import { getAudioBackend } from './backend';
import { playBellIfEnabled } from './bell';
import {
  fadeVolume,
  findProgramDay,
  isSessionCompleted,
  sleepTimerSeconds,
  type SleepTimerChoice,
} from './logic';
import { brand } from '@/config/brand';
import { artworkAssets } from '@/content/artwork-map';
import { audioAssets } from '@/content/audio-map';
import { catalog, sessionsById } from '@/content/catalog';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';
import { useStats } from '@/stores/stats';

// Oynatma sahibi ekran değil bu controller'dır: player ekranı kapansa da
// ses (ve ambience) sürer; mini-player aynı durumu okur. Tek doğruluk kaynağı
// usePlayback store'u; komutlar module-level controller fonksiyonları.

const POLL_MS = 500;
const FADE_STEPS = 10;
const FADE_STEP_MS = 1000; // 10 sn'de yumuşak fade-out

export type PlaybackState = {
  sessionId: string | null;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  finished: boolean;
  sleepTimer: SleepTimerChoice;
  sleepRemainingSec: number | null;
  ambienceId: string | null;
  ambienceVolume: number;
};

export const usePlayback = create<PlaybackState>(() => ({
  sessionId: null,
  isPlaying: false,
  positionSec: 0,
  durationSec: 0,
  finished: false,
  sleepTimer: null,
  sleepRemainingSec: null,
  ambienceId: null,
  ambienceVolume: 0.7,
}));

// Web önizleme hata ayıklama kancası (production build'lerde zararsız)
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__playback = usePlayback;
}

const backend = getAudioBackend();
let interval: ReturnType<typeof setInterval> | null = null;
let sleepDeadline: number | null = null;
let fadeStep = 0;
let completed = false;
let ambiencePlayer: AudioPlayer | null = null;

function set(partial: Partial<PlaybackState>) {
  usePlayback.setState(partial);
}

function finalize(sessionId: string) {
  if (completed) return;
  completed = true;
  const session = sessionsById.get(sessionId);
  if (!session) return;
  useProgress.getState().markCompleted(sessionId);
  const day = findProgramDay(catalog, sessionId);
  if (day) useProgress.getState().completeProgramDay(day.program.id, day.dayIndex);
  useStats.getState().recordSession(session.durationSec);
  playBellIfEnabled();
  if (Platform.OS !== 'web' && useSettings.getState().hapticsEnabled) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
}

function stopAmbience() {
  ambiencePlayer?.remove();
  ambiencePlayer = null;
}

function startAmbience(ambienceId: string, volume: number) {
  const asset = audioAssets[ambienceId];
  if (asset == null) return;
  const player = createAudioPlayer(asset);
  player.loop = true;
  player.volume = volume;
  player.play();
  ambiencePlayer = player;
}

async function poll() {
  const { sessionId } = usePlayback.getState();
  if (!sessionId) return;
  const session = sessionsById.get(sessionId);
  const status = await backend.getStatus();

  let sleepRemainingSec: number | null = null;
  if (sleepDeadline !== null) {
    const remainingMs = sleepDeadline - Date.now();
    sleepRemainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
    if (remainingMs <= FADE_STEPS * FADE_STEP_MS) {
      fadeStep += 1;
      const volume = fadeVolume(fadeStep, FADE_STEPS);
      await backend.setVolume(volume);
      if (ambiencePlayer) ambiencePlayer.volume = volume * usePlayback.getState().ambienceVolume;
      if (fadeStep >= FADE_STEPS) {
        await backend.pause();
        await backend.setVolume(1);
        if (ambiencePlayer) ambiencePlayer.volume = usePlayback.getState().ambienceVolume;
        sleepDeadline = null;
        fadeStep = 0;
        sleepRemainingSec = null;
        set({ sleepTimer: null });
      }
    }
  }

  const finishedNow =
    status.didJustFinish ||
    (status.durationSec > 0 && status.positionSec >= status.durationSec - 0.5);
  if (finishedNow) {
    finalize(sessionId);
    stopAmbience();
  }

  set({
    isPlaying: status.isPlaying,
    positionSec: status.positionSec,
    durationSec: status.durationSec || session?.durationSec || 0,
    finished: usePlayback.getState().finished || finishedNow,
    sleepRemainingSec,
  });
}

export const playbackController = {
  /** Seansı yükleyip çalar. Aynı seans zaten yüklüyse dokunmaz. */
  async start(sessionId: string): Promise<void> {
    const current = usePlayback.getState();
    if (current.sessionId === sessionId && !current.finished) return;
    await this.stop(); // önceki seansın pozisyonunu kaydeder

    const session = sessionsById.get(sessionId);
    if (!session || !session.hasAudio) return;

    completed = false;
    sleepDeadline = null;
    fadeStep = 0;

    const saved = useSettings.getState().ambience;
    set({
      sessionId,
      isPlaying: false,
      positionSec: 0,
      durationSec: session.durationSec,
      finished: false,
      sleepTimer: null,
      sleepRemainingSec: null,
      ambienceId: saved.id,
      ambienceVolume: saved.volume,
    });

    const startPosition = useProgress.getState().sessions[sessionId]?.lastPositionSec ?? 0;
    const resumeAt =
      session.durationSec - startPosition > 30 && startPosition > 5 ? startPosition : 0;
    await backend.load(
      audioAssets[sessionId],
      {
        id: sessionId,
        title: session.title.tr,
        artist: brand.name,
        artwork: artworkAssets[sessionId],
      },
      resumeAt,
    );
    await backend.play();
    if (Platform.OS !== 'web' && useSettings.getState().hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); // seans başı (PLAN §5.6)
    }
    if (saved.id) startAmbience(saved.id, saved.volume);

    if (interval) clearInterval(interval);
    interval = setInterval(poll, POLL_MS);
  },

  /** Oynatmayı tamamen durdurur; pozisyonu kaydeder (mini-player X'i, yeni seans). */
  async stop(): Promise<void> {
    const { sessionId, positionSec, durationSec } = usePlayback.getState();
    if (interval) clearInterval(interval);
    interval = null;
    stopAmbience();
    if (sessionId) {
      if (isSessionCompleted(positionSec, durationSec)) {
        finalize(sessionId);
      } else if (positionSec > 5 && !completed) {
        useProgress.getState().savePosition(sessionId, Math.floor(positionSec));
      }
      await backend.unload();
    }
    set({
      sessionId: null,
      isPlaying: false,
      positionSec: 0,
      durationSec: 0,
      finished: false,
      sleepTimer: null,
      sleepRemainingSec: null,
      ambienceId: null,
    });
  },

  async toggle(): Promise<void> {
    const status = await backend.getStatus();
    if (status.isPlaying) await backend.pause();
    else await backend.play();
  },

  async seekBy(deltaSec: number): Promise<void> {
    if (Platform.OS !== 'web' && useSettings.getState().hapticsEnabled) {
      Haptics.selectionAsync().catch(() => {});
    }
    const status = await backend.getStatus();
    await backend.seekTo(status.positionSec + deltaSec);
  },

  setSleepTimer(choice: SleepTimerChoice): void {
    const { positionSec, durationSec } = usePlayback.getState();
    const seconds = sleepTimerSeconds(choice, positionSec, durationSec);
    sleepDeadline = seconds === null ? null : Date.now() + seconds * 1000;
    fadeStep = 0;
    if (seconds === null) backend.setVolume(1);
    set({ sleepTimer: choice, sleepRemainingSec: seconds });
  },

  selectAmbience(ambienceId: string | null): void {
    stopAmbience();
    const volume = usePlayback.getState().ambienceVolume;
    useSettings.getState().setAmbience({ id: ambienceId, volume });
    set({ ambienceId });
    if (ambienceId) startAmbience(ambienceId, volume);
  },

  setAmbienceVolume(volume: number): void {
    if (ambiencePlayer) ambiencePlayer.volume = volume;
    const id = usePlayback.getState().ambienceId;
    useSettings.getState().setAmbience({ id, volume });
    set({ ambienceVolume: volume });
  },

  /** Bitiş ekranı kapatılınca durumu sıfırlar (ses zaten bitti). */
  async acknowledgeFinished(): Promise<void> {
    await this.stop();
  },
};
