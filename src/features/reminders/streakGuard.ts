import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import i18n from '@/i18n';
import { effectiveStreak, localDateKey } from '@/features/stats/streak';
import { useStats } from '@/stores/stats';

// Seri koruması (PLAN.md §8): dün seans yapılmış + bugün henüz yapılmamışsa
// bugün 21:00 için TEK nazik hatırlatma planlanır. Bugün seans yapılınca iptal.
// Nazik ton — suçluluk kurmaz (PRODUCT.md yasağı).

const GUARD_ID = 'streak-guard';

export async function syncStreakGuard(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(GUARD_ID).catch(() => {});

    const { streak } = useStats.getState();
    const today = localDateKey(new Date());
    if (streak.lastActiveDate === today) return; // bugün zaten aktif
    if (effectiveStreak(streak, today) === 0) return; // korunacak seri yok

    const target = new Date();
    target.setHours(21, 0, 0, 0);
    if (target.getTime() <= Date.now()) return; // 21:00 geçti — bugünlük yok

    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;

    const en = i18n.language === 'en';
    await Notifications.scheduleNotificationAsync({
      identifier: GUARD_ID,
      content: {
        title: en ? 'Your streak is waiting' : 'Serin seni bekliyor',
        body: en
          ? `A short session keeps your ${streak.current}-day streak alive.`
          : `Kısa bir seans ${streak.current} günlük serini sürdürür.`,
        sound: false,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: target },
    });
  } catch {
    // bildirim planlaması kritik değil — sessiz geç
  }
}

/** Uygulama açılışında çağrılır: ilk senkron + her istatistik değişiminde yeniden. */
export function setupStreakGuard(): () => void {
  syncStreakGuard();
  return useStats.subscribe(() => {
    syncStreakGuard();
  });
}
