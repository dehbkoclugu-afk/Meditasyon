import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage } from './storage';

// Premium durumu. Tek doğruluk kaynağı RevenueCat SDK'sıdır (M5);
// bu store son bilinen durumun offline yansımasıdır.

type PremiumState = {
  isPremium: boolean;
  setPremium: (value: boolean) => void;
};

export const usePremium = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      setPremium: (value) => set({ isPremium: value }),
    }),
    { name: 'premium', storage: createJSONStorage(() => appStorage) },
  ),
);
