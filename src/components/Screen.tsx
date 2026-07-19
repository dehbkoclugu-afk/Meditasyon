import type { ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GRAIN_URI } from '@/design/grain';
import { space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

// Çok hafif grain dokusu — premium his (DESIGN.md). Dokunuşları engellemez.
function GrainOverlay() {
  return (
    <Image
      source={{ uri: GRAIN_URI }}
      style={styles.grain}
      resizeMode="repeat"
      pointerEvents="none"
      accessibilityElementsHidden
    />
  );
}

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Kenar boşluğunu kaldırır (tam genişlik listeler için) */
  edgeToEdge?: boolean;
};

export function Screen({ children, scroll = false, edgeToEdge = false }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + space.md,
    paddingHorizontal: edgeToEdge ? 0 : space.screenMargin,
  };

  if (scroll) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.bg }]}>
        <GrainOverlay />
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[padding, { paddingBottom: space.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={[styles.fill, { backgroundColor: colors.bg }, padding]}>
      <GrainOverlay />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grain: { ...StyleSheet.absoluteFillObject, opacity: 0.02 },
});
