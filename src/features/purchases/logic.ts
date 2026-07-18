import type { Plan, PlanId } from './types';

// SDK'dan bağımsız saf eşleme mantığı — testli.

export type PackageLike = {
  packageType: string; // 'MONTHLY' | 'ANNUAL' | 'LIFETIME' (RevenueCat sabitleri)
  product: {
    priceString: string;
    price: number;
    introPrice?: { periodNumberOfUnits: number; periodUnit: string } | null;
  };
};

const TYPE_TO_PLAN: Record<string, PlanId> = {
  MONTHLY: 'monthly',
  ANNUAL: 'yearly',
  LIFETIME: 'lifetime',
};

export function mapPackagesToPlans(packages: PackageLike[]): Plan[] {
  const plans: Plan[] = [];
  for (const pkg of packages) {
    const id = TYPE_TO_PLAN[pkg.packageType];
    if (!id) continue;
    plans.push({
      id,
      priceLabel: pkg.product.priceString,
      price: pkg.product.price,
      trialLabel: trialLabel(pkg.product.introPrice ?? null),
    });
  }
  // Paywall sırası: yıllık (öne çıkan) → aylık → ömür boyu
  const order: PlanId[] = ['yearly', 'monthly', 'lifetime'];
  return plans.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

function trialLabel(
  intro: { periodNumberOfUnits: number; periodUnit: string } | null,
): string | null {
  if (!intro) return null;
  const unit = intro.periodUnit.toUpperCase();
  const n = intro.periodNumberOfUnits;
  if (unit === 'DAY') return `${n} gün ücretsiz`;
  if (unit === 'WEEK') return `${n * 7} gün ücretsiz`;
  if (unit === 'MONTH') return `${n} ay ücretsiz`;
  return null;
}

/** Yıllık planın 12×aylığa göre tasarruf yüzdesi. Fiyat yoksa null. */
export function yearlySavingsPercent(plans: Plan[]): number | null {
  const monthly = plans.find((p) => p.id === 'monthly');
  const yearly = plans.find((p) => p.id === 'yearly');
  if (!monthly || !yearly || monthly.price <= 0) return null;
  const pct = Math.round((1 - yearly.price / (monthly.price * 12)) * 100);
  return pct > 0 ? pct : null;
}
