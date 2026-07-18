// Satın alma katmanı soyutlaması. Gerçek uygulama gateway.native.ts'te
// (react-native-purchases); web/Expo Go'da kullanılamaz-durumu stub'ı.

export type PlanId = 'monthly' | 'yearly' | 'lifetime';

export type Plan = {
  id: PlanId;
  priceLabel: string; // "₺699,99" — daima mağazadan, asla hardcode (DESIGN.md)
  price: number;
  trialLabel: string | null; // "7 gün ücretsiz" — introPrice'tan
};

export type PurchaseResult = 'success' | 'cancelled' | 'error';

export interface PurchasesGateway {
  /** Native modül var mı (dev build)? Yoksa paywall kurulum-bekliyor durumu gösterir. */
  isAvailable(): boolean;
  configure(): Promise<void>;
  getPlans(): Promise<Plan[]>;
  purchase(planId: PlanId): Promise<PurchaseResult>;
  restore(): Promise<boolean>; // premium entitlement bulundu mu
  /** Premium durumu değişimlerini dinler (satın alma, iade, süre dolumu). */
  onPremiumChange(callback: (isPremium: boolean) => void): void;
}
