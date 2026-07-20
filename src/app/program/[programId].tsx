import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, CoverArt, LockBadge, Screen } from '@/components';
import { canAccessProgramDay } from '@/content/access';
import { programDaySessions, programsById } from '@/content/catalog';
import { useOpenSession } from '@/features/navigation';
import { durationLabel } from '@/i18n/format';
import { useLocale } from '@/i18n';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { usePremium } from '@/stores/premium';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';

export default function ProgramScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { colors } = useTheme();
  const openSession = useOpenSession();
  const isPremium = usePremium((s) => s.isPremium);
  const progress = useProgress((s) => s.programs[programId ?? '']);
  const sequentialUnlock = useSettings((s) => s.sequentialUnlock);

  const program = programId ? programsById.get(programId) : undefined;
  if (!program) {
    return (
      <Screen>
        <AppText variant="display2">{t('common.notFound')}</AppText>
      </Screen>
    );
  }

  const days = programDaySessions(program);
  const unlockedDay = progress?.unlockedDay ?? 0;
  const completedDays = progress?.completedDays ?? [];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: program.title[locale], headerBackTitle: t('common.back') }} />
      <Screen scroll>
        <View style={styles.stack}>
          <CoverArt seed={program.id} categoryId={days[0].categories[0]} height={148} />
          <AppText variant="display1">{program.title[locale]}</AppText>
          <AppText tone="secondary">{program.description[locale]}</AppText>

          <View style={styles.dayList}>
            {days.map((session, index) => {
              const isCompleted = completedDays.includes(index);
              const isCurrent = index === unlockedDay && !isCompleted;
              // Gün kilidi iki katmanlı: sıra kilidi (önceki gün bitmedi) + erişim kilidi (premium)
              const sequenceLocked = sequentialUnlock && index > unlockedDay;
              const accessLocked = !canAccessProgramDay(program, index, isPremium);
              const locked = sequenceLocked || accessLocked;

              // Zaman çizgisi noktası: bitmiş → dolu amber, sıradaki → amber halka, diğerleri → soluk
              const dotStyle = isCompleted
                ? { backgroundColor: colors.accent, borderColor: colors.accent }
                : isCurrent
                  ? { backgroundColor: colors.surfaceHigh, borderColor: colors.accent }
                  : { backgroundColor: colors.surface, borderColor: colors.border };

              return (
                <View key={session.id} style={styles.timelineRow}>
                  <View style={styles.timelineCol} accessibilityElementsHidden>
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: index === 0 ? 'transparent' : colors.border },
                      ]}
                    />
                    <View style={[styles.timelineDot, dotStyle]}>
                      {isCompleted ? (
                        <AppText variant="caption" tone="inverse" style={styles.dotMark}>
                          ✓
                        </AppText>
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: index === days.length - 1 ? 'transparent' : colors.border },
                      ]}
                    />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${t('program.day', { day: index + 1 })}: ${session.title[locale]}${isCompleted ? `, ${t('program.completed')}` : locked ? `, ${t('program.locked')}` : ''}`}
                    disabled={sequenceLocked}
                    onPress={() => openSession(session)}
                    style={({ pressed }) => [
                      styles.dayRow,
                      {
                        backgroundColor: isCurrent ? colors.surfaceHigh : colors.surface,
                        borderColor: isCurrent ? colors.accent : 'transparent',
                        opacity: sequenceLocked ? 0.45 : 1,
                      },
                      pressed && !sequenceLocked && styles.pressed,
                    ]}
                  >
                    <View style={styles.dayMeta}>
                      <AppText variant="bodyMedium" numberOfLines={1}>
                        {session.title[locale]}
                      </AppText>
                      <AppText variant="caption" tone="secondary" style={styles.dayCaption}>
                        {t('program.day', { day: index + 1 })} · {durationLabel(session.durationSec, locale)}
                      </AppText>
                    </View>
                    {accessLocked && !sequenceLocked ? <LockBadge /> : null}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.md },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },
  dayList: { marginTop: space.xs },
  timelineRow: { flexDirection: 'row', alignItems: 'stretch', gap: space.sm },
  timelineCol: { width: 20, alignItems: 'center' },
  timelineLine: { flex: 1, width: 2, borderRadius: 1 },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotMark: { fontSize: 9, lineHeight: 11 },
  dayRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.sm,
    minHeight: 64,
    marginVertical: space.xs / 2,
  },
  dayMeta: { flex: 1, gap: 2 },
  dayCaption: { fontVariant: ['tabular-nums'] },
});
