import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage } from './storage';

// Dinleme ilerlemesi ve program durumu — tamamı yerel (PLAN.md §4.3).
// İstatistik/streak M6'da ayrı store olarak gelecek.

export type SessionProgress = {
  completedAt: string[]; // ISO tarihleri — tekrar dinlemeler de sayılır
  lastPositionSec: number;
};

export type ProgramProgress = {
  unlockedDay: number; // 0 tabanlı: 0 = sadece 1. gün açık
  completedDays: number[];
};

type ProgressState = {
  sessions: Record<string, SessionProgress>;
  programs: Record<string, ProgramProgress>;
  favorites: string[];
  savePosition: (sessionId: string, positionSec: number) => void;
  markCompleted: (sessionId: string) => void;
  completeProgramDay: (programId: string, dayIndex: number) => void;
  toggleFavorite: (sessionId: string) => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      sessions: {},
      programs: {},
      favorites: [],

      savePosition: (sessionId, positionSec) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              completedAt: state.sessions[sessionId]?.completedAt ?? [],
              lastPositionSec: positionSec,
            },
          },
        })),

      markCompleted: (sessionId) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              completedAt: [
                ...(state.sessions[sessionId]?.completedAt ?? []),
                new Date().toISOString(),
              ],
              lastPositionSec: 0,
            },
          },
        })),

      completeProgramDay: (programId, dayIndex) =>
        set((state) => {
          const current = state.programs[programId] ?? { unlockedDay: 0, completedDays: [] };
          const completedDays = current.completedDays.includes(dayIndex)
            ? current.completedDays
            : [...current.completedDays, dayIndex];
          return {
            programs: {
              ...state.programs,
              [programId]: {
                completedDays,
                unlockedDay: Math.max(current.unlockedDay, dayIndex + 1),
              },
            },
          };
        }),

      toggleFavorite: (sessionId) =>
        set((state) => ({
          favorites: state.favorites.includes(sessionId)
            ? state.favorites.filter((id) => id !== sessionId)
            : [...state.favorites, sessionId],
        })),
    }),
    {
      name: 'progress',
      storage: createJSONStorage(() => appStorage),
    },
  ),
);
