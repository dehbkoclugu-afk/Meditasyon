import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

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
      <ScrollView
        style={[styles.fill, { backgroundColor: colors.bg }]}
        contentContainerStyle={[padding, { paddingBottom: space.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.fill, { backgroundColor: colors.bg }, padding]}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
