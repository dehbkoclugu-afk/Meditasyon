import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Screen } from '@/components';
import { BreathIcon, MoonIcon } from '@/components/icons';
import { catalog } from '@/content/catalog';
import { cycleSeconds } from '@/features/breathing/engine';
import { useLocale } from '@/i18n';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

// Nefes sekmesi — tamamen ücretsiz (alışkanlık kapısı, PLAN.md §6.6).
export default function BreatheScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const { colors } = useTheme();
  const exercises = catalog.sessions.filter((s) => s.type === 'breathing' && s.pattern);

  return (
    <Screen scroll>
      <View style={styles.stack}>
        <AppText variant="display2">{t('breathing.title')}</AppText>
        <AppText tone="secondary">{t('breathing.subtitle')}</AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('timer.entry')}
          onPress={() => router.push('/timer')}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.surfaceHigh, borderColor: colors.accent },
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
            <MoonIcon color={colors.accent} />
          </View>
          <View style={styles.meta}>
            <AppText variant="bodyMedium">{t('timer.entry')}</AppText>
            <AppText variant="caption" tone="secondary">
              {t('timer.entrySub')}
            </AppText>
          </View>
        </Pressable>

        {exercises.map((session) => {
          const p = session.pattern!;
          const patternLabel = [p.inhale, p.hold, p.exhale, p.holdEmpty]
            .filter((n, i) => n > 0 || i === 0 || i === 2)
            .join('-');
          return (
            <Pressable
              key={session.id}
              accessibilityRole="button"
              accessibilityLabel={`${session.title[locale]}, ${patternLabel}`}
              onPress={() =>
                router.push({ pathname: '/breathing/[sessionId]', params: { sessionId: session.id } })
              }
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
                <BreathIcon color={colors.accent} />
              </View>
              <View style={styles.meta}>
                <AppText variant="bodyMedium">{session.title[locale]}</AppText>
                <AppText variant="caption" tone="secondary">
                  {patternLabel} · {t('breathing.cycle', { seconds: cycleSeconds(p) })}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.md },
  pressed: { opacity: 0.9 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.md,
    minHeight: 72,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { gap: 2, flex: 1 },
});
