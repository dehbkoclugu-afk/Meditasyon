import { mapPackagesToPlans, yearlySavingsPercent } from './logic';

const pkg = (packageType: string, price: number, intro: boolean = false) => ({
  packageType,
  product: {
    priceString: `₺${price}`,
    price,
    introPrice: intro ? { periodNumberOfUnits: 7, periodUnit: 'DAY' } : null,
  },
});

describe('mapPackagesToPlans', () => {
  it('yıllık öne, deneme etiketiyle', () => {
    const plans = mapPackagesToPlans([
      pkg('MONTHLY', 129.99),
      pkg('LIFETIME', 1999.99),
      pkg('ANNUAL', 699.99, true),
    ]);
    expect(plans.map((p) => p.id)).toEqual(['yearly', 'monthly', 'lifetime']);
    expect(plans[0].trialLabel).toBe('7 gün ücretsiz');
    expect(plans[1].trialLabel).toBeNull();
  });

  it('bilinmeyen paket tipini atlar', () => {
    expect(mapPackagesToPlans([pkg('WEEKLY', 49.99)])).toEqual([]);
  });
});

describe('yearlySavingsPercent', () => {
  it('12×aylığa göre yüzde hesaplar', () => {
    const plans = mapPackagesToPlans([pkg('MONTHLY', 129.99), pkg('ANNUAL', 699.99)]);
    expect(yearlySavingsPercent(plans)).toBe(55);
  });

  it('aylık yoksa null', () => {
    expect(yearlySavingsPercent(mapPackagesToPlans([pkg('ANNUAL', 699.99)]))).toBeNull();
  });
});
