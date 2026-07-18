import { useRouter } from 'expo-router';

import { canAccessSession } from '@/content/access';
import type { Session } from '@/content/schema';
import { usePremium } from '@/stores/premium';

// Kilitli içeriğe dokunma → paywall; erişilebilir → player.
// Tek yerde: her ekran aynı davranışı kullanır (PLAN.md §6.3).
export function useOpenSession() {
  const router = useRouter();
  const isPremium = usePremium((s) => s.isPremium);

  return (session: Session) => {
    if (canAccessSession(session, isPremium)) {
      router.push({ pathname: '/player/[sessionId]', params: { sessionId: session.id } });
    } else {
      router.push({ pathname: '/paywall', params: { source: session.id } });
    }
  };
}
