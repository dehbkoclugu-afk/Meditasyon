import { useEffect } from 'react';

import { purchasesGateway } from './gateway';
import { usePremium } from '@/stores/premium';

// Uygulama açılışında bir kez: RevenueCat'i yapılandır, premium durumunu dinle.
// Offline'da store'daki son bilinen durum geçerli kalır (MMKV persist).
export function usePurchasesInit() {
  const setPremium = usePremium((s) => s.setPremium);

  useEffect(() => {
    if (!purchasesGateway.isAvailable()) return;
    purchasesGateway.configure();
    purchasesGateway.onPremiumChange(setPremium);
  }, [setPremium]);
}
