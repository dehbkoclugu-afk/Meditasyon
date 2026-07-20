import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage } from './storage';
import { advanceStreak, localDateKey, type Streak } from '@/features/stats/streak';

// Toplam istatistikler + streak. Seans tamamlanınca player/nefes ekranı çağırır.

type StatsState = {
  totalMinutes: number;
  totalSessions: number;
  streak: Streak;
  /** Son 56 günün aktif günleri (ısı şeridi için) — tarih anahtarları. */
  activeDays: string[];
  /** Gün bazında dakika (Bugün başlığı + hedef halkası için, son 56 gün). */
  dayMinutes: Record<string, number>;
  /** Seans sonrası ruh hali kaydı: tarih → -1 (gergin) | 0 (aynı) | 1 (daha sakin). */
  moodByDay: Record<string, number>;
  recordSession: (durationSec: number, now?: Date) => void;
  recordMood: (mood: -1 | 0 | 1, now?: Date) => void;
};

export const useStats = create<StatsState>()(
  persist(
    (set) => ({
      totalMinutes: 0,
      totalSessions: 0,
      streak: { current: 0, best: 0, lastActiveDate: null },
      activeDays: [],
      dayMinutes: {},
      moodByDay: {},

      recordSession: (durationSec, now = new Date()) =>
        set((state) => {
          const today = localDateKey(now);
          const activeDays = state.activeDays.includes(today)
            ? state.activeDays
            : [...state.activeDays, today].slice(-56);
          const minutes = Math.round(durationSec / 60);
          const dayMinutes = { ...state.dayMinutes, [today]: (state.dayMinutes[today] ?? 0) + minutes };
          for (const key of Object.keys(dayMinutes)) {
            if (!activeDays.includes(key)) delete dayMinutes[key];
          }
          return {
            totalMinutes: state.totalMinutes + minutes,
            totalSessions: state.totalSessions + 1,
            streak: advanceStreak(state.streak, today),
            activeDays,
            dayMinutes,
          };
        }),

      recordMood: (mood, now = new Date()) =>
        set((state) => ({
          moodByDay: { ...state.moodByDay, [localDateKey(now)]: mood },
        })),
    }),
    { name: 'stats', storage: createJSONStorage(() => appStorage) },
  ),
);
