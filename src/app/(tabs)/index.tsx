import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Reanimated, { FadeInUp, ReduceMotion, useReducedMotion } from 'react-native-reanimated';

import { AppText, CoverArt, LockBadge, Screen } from '@/components';
import { FlameIcon } from '@/components/icons';
import { isNewSession, newestSessions } from '@/content/fresh';
import { dailyQuote } from '@/content/quotes';
import { effectiveStreak, localDateKey } from '@/features/stats/streak';
import { canAccessSession } from '@/content/access';
import { catalog } from '@/content/catalog';
import { recommendForToday } from '@/features/today/recommendation';
import { useOpenSession } from '@/features/navigation';
import { dayPartForHour, durationLabel, upperFor } from '@/i18n/format';
import { useLocale } from '@/i18n';
import { categoryColors, motion, radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { usePremium } from '@/stores/premium';
import { useStats } from '@/stores/stats';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';

// Giriş sıralaması: bloklar 60 ms arayla yukarı süzülür (reduced-motion'da kapalı)
const enter = (order: number) =>
  FadeInUp.duration(motion.slow)
    .delay(order * 60)
    .reduceMotion(ReduceMotion.System);

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
  const stats = useStats();
  const reducedMotion = useReducedMotion();

  // Hero paralaksı: kapak, kaydırmanın ~%30'u hızında geride kalır
  const [scrollY] = useState(() => new Animated.Value(0));
  const heroShift = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, 20],
    extrapolate: 'clamp',
  });

  const hour = new Date().getHours();
  const dayPart = dayPartForHour(hour);
  const todayKey = localDateKey(new Date());
  const streak = effectiveStreak(stats.streak, todayKey);
  const todayMinutes = stats.dayMinutes[todayKey] ?? 0;
  const quote = dailyQuote(todayKey);
  const rec = recommendForToday(catalog, programs, hour, isPremium, intents);
  const newest = newestSessions(catalog.sessions, 6);
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
  const heroTint = categoryColors[rec.session.categories[0]];

  return (
    <Screen
      scroll
      onScroll={
        reducedMotion
          ? undefined
          : Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
              useNativeDriver: Platform.OS !== 'web',
            })
      }
    >
      <View style={styles.stack}>
        {/* Başlık: selamlama + alt satır + streak alevi + bugünkü dakika (PLAN §6.2) */}
        <Reanimated.View entering={enter(0)}>
          <View style={styles.headerRow}>
            <AppText variant="display1" style={styles.headerTitle}>
              {t(`greeting.${dayPart}`)}
            </AppText>
            {(streak > 0 || todayMinutes > 0) && (
              <View
                style={[styles.statPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
                accessibilityLabel={`${streak} ${t('profile.streak')}, ${todayMinutes} ${t('profile.totalMinutes')}`}
              >
                <FlameIcon color={streak > 0 ? colors.accent : colors.textSecondary} size={18} />
                <AppText variant="caption" style={{ fontVariant: ['tabular-nums'] }}>
                  {streak}
                </AppText>
                {todayMinutes > 0 && (
                  <AppText variant="caption" tone="secondary" style={{ fontVariant: ['tabular-nums'] }}>
                    · {t('player.minutes', { count: todayMinutes })}
                  </AppText>
                )}
              </View>
            )}
          </View>
          <AppText variant="quoteSmall" tone="secondary">
            {t(`greeting.sub.${dayPart}`)}
          </AppText>
        </Reanimated.View>

        {/* Hero: günün önerisi — ekranın tek birincil eylemi */}
        <Reanimated.View entering={enter(1)}>
          <View style={styles.heroWrap}>
            {/* Kapağın soluk kopyası kartın arkasında hale gibi taşar */}
            <View pointerEvents="none" accessibilityElementsHidden style={styles.heroGlow}>
              <CoverArt
                seed={rec.session.id}
                categoryId={rec.session.categories[0]}
                height={160}
                kind={rec.session.type}
              />
            </View>
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
              <View style={styles.heroArtClip}>
                <Animated.View
                  style={
                    reducedMotion ? styles.heroArtInner : [styles.heroArtInner, { transform: [{ translateY: heroShift }] }]
                  }
                >
                  <CoverArt
                    seed={rec.session.id}
                    categoryId={rec.session.categories[0]}
                    height={188}
                    kind={rec.session.type}
                  />
                </Animated.View>
              </View>
              {/* Kategori tonu: kartı seansın rengiyle hafifçe ısıtır */}
              <View pointerEvents="none" style={[styles.heroTint, { backgroundColor: `${heroTint}12` }]} />
              <View style={styles.heroMeta}>
                <AppText variant="caption" tone="accent">
                  {upperFor(heroLabel, locale)}
                </AppText>
                <AppText variant="display2">{rec.session.title[locale]}</AppText>
                <AppText variant="secondary" tone="secondary" numberOfLines={2}>
                  {rec.session.description[locale]}
                </AppText>
                <AppText variant="secondary" tone="accent" style={styles.tabular}>
                  {durationLabel(rec.session.durationSec, locale)}
                </AppText>
              </View>
            </Pressable>
          </View>
        </Reanimated.View>

        {/* Günün niyeti: kutusuz — amber tırnak, italik metin, ince çizgi */}
        <Reanimated.View entering={enter(2)} style={styles.quoteWrap}>
          <AppText variant="display2" tone="accent" accessibilityElementsHidden style={styles.quoteMark}>
            {'“'}
          </AppText>
          <AppText variant="quote">{quote[locale]}</AppText>
          <View style={[styles.quoteRule, { backgroundColor: colors.accentSoft }]} />
        </Reanimated.View>

        {/* Kategori kısayolları */}
        <Reanimated.View entering={enter(3)}>
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
        </Reanimated.View>

        {/* Devam et: yarım kalan seanslar */}
        {resumable.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <AppText variant="display3">{t('today.continueShelf')}</AppText>
              <AppText variant="caption" tone="secondary" style={styles.tabular}>
                {resumable.length}
              </AppText>
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
                      { backgroundColor: colors.surfaceHigh },
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

        {/* Yeni eklenenler (PLAN §6.2) — kare kapaklar */}
        <View style={styles.sectionHeader}>
          <AppText variant="display3">{t('today.newShelf')}</AppText>
          <AppText variant="caption" tone="secondary" style={styles.tabular}>
            {newest.length}
          </AppText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelf}>
          {newest.map((session) => (
            <Pressable
              key={session.id}
              accessibilityRole="button"
              accessibilityLabel={`${session.title[locale]}, ${durationLabel(session.durationSec, locale)}`}
              onPress={() => openSession(session)}
              style={({ pressed }) => [
                styles.shelfCardSquare,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <CoverArt seed={session.id} categoryId={session.categories[0]} height={156} kind={session.type} />
              <View style={styles.shelfMeta}>
                <AppText variant="bodyMedium" numberOfLines={2}>
                  {session.title[locale]}
                </AppText>
                <View style={styles.shelfRow}>
                  <AppText variant="caption" tone="accent" style={styles.tabular}>
                    {durationLabel(session.durationSec, locale)}
                  </AppText>
                  {isNewSession(session) ? (
                    <View style={[styles.newBadge, { backgroundColor: colors.accentSoft }]}>
                      <AppText variant="caption" style={{ color: colors.accent }}>
                        {t('today.newBadge')}
                      </AppText>
                    </View>
                  ) : (
                    !canAccessSession(session, isPremium) && <LockBadge />
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Ücretsiz seçkiler — 4:3 kapaklar */}
        <View style={styles.sectionHeader}>
          <AppText variant="display3">{t('today.freePicks')}</AppText>
          <AppText variant="caption" tone="secondary" style={styles.tabular}>
            {freePicks.length}
          </AppText>
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
              <CoverArt seed={session.id} categoryId={session.categories[0]} height={165} kind={session.type} />
              <View style={styles.shelfMeta}>
                <AppText variant="bodyMedium" numberOfLines={2}>
                  {session.title[locale]}
                </AppText>
                <View style={styles.shelfRow}>
                  <AppText variant="caption" tone="accent" style={styles.tabular}>
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
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },
  tabular: { fontVariant: ['tabular-nums'] },
  heroWrap: { position: 'relative' },
  heroGlow: {
    position: 'absolute',
    top: -4,
    left: 8,
    right: 8,
    height: 160,
    borderRadius: radius.card,
    overflow: 'hidden',
    opacity: 0.35,
  },
  hero: { borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  heroArtClip: { height: 148, overflow: 'hidden' },
  heroArtInner: { marginTop: -20 },
  heroTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroMeta: { padding: space.md, gap: space.xs },
  chips: { gap: space.xs, paddingRight: space.lg },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: space.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  sectionHeader: {
    marginTop: space.xs,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xs,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  headerTitle: { flexShrink: 1 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    minHeight: 44,
  },
  quoteWrap: { paddingHorizontal: space.xs, gap: 2 },
  quoteMark: { lineHeight: 30, marginBottom: -6 },
  quoteRule: { height: 2, width: 56, borderRadius: 1, marginTop: space.sm },
  newBadge: { borderRadius: 999, paddingHorizontal: space.xs, paddingVertical: 3 },
  resumeList: { gap: space.xs },
  resumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.card,
    overflow: 'hidden',
    minHeight: 64,
    paddingRight: space.md,
  },
  resumeArt: { width: 72, height: 64 },
  resumeMeta: { flex: 1, gap: 2 },
  shelf: { gap: space.sm, paddingRight: space.lg },
  shelfCard: { width: 220, borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  shelfCardSquare: { width: 156, borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  shelfMeta: { padding: space.sm, gap: 4 },
  shelfRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
