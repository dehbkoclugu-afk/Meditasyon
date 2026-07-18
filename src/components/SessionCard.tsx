import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { CoverArt } from './CoverArt';
import { LockBadge } from './LockBadge';
import { radius, space, type CategoryId } from '@/design/tokens';
import { useTheme } from '@/design/theme';

type Props = {
  id: string; // kapak üreteci tohumu — aynı seans hep aynı kapağı alır
  title: string;
  durationLabel: string; // "12 dk" — biçimleme çağıran tarafta (i18n)
  categoryLabel: string;
  categoryId: CategoryId;
  locked?: boolean;
  onPress: () => void;
};

export function SessionCard({ id, title, durationLabel, categoryLabel, categoryId, locked, onPress }: Props) {
  const { colors } = useTheme();

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
      <CoverArt seed={id} categoryId={categoryId} height={96} />
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
