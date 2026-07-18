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
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ThemeProvider, useTheme } from '@/design/theme';
import { fonts } from '@/design/tokens';
import { usePurchasesInit } from '@/features/purchases/usePurchasesInit';
import { useSettings } from '@/stores/settings';

SplashScreen.preventAutoHideAsync();

function AppStack() {
  usePurchasesInit();
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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // splash görünür kalır
  }

  return (
    <ThemeProvider mode={themeMode}>
      <AppStack />
    </ThemeProvider>
  );
}
