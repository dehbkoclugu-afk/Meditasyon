import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

import { mapPackagesToPlans } from './logic';
import type { Plan, PlanId, PurchaseResult, PurchasesGateway } from './types';

// RevenueCat gateway'i. API anahtarları app.json → expo.extra.revenueCat
// (public SDK anahtarlarıdır, secret değildir). Kurulum: docs/REVENUECAT.md.

const ENTITLEMENT = 'premium';

function apiKey(): string {
  const keys = Constants.expoConfig?.extra?.revenueCat as
    | { iosApiKey?: string; androidApiKey?: string }
    | undefined;
  return (Platform.OS === 'ios' ? keys?.iosApiKey : keys?.androidApiKey) ?? '';
}

function available(): boolean {
  return NativeModules.RNPurchases != null && apiKey().length > 0;
}

function loadSdk() {
  /* eslint-disable @typescript-eslint/no-require-imports */
  return require('react-native-purchases').default as typeof import('react-native-purchases').default;
  /* eslint-enable @typescript-eslint/no-require-imports */
}

let configured = false;
let cachedPlans: Plan[] | null = null;

export const purchasesGateway: PurchasesGateway = {
  isAvailable: available,

  async configure() {
    if (!available() || configured) return;
    const Purchases = loadSdk();
    Purchases.configure({ apiKey: apiKey() }); // anonim kullanıcı — hesap sistemi yok
    configured = true;
  },

  async getPlans(): Promise<Plan[]> {
    if (!available()) return [];
    if (cachedPlans) return cachedPlans;
    await this.configure();
    const Purchases = loadSdk();
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    cachedPlans = mapPackagesToPlans(packages);
    return cachedPlans;
  },

  async purchase(planId: PlanId): Promise<PurchaseResult> {
    if (!available()) return 'error';
    await this.configure();
    const Purchases = loadSdk();
    const offerings = await Purchases.getOfferings();
    const typeByPlan: Record<PlanId, string> = {
      monthly: 'MONTHLY',
      yearly: 'ANNUAL',
      lifetime: 'LIFETIME',
    };
    const pkg = offerings.current?.availablePackages.find(
      (p) => String(p.packageType) === typeByPlan[planId],
    );
    if (!pkg) return 'error';
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo.entitlements.active[ENTITLEMENT] ? 'success' : 'error';
    } catch (e) {
      const cancelled = (e as { userCancelled?: boolean }).userCancelled === true;
      return cancelled ? 'cancelled' : 'error';
    }
  },

  async restore(): Promise<boolean> {
    if (!available()) return false;
    await this.configure();
    const Purchases = loadSdk();
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[ENTITLEMENT] != null;
  },

  onPremiumChange(callback: (isPremium: boolean) => void) {
    if (!available()) return;
    const Purchases = loadSdk();
    Purchases.addCustomerInfoUpdateListener((info) => {
      callback(info.entitlements.active[ENTITLEMENT] != null);
    });
  },
};
