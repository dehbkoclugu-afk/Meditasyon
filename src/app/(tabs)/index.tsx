import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, CoverArt, LockBadge, Screen } from '@/components';
import { canAccessSession } from '@/content/access';
import { catalog } from '@/content/catalog';
import { recommendForToday } from '@/features/today/recommendation';
import { useOpenSession } from '@/features/navigation';
import { dayPartForHour, durationLabel, upperFor } from '@/i18n/format';
import { useLocale } from '@/i18n';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { usePremium } from '@/stores/premium';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';

export default function TodayScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { colors } = useTheme();
  const router = useRouter();
  const openSession = useOpenSession();
  const isPremium = usePremium((s) => s.isPremium);
  const programs = useProgress((s) => s.programs);
  const sessionProgress = useProgress((s) => s.sessions);
  const intents = useSettings((s) => s.intents);

  const hour = new Date().getHours();
  const rec = recommendForToday(catalog, programs, hour, isPremium, intents);
  // Yarım kalanlar: pozisyon kaydı olan, öneriyle çakışmayan seanslar
  const resumable = catalog.sessions
    .filter((s) => (sessionProgress[s.id]?.lastPositionSec ?? 0) > 5 && s.id !== rec.session.id)
    .slice(0, 4);
  const freePicks = catalog.sessions
    .filter((s) => s.type === 'guided' && s.access === 'free' && !s.id.startsWith('baslangic'))
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

  const heroLabel =
    rec.kind === 'program-day'
      ? t('today.heroProgramDay', { program: rec.program.title[locale], day: rec.dayIndex + 1 })
      : rec.kind === 'program-start'
        ? t('today.heroStart')
        : t('today.heroToday');

  return (
    <Screen scroll>
      <View style={styles.stack}>
        <AppText variant="display1">{t(`greeting.${dayPartForHour(hour)}`)}</AppText>

        {/* Hero: günün önerisi — ekranın tek birincil eylemi */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${heroLabel}: ${rec.session.title[locale]}, ${durationLabel(rec.session.durationSec, locale)}`}
          onPress={() => openSession(rec.session)}
          style={({ pressed }) => [
            styles.hero,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <CoverArt seed={rec.session.id} categoryId={rec.session.categories[0]} height={148} kind={rec.session.type} />
          <View style={styles.heroMeta}>
            <AppText variant="caption" tone="accent">
              {upperFor(heroLabel, locale)}
            </AppText>
            <AppText variant="display2">{rec.session.title[locale]}</AppText>
            <AppText variant="secondary" tone="secondary" numberOfLines={2}>
              {rec.session.description[locale]}
            </AppText>
            <AppText variant="secondary" tone="secondary">
              {durationLabel(rec.session.durationSec, locale)}
            </AppText>
          </View>
        </Pressable>

        {/* Kategori kısayolları */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {catalog.categories.map((category) => (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityLabel={category.name[locale]}
              onPress={() =>
                router.push({ pathname: '/category/[categoryId]', params: { categoryId: category.id } })
              }
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <AppText variant="secondary">{category.name[locale]}</AppText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Devam et: yarım kalan seanslar */}
        {resumable.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <AppText variant="display3">{t('today.continueShelf')}</AppText>
            </View>
            <View style={styles.resumeList}>
              {resumable.map((session) => {
                const leftMin = Math.max(
                  1,
                  Math.round(
                    (session.durationSec - (sessionProgress[session.id]?.lastPositionSec ?? 0)) / 60,
                  ),
                );
                return (
                  <Pressable
                    key={session.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${session.title[locale]}, ${t('today.resumeLeft', { count: leftMin })}`}
                    onPress={() => openSession(session)}
                    style={({ pressed }) => [
                      styles.resumeRow,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.resumeArt}>
                      <CoverArt seed={session.id} categoryId={session.categories[0]} height={64} kind={session.type} />
                    </View>
                    <View style={styles.resumeMeta}>
                      <AppText variant="bodyMedium" numberOfLines={1}>
                        {session.title[locale]}
                      </AppText>
                      <AppText variant="caption" tone="secondary">
                        {t('today.resumeLeft', { count: leftMin })}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Ücretsiz seçkiler */}
        <View style={styles.sectionHeader}>
          <AppText variant="display3">{t('today.freePicks')}</AppText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelf}>
          {freePicks.map((session) => (
            <Pressable
              key={session.id}
              accessibilityRole="button"
              accessibilityLabel={`${session.title[locale]}, ${durationLabel(session.durationSec, locale)}`}
              onPress={() => openSession(session)}
              style={({ pressed }) => [
                styles.shelfCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <CoverArt seed={session.id} categoryId={session.categories[0]} height={80} kind={session.type} />
              <View style={styles.shelfMeta}>
                <AppText variant="bodyMedium" numberOfLines={2}>
                  {session.title[locale]}
                </AppText>
                <View style={styles.shelfRow}>
                  <AppText variant="caption" tone="secondary">
                    {durationLabel(session.durationSec, locale)}
                  </AppText>
                  {!canAccessSession(session, isPremium) && <LockBadge />}
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.lg },
  pressed: { opacity: 0.9 },
  hero: { borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  heroMeta: { padding: space.md, gap: space.xs },
  chips: { gap: space.xs, paddingRight: space.lg },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: space.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  sectionHeader: { marginTop: space.xs },
  resumeList: { gap: space.xs },
  resumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 64,
    paddingRight: space.md,
  },
  resumeArt: { width: 72, height: 64 },
  resumeMeta: { flex: 1, gap: 2 },
  shelf: { gap: space.sm, paddingRight: space.lg },
  shelfCard: { width: 220, borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  shelfMeta: { padding: space.sm, gap: 4 },
  shelfRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
