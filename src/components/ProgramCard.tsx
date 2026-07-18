import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { LockBadge } from './LockBadge';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

type Props = {
  title: string;
  subtitle: string; // "7 gün · Başlangıç" — i18n çağıran tarafta
  /** 0–1; 0 ise ilerleme çizgisi gizlenir */
  progress?: number;
  locked?: boolean;
  onPress: () => void;
};

export function ProgramCard({ title, subtitle, progress = 0, locked, onPress }: Props) {
  const { colors } = useTheme();
  const pct = Math.min(1, Math.max(0, progress));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}${locked ? ', Premium' : ''}`}
      accessibilityValue={pct > 0 ? { text: `%${Math.round(pct * 100)}` } : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surfaceHigh, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <AppText variant="display3" numberOfLines={2} style={styles.title}>
          {title}
        </AppText>
        {locked ? <LockBadge /> : null}
      </View>
      <AppText variant="secondary" tone="secondary">
        {subtitle}
      </AppText>
      {pct > 0 ? (
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <View style={[styles.fill, { backgroundColor: colors.accent, width: `${pct * 100}%` }]} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.md,
    gap: space.xs,
  },
  pressed: { opacity: 0.9 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.xs,
  },
  title: { flexShrink: 1 },
  track: {
    height: 4,
    borderRadius: 2,
    marginTop: space.xs,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
});
