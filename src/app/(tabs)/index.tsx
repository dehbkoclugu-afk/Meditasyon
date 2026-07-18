import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, CoverArt, LockBadge, Screen } from '@/components';
import { canAccessSession } from '@/content/access';
import { catalog } from '@/content/catalog';
import { recommendForToday } from '@/features/today/recommendation';
import { useOpenSession } from '@/features/navigation';
import { dayPartForHour, durationLabel } from '@/i18n/format';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { usePremium } from '@/stores/premium';
import { useProgress } from '@/stores/progress';

const GREETING: Record<ReturnType<typeof dayPartForHour>, string> = {
  sabah: 'Günaydın',
  gunduz: 'İyi günler',
  aksam: 'İyi akşamlar',
  gece: 'İyi geceler',
};

export default function TodayScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const openSession = useOpenSession();
  const isPremium = usePremium((s) => s.isPremium);
  const programs = useProgress((s) => s.programs);

  const hour = new Date().getHours();
  const rec = recommendForToday(catalog, programs, hour, isPremium);
  const freePicks = catalog.sessions
    .filter((s) => s.type === 'guided' && s.access === 'free' && !s.id.startsWith('baslangic'))
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

  const heroLabel =
    rec.kind === 'program-day'
      ? `${rec.program.title.tr} · Gün ${rec.dayIndex + 1}`
      : rec.kind === 'program-start'
        ? 'Buradan başla'
        : 'Bugünün önerisi';

  return (
    <Screen scroll>
      <View style={styles.stack}>
        <AppText variant="display1">{GREETING[dayPartForHour(hour)]}</AppText>

        {/* Hero: günün önerisi — ekranın tek birincil eylemi */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${heroLabel}: ${rec.session.title.tr}, ${durationLabel(rec.session.durationSec, 'tr')}`}
          onPress={() => openSession(rec.session)}
          style={({ pressed }) => [
            styles.hero,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <CoverArt seed={rec.session.id} categoryId={rec.session.categories[0]} height={148} />
          <View style={styles.heroMeta}>
            <AppText variant="caption" tone="accent">
              {heroLabel.toLocaleUpperCase('tr')}
            </AppText>
            <AppText variant="display2">{rec.session.title.tr}</AppText>
            <AppText variant="secondary" tone="secondary" numberOfLines={2}>
              {rec.session.description.tr}
            </AppText>
            <AppText variant="secondary" tone="secondary">
              {durationLabel(rec.session.durationSec, 'tr')}
            </AppText>
          </View>
        </Pressable>

        {/* Kategori kısayolları */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {catalog.categories.map((category) => (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityLabel={category.name.tr}
              onPress={() =>
                router.push({ pathname: '/category/[categoryId]', params: { categoryId: category.id } })
              }
              style={({ pressed }) => [
                styles.chip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <AppText variant="secondary">{category.name.tr}</AppText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Ücretsiz seçkiler */}
        <View style={styles.sectionHeader}>
          <AppText variant="display3">Ücretsiz seçkiler</AppText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelf}>
          {freePicks.map((session) => (
            <Pressable
              key={session.id}
              accessibilityRole="button"
              accessibilityLabel={`${session.title.tr}, ${durationLabel(session.durationSec, 'tr')}`}
              onPress={() => openSession(session)}
              style={({ pressed }) => [
                styles.shelfCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <CoverArt seed={session.id} categoryId={session.categories[0]} height={80} />
              <View style={styles.shelfMeta}>
                <AppText variant="bodyMedium" numberOfLines={2}>
                  {session.title.tr}
                </AppText>
                <View style={styles.shelfRow}>
                  <AppText variant="caption" tone="secondary">
                    {durationLabel(session.durationSec, 'tr')}
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
  shelf: { gap: space.sm, paddingRight: space.lg },
  shelfCard: { width: 220, borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  shelfMeta: { padding: space.sm, gap: 4 },
  shelfRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
