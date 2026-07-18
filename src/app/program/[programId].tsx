import { Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, CoverArt, LockBadge, Screen } from '@/components';
import { canAccessProgramDay } from '@/content/access';
import { programDaySessions, programsById } from '@/content/catalog';
import { useOpenSession } from '@/features/navigation';
import { durationLabel } from '@/i18n/format';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { usePremium } from '@/stores/premium';
import { useProgress } from '@/stores/progress';

export default function ProgramScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { colors } = useTheme();
  const openSession = useOpenSession();
  const isPremium = usePremium((s) => s.isPremium);
  const progress = useProgress((s) => s.programs[programId ?? '']);

  const program = programId ? programsById.get(programId) : undefined;
  if (!program) {
    return (
      <Screen>
        <AppText variant="display2">Program bulunamadı</AppText>
      </Screen>
    );
  }

  const days = programDaySessions(program);
  const unlockedDay = progress?.unlockedDay ?? 0;
  const completedDays = progress?.completedDays ?? [];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: program.title.tr, headerBackTitle: 'Geri' }} />
      <Screen scroll>
        <View style={styles.stack}>
          <CoverArt seed={program.id} categoryId={days[0].categories[0]} height={148} />
          <AppText variant="display1">{program.title.tr}</AppText>
          <AppText tone="secondary">{program.description.tr}</AppText>

          <View style={styles.dayList}>
            {days.map((session, index) => {
              const isCompleted = completedDays.includes(index);
              const isCurrent = index === unlockedDay && !isCompleted;
              // Gün kilidi iki katmanlı: sıra kilidi (önceki gün bitmedi) + erişim kilidi (premium)
              const sequenceLocked = index > unlockedDay;
              const accessLocked = !canAccessProgramDay(program, index, isPremium);
              const locked = sequenceLocked || accessLocked;

              return (
                <Pressable
                  key={session.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Gün ${index + 1}: ${session.title.tr}${isCompleted ? ', tamamlandı' : locked ? ', kilitli' : ''}`}
                  disabled={sequenceLocked}
                  onPress={() => openSession(session)}
                  style={({ pressed }) => [
                    styles.dayRow,
                    {
                      backgroundColor: isCurrent ? colors.surfaceHigh : colors.surface,
                      borderColor: isCurrent ? colors.accent : colors.border,
                      opacity: sequenceLocked ? 0.45 : 1,
                    },
                    pressed && !sequenceLocked && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.dayBubble,
                      {
                        backgroundColor: isCompleted ? colors.accent : colors.surfaceHigh,
                        borderColor: isCompleted ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <AppText variant="caption" tone={isCompleted ? 'inverse' : 'secondary'}>
                      {isCompleted ? '✓' : index + 1}
                    </AppText>
                  </View>
                  <View style={styles.dayMeta}>
                    <AppText variant="bodyMedium" numberOfLines={1}>
                      {session.title.tr}
                    </AppText>
                    <AppText variant="caption" tone="secondary">
                      {durationLabel(session.durationSec, 'tr')}
                    </AppText>
                  </View>
                  {accessLocked && !sequenceLocked ? <LockBadge /> : null}
                </Pressable>
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
  pressed: { opacity: 0.9 },
  dayList: { gap: space.xs, marginTop: space.xs },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.sm,
    minHeight: 64,
  },
  dayBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayMeta: { flex: 1, gap: 2 },
});
