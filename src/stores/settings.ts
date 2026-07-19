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
  /** Son seçilen ambience — sonraki seansta otomatik sürer. */
  ambience: { id: string | null; volume: number };
  reviewAsked: boolean;
  setOnboardingDone: () => void;
  setIntents: (intents: Intent[]) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: 'system' | 'tr' | 'en') => void;
  setReminder: (reminder: { enabled: boolean; hour: number; minute: number }) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setBellEnabled: (enabled: boolean) => void;
  setAmbience: (ambience: { id: string | null; volume: number }) => void;
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
      ambience: { id: null, volume: 0.7 },
      reviewAsked: false,

      setOnboardingDone: () => set({ onboardingDone: true }),
      setIntents: (intents) => set({ intents }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      setReminder: (reminder) => set({ reminder }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setBellEnabled: (bellEnabled) => set({ bellEnabled }),
      setAmbience: (ambience) => set({ ambience }),
      setReviewAsked: () => set({ reviewAsked: true }),
    }),
    { name: 'settings', storage: createJSONStorage(() => appStorage) },
  ),
);
