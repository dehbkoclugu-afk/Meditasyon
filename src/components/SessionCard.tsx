import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { LockBadge } from './LockBadge';
import { categoryColors, radius, space, type CategoryId } from '@/design/tokens';
import { useTheme } from '@/design/theme';

type Props = {
  title: string;
  durationLabel: string; // "12 dk" — biçimleme çağıran tarafta (i18n)
  categoryLabel: string;
  categoryId: CategoryId;
  locked?: boolean;
  onPress: () => void;
};

export function SessionCard({ title, durationLabel, categoryLabel, categoryId, locked, onPress }: Props) {
  const { colors } = useTheme();
  const catColor = categoryColors[categoryId];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${categoryLabel}, ${durationLabel}${locked ? ', Premium' : ''}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      {/* Kapak: kategori renginden sakin bir alan — SVG blob üreteci M2'de bunu dolduracak */}
      <View style={[styles.art, { backgroundColor: `${catColor}33` }]}>
        <View style={[styles.artCore, { backgroundColor: `${catColor}66` }]} />
      </View>
      <View style={styles.meta}>
        <AppText variant="display3" numberOfLines={2}>
          {title}
        </AppText>
        <View style={styles.row}>
          <AppText variant="secondary" tone="secondary">
            {categoryLabel} · {durationLabel}
          </AppText>
          {locked ? <LockBadge /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.9 },
  art: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artCore: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  meta: {
    padding: space.md,
    gap: space.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.xs,
  },
});
