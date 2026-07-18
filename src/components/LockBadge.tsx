import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

// Kilit ikonu değil: amber nokta + "Premium" (DESIGN.md — dürüst freemium).
export function LockBadge({ label = 'Premium' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={label}
      style={[styles.badge, { backgroundColor: colors.accentSoft, borderRadius: radius.pill }]}
    >
      <View style={[styles.dot, { backgroundColor: colors.accent }]} />
      <AppText variant="caption" style={{ color: colors.accent }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
