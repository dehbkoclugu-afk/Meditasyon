import type { ComponentProps, ReactNode } from 'react';
import { Animated, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { GRAIN_URI } from '@/design/grain';
import { space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { dayPartForHour, type DayPart } from '@/i18n/format';

// Çok hafif grain dokusu — premium his (DESIGN.md). Dokunuşları engellemez.
function GrainOverlay() {
  return (
    <Image
      source={{ uri: GRAIN_URI }}
      style={styles.grain}
      resizeMode="repeat"
      accessibilityElementsHidden
    />
  );
}

// Günün saatine göre ekranın üst kısmına süzülen atmosfer tonu:
// sabah amber, akşam bakır, gece lavanta — gündüz neredeyse nötr.
// Alfa o kadar düşük ki fark edilmez, sadece hissedilir.
const ATMOSPHERE_TINT: Record<DayPart, { color: string; opacity: number }> = {
  sabah: { color: '#E4B75D', opacity: 0.07 },
  gunduz: { color: '#E4B75D', opacity: 0.03 },
  aksam: { color: '#D98E7A', opacity: 0.07 },
  gece: { color: '#7C8FC9', opacity: 0.08 },
};

function AtmosphereGradient() {
  const tint = ATMOSPHERE_TINT[dayPartForHour(new Date().getHours())];
  return (
    <Svg
      width="100%"
      height={240}
      style={styles.atmosphere}
      pointerEvents="none"
      accessibilityElementsHidden
    >
      <Defs>
        <LinearGradient id="atm" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tint.color} stopOpacity={tint.opacity} />
          <Stop offset="1" stopColor={tint.color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#atm)" />
    </Svg>
  );
}

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Kenar boşluğunu kaldırır (tam genişlik listeler için) */
  edgeToEdge?: boolean;
  /** Paralaks vb. için scroll olayı — yalnız scroll modunda anlamlı */
  onScroll?: ComponentProps<typeof ScrollView>['onScroll'];
};

export function Screen({ children, scroll = false, edgeToEdge = false, onScroll }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + space.md,
    paddingHorizontal: edgeToEdge ? 0 : space.screenMargin,
  };

  if (scroll) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.bg }]}>
        <AtmosphereGradient />
        <GrainOverlay />
        <Animated.ScrollView
          style={styles.fill}
          contentContainerStyle={[padding, { paddingBottom: space.xxl }]}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={onScroll ? 16 : undefined}
        >
          <View style={styles.content}>{children}</View>
        </Animated.ScrollView>
      </View>
    );
  }
  return (
    <View style={[styles.fill, { backgroundColor: colors.bg }, padding]}>
      <AtmosphereGradient />
      <GrainOverlay />
      <View style={[styles.fill, styles.content]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // Tablet/geniş ekran: içerik 640'ta durur, telefonda etkisiz (PLAN §1)
  content: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  atmosphere: { position: 'absolute', top: 0, left: 0, right: 0 },
  grain: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.02,
    pointerEvents: 'none',
  },
});
