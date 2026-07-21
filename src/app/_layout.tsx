import {
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold,
  useFonts,
} from '@expo-google-fonts/fraunces';
import {
  AlbertSans_400Regular,
  AlbertSans_500Medium,
  AlbertSans_700Bold,
} from '@expo-google-fonts/albert-sans';
import * as Notifications from 'expo-notifications';
import * as QuickActions from 'expo-quick-actions';
import { useQuickActionRouting } from 'expo-quick-actions/router';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { ThemeProvider, useTheme } from '@/design/theme';
import { fonts } from '@/design/tokens';
import { usePurchasesInit } from '@/features/purchases/usePurchasesInit';
import { syncDailyReminders } from '@/features/reminders/reminders';
import { setupStreakGuard } from '@/features/reminders/streakGuard';
import { useSettings } from '@/stores/settings';
import { useStats } from '@/stores/stats';

SplashScreen.preventAutoHideAsync();

// Bildirim senkronu: açılışta + her istatistik değişiminde günlük hatırlatıcılar
// yeniden planlanır (bugün seans yapıldıysa bugünün bildirimi düşer);
// bildirime dokunuş data.url'e yönlendirir (deep link).
function useNotificationSync() {
  const router = useRouter();
  useEffect(() => {
    syncDailyReminders();
    const unsubscribe = useStats.subscribe(() => {
      syncDailyReminders();
    });
    if (Platform.OS === 'web') return unsubscribe;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url as never);
    });
    return () => {
      unsubscribe();
      sub.remove();
    };
  }, [router]);
}

// Ana ekran hızlı eylemleri: ikona basılı tut → Nefes / Zamansız oturum
function useHomeQuickActions() {
  useQuickActionRouting();
  useEffect(() => {
    if (Platform.OS === 'web') return;
    QuickActions.setItems([
      {
        id: 'breathe',
        title: 'Nefes al',
        subtitle: 'Kısa bir nefes egzersizi',
        icon: Platform.OS === 'ios' ? 'symbol:wind' : undefined,
        params: { href: '/breathe' },
      },
      {
        id: 'timer',
        title: 'Zamansız oturum',
        subtitle: 'Sessiz meditasyon zamanlayıcısı',
        icon: Platform.OS === 'ios' ? 'symbol:timer' : undefined,
        params: { href: '/timer' },
      },
    ]).catch(() => {});
  }, []);
}

function AppStack() {
  usePurchasesInit();
  useEffect(() => setupStreakGuard(), []);
  useNotificationSync();
  useHomeQuickActions();
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontFamily: fonts.bodyMedium },
          headerShadowVisible: false,
          // Sakin geçişler: yumuşak fade (DESIGN.md §5.5); modal'lar alttan gelmeye devam eder
          animation: 'fade',
          animationDuration: 300,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const themeMode = useSettings((s) => s.themeMode);
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_400Regular_Italic,
    AlbertSans_400Regular,
    AlbertSans_500Medium,
    AlbertSans_700Bold,
  });

  // Splash'ta asla asılı kalma: fontlar yüklenince, hata verince VEYA 3 sn
  // failsafe timeout ile devam et. Release'de fontlar sessizce takılırsa
  // (emülatör duman testi bunu göremez — süreç canlı, çökme yok) uygulama
  // aksi halde sonsuza dek splash'ta kalırdı.
  // Failsafe: fontlar ne yüklenir ne hata verirse (sessiz takılma) 3 sn sonra devam et.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, []);
  const ready = fontsLoaded || Boolean(fontError) || timedOut;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // UI mount işareti — takılı splash bunu asla basmaz (duman testi bunu arar).
  useEffect(() => {
    if (ready) console.log('SAKIN_UI_READY');
  }, [ready]);

  if (!ready) {
    return null; // splash görünür kalır
  }

  return (
    <ThemeProvider mode={themeMode}>
      <AppStack />
    </ThemeProvider>
  );
}
