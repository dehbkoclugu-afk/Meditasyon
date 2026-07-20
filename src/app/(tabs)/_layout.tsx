import { Redirect, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MiniPlayer } from '@/components/MiniPlayer';
import { BreathIcon, CompassIcon, SeedIcon, SunHorizonIcon } from '@/components/icons';
import { fonts, motion } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { useSettings } from '@/stores/settings';

// Seçilen sekme ikonu yumuşakça 1.12'ye büyür — bounce yok (DESIGN.md)
function TabIcon({ focused, children }: { focused: boolean; children: ReactNode }) {
  const scale = useSharedValue(focused ? 1.12 : 1);
  useEffect(() => {
    scale.value = withTiming(focused ? 1.12 : 1, {
      duration: motion.fast,
      easing: Easing.bezier(...motion.easing),
      reduceMotion: ReduceMotion.System,
    });
  }, [focused, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const onboardingDone = useSettings((s) => s.onboardingDone);
  if (!onboardingDone) {
    return <Redirect href="/onboarding" />;
  }
  return (
    <View style={{ flex: 1 }}>
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
          title: t('tabs.today'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <SunHorizonIcon color={color} size={size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.explore'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <CompassIcon color={color} size={size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="breathe"
        options={{
          title: t('tabs.breathe'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <BreathIcon color={color} size={size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused}>
              <SeedIcon color={color} size={size} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
      <MiniPlayer />
    </View>
  );
}
