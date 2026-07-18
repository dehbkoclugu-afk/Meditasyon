import { Tabs } from 'expo-router';

import { palette } from '@/design/tokens';

const colors = palette.dark;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Bugün' }} />
      <Tabs.Screen name="explore" options={{ title: 'Keşfet' }} />
      <Tabs.Screen name="breathe" options={{ title: 'Nefes' }} />
      <Tabs.Screen name="profile" options={{ title: 'Sen' }} />
    </Tabs>
  );
}
