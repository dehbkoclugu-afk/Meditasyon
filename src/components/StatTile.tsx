import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

type Props = {
  value: string; // "128" — biçimleme çağıran tarafta
  label: string; // "toplam dakika"
  /** 16px soluk mikro ikon — etiketin yanında (örn. ClockIcon) */
  icon?: ReactNode;
};

export function StatTile({ value, label, icon }: Props) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={`${value} ${label}`}
      style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <AppText variant="numeral">{value}</AppText>
      <View style={styles.labelRow}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <AppText variant="caption" tone="secondary">
          {label}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.md,
    gap: 2,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  icon: { opacity: 0.6 },
});
