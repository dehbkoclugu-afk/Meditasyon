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
  setOnboardingDone: () => void;
  setIntents: (intents: Intent[]) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: 'system' | 'tr' | 'en') => void;
  setReminder: (reminder: { enabled: boolean; hour: number; minute: number }) => void;
  setHapticsEnabled: (enabled: boolean) => void;
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

      setOnboardingDone: () => set({ onboardingDone: true }),
      setIntents: (intents) => set({ intents }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      setReminder: (reminder) => set({ reminder }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
    }),
    { name: 'settings', storage: createJSONStorage(() => appStorage) },
  ),
);
