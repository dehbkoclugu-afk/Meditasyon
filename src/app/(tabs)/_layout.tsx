import { Redirect, Tabs } from 'expo-router';

import { BreathIcon, CompassIcon, SeedIcon, SunHorizonIcon } from '@/components/icons';
import { fonts } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { useSettings } from '@/stores/settings';

export default function TabsLayout() {
  const { colors } = useTheme();
  const onboardingDone = useSettings((s) => s.onboardingDone);
  if (!onboardingDone) {
    return <Redirect href="/onboarding" />;
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bugün',
          tabBarIcon: ({ color, size }) => <SunHorizonIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ color, size }) => <CompassIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="breathe"
        options={{
          title: 'Nefes',
          tabBarIcon: ({ color, size }) => <BreathIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Sen',
          tabBarIcon: ({ color, size }) => <SeedIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
