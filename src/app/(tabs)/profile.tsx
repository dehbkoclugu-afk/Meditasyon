import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Screen, SessionCard, StatTile } from '@/components';
import { canAccessSession } from '@/content/access';
import { catalog, sessionsById } from '@/content/catalog';
import { computeBadges } from '@/features/stats/badges';
import { effectiveStreak, localDateKey } from '@/features/stats/streak';
import { useOpenSession } from '@/features/navigation';
import { durationLabel } from '@/i18n/format';
import { useLocale } from '@/i18n';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { usePremium } from '@/stores/premium';
import { useProgress } from '@/stores/progress';
import { useStats } from '@/stores/stats';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const { colors } = useTheme();
  const openSession = useOpenSession();
  const stats = useStats();
  const favorites = useProgress((s) => s.favorites);
  const programs = useProgress((s) => s.programs);
  const isPremium = usePremium((s) => s.isPremium);

  const streak = effectiveStreak(stats.streak, localDateKey(new Date()));
  const completedProgramCount = catalog.programs.filter(
    (p) => (programs[p.id]?.completedDays.length ?? 0) >= p.days.length,
  ).length;
  const badges = computeBadges({
    totalMinutes: stats.totalMinutes,
    totalSessions: stats.totalSessions,
    bestStreak: stats.streak.best,
    completedProgramCount,
  });
  const favoriteSessions = favorites
    .map((id) => sessionsById.get(id))
    .filter((s): s is NonNullable<typeof s> => s != null);

  return (
    <Screen scroll>
      <View style={styles.stack}>
        <View style={styles.headerRow}>
          <AppText variant="display2">{t('profile.title')}</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.settings')}
            onPress={() => router.push('/settings')}
            hitSlop={8}
            style={styles.settingsLink}
          >
            <AppText variant="bodyMedium" tone="accent">
              {t('profile.settings')}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.tiles}>
          <StatTile value={String(stats.totalMinutes)} label={t('profile.totalMinutes')} />
          <StatTile value={String(stats.totalSessions)} label={t('profile.sessions')} />
          <StatTile value={String(streak)} label={t('profile.streak')} />
        </View>

        {/* Isı şeridi: son 8 hafta, tek renkli amber (PLAN.md §6.7) */}
        <View style={[styles.heatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppText variant="caption" tone="secondary">
            {t('profile.last8Weeks')}
          </AppText>
          <HeatStrip activeDays={stats.activeDays} />
        </View>

        <View
          style={[styles.premiumCard, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}
        >
          <View style={styles.premiumMeta}>
            <AppText variant="bodyMedium">{isPremium ? t('profile.premiumActive') : t('profile.premiumCta')}</AppText>
            <AppText variant="caption" tone="secondary">
              {isPremium ? t('profile.premiumActiveBody') : t('profile.premiumCtaBody')}
            </AppText>
          </View>
          {!isPremium && (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/paywall')}
              style={[styles.premiumCta, { backgroundColor: colors.accent }]}
            >
              <AppText variant="caption" tone="inverse">
                {t('profile.premiumSee')}
              </AppText>
            </Pressable>
          )}
        </View>

        <AppText variant="display3">{t('profile.badges')}</AppText>
        <View style={styles.badgeGrid}>
          {badges.map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badge,
                {
                  backgroundColor: badge.earned ? colors.accentSoft : colors.surface,
                  borderColor: badge.earned ? colors.accent : colors.border,
                  opacity: badge.earned ? 1 : 0.55,
                },
              ]}
            >
              <AppText variant="caption" style={badge.earned ? { color: colors.accent } : undefined}>
                {t(`badges.${badge.id}`)}
              </AppText>
            </View>
          ))}
        </View>

        <AppText variant="display3">{t('profile.favorites')}</AppText>
        {favoriteSessions.length === 0 ? (
          <AppText variant="secondary" tone="secondary">
            {t('profile.favoritesEmpty')}
          </AppText>
        ) : (
          favoriteSessions.map((session) => (
            <SessionCard
              key={session.id}
              id={session.id}
              title={session.title[locale]}
              durationLabel={durationLabel(session.durationSec, locale)}
              categoryLabel={
                catalog.categories.find((c) => c.id === session.categories[0])?.name[locale] ?? ''
              }
              categoryId={session.categories[0]}
              locked={!canAccessSession(session, isPremium)}
              onPress={() => openSession(session)}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

function HeatStrip({ activeDays }: { activeDays: string[] }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const active = new Set(activeDays);
  const days: { key: string; on: boolean }[] = [];
  const today = new Date();
  for (let i = 55; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = localDateKey(d);
    days.push({ key, on: active.has(key) });
  }
  return (
    <View style={styles.heatGrid} accessibilityLabel={t('profile.heatLabel', { count: active.size })}>
      {days.map((day) => (
        <View
          key={day.key}
          style={[
            styles.heatCell,
            { backgroundColor: day.on ? colors.accent : colors.border },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingsLink: { minHeight: 44, justifyContent: 'center' },
  tiles: { flexDirection: 'row', gap: space.sm },
  heatCard: { borderRadius: radius.card, borderWidth: 1, padding: space.md, gap: space.sm },
  heatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  heatCell: { width: 14, height: 14, borderRadius: 4 },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.md,
  },
  premiumMeta: { gap: 2 },
  premiumCta: { borderRadius: 999, paddingHorizontal: space.md, minHeight: 36, justifyContent: 'center' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  badge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: space.sm, paddingVertical: 6 },
});
