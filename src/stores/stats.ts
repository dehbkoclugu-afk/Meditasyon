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
  recordSession: (durationSec: number, now?: Date) => void;
};

export const useStats = create<StatsState>()(
  persist(
    (set) => ({
      totalMinutes: 0,
      totalSessions: 0,
      streak: { current: 0, best: 0, lastActiveDate: null },
      activeDays: [],

      recordSession: (durationSec, now = new Date()) =>
        set((state) => {
          const today = localDateKey(now);
          const activeDays = state.activeDays.includes(today)
            ? state.activeDays
            : [...state.activeDays, today].slice(-56);
          return {
            totalMinutes: state.totalMinutes + Math.round(durationSec / 60),
            totalSessions: state.totalSessions + 1,
            streak: advanceStreak(state.streak, today),
            activeDays,
          };
        }),
    }),
    { name: 'stats', storage: createJSONStorage(() => appStorage) },
  ),
);
