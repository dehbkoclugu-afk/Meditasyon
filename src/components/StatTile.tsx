import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

type Props = {
  value: string; // "128" — biçimleme çağıran tarafta
  label: string; // "toplam dakika"
};

export function StatTile({ value, label }: Props) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityLabel={`${value} ${label}`}
      style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <AppText variant="numeral">{value}</AppText>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
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
});
