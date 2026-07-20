import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage } from './storage';
import type { ThemeMode } from '@/design/theme';

// Kullanıcı ayarları (PLAN.md §4.3). Dil M7'de i18n'e bağlanacak.

export type Intent = 'uyku' | 'stres' | 'odak' | 'merak';

type SettingsState = {
  onboardingDone: boolean;
  intents: Intent[];
  themeMode: ThemeMode;
  language: 'system' | 'tr' | 'en';
  reminder: { enabled: boolean; hour: number; minute: number };
  hapticsEnabled: boolean;
  bellEnabled: boolean;
  /** Program günleri sırayla mı açılır? Kapalıysa tüm günler seçilebilir (PLAN §2.1). */
  sequentialUnlock: boolean;
  /** Seans sırasında ekranı uyanık tut (PLAN §4.3). */
  keepScreenAwake: boolean;
  /** Çağrı/kesinti bitince otomatik devam (PLAN §4.2). */
  autoResumeAfterCall: boolean;
  /** Haftalık esnek hedef (aktif gün); 0 = kapalı. */
  weeklyGoal: number;
  /** Son seçilen ambience karışımı (en çok 2 kanal) — sonraki seansta sürer. */
  ambience: { ids: string[]; volume: number };
  reviewAsked: boolean;
  setOnboardingDone: () => void;
  setIntents: (intents: Intent[]) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: 'system' | 'tr' | 'en') => void;
  setReminder: (reminder: { enabled: boolean; hour: number; minute: number }) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setBellEnabled: (enabled: boolean) => void;
  setSequentialUnlock: (enabled: boolean) => void;
  setKeepScreenAwake: (enabled: boolean) => void;
  setAutoResumeAfterCall: (enabled: boolean) => void;
  setWeeklyGoal: (days: number) => void;
  setAmbience: (ambience: { ids: string[]; volume: number }) => void;
  setReviewAsked: () => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      intents: [],
      themeMode: 'system',
      language: 'system',
      reminder: { enabled: false, hour: 9, minute: 0 },
      hapticsEnabled: true,
      bellEnabled: true,
      sequentialUnlock: true,
      keepScreenAwake: true,
      autoResumeAfterCall: true,
      weeklyGoal: 0,
      ambience: { ids: [], volume: 0.7 },
      reviewAsked: false,

      setOnboardingDone: () => set({ onboardingDone: true }),
      setIntents: (intents) => set({ intents }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      setReminder: (reminder) => set({ reminder }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setBellEnabled: (bellEnabled) => set({ bellEnabled }),
      setSequentialUnlock: (sequentialUnlock) => set({ sequentialUnlock }),
      setKeepScreenAwake: (keepScreenAwake) => set({ keepScreenAwake }),
      setAutoResumeAfterCall: (autoResumeAfterCall) => set({ autoResumeAfterCall }),
      setWeeklyGoal: (weeklyGoal) => set({ weeklyGoal }),
      setAmbience: (ambience) => set({ ambience }),
      setReviewAsked: () => set({ reviewAsked: true }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => appStorage),
      version: 1,
      migrate: (persisted) => {
        // v0→v1: ambience.id (tekil) → ambience.ids (karışım)
        const state = persisted as { ambience?: { id?: string | null; ids?: string[]; volume?: number } };
        if (state?.ambience && !Array.isArray(state.ambience.ids)) {
          state.ambience = {
            ids: state.ambience.id ? [state.ambience.id] : [],
            volume: state.ambience.volume ?? 0.7,
          } as never;
        }
        return state as never;
      },
    },
  ),
);
