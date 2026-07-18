import type { PurchasesGateway } from './types';

// Web/jest stub'ı: mağaza bağlantısı yok. Paywall kurulum-bekliyor durumu gösterir.
// Cihazda Metro gateway.native.ts'i seçer.

export const purchasesGateway: PurchasesGateway = {
  isAvailable: () => false,
  configure: async () => {},
  getPlans: async () => [],
  purchase: async () => 'error',
  restore: async () => false,
  onPremiumChange: () => {},
};
