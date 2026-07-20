import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText, CoverArt, EmptyState, ProgramCard, Screen, SessionCard } from '@/components';
import { canAccessSession } from '@/content/access';
import { catalog, categoryCoverSeed } from '@/content/catalog';
import { useOpenSession } from '@/features/navigation';
import { durationLabel, normalizeSearch } from '@/i18n/format';
import { useLocale } from '@/i18n';
import { fonts, radius, space, type CategoryId } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { usePremium } from '@/stores/premium';
import { useProgress } from '@/stores/progress';

type DurationFilter = 'all' | 'short' | 'medium' | 'long';

const DURATION_FILTERS: { id: DurationFilter; labelKey: string }[] = [
  { id: 'all', labelKey: 'explore.filterAll' },
  { id: 'short', labelKey: 'explore.filterShort' },
  { id: 'medium', labelKey: 'explore.filterMedium' },
  { id: 'long', labelKey: 'explore.filterLong' },
];

function matchesDuration(seconds: number, filter: DurationFilter): boolean {
  const minutes = seconds / 60;
  if (filter === 'short') return minutes <= 5;
  if (filter === 'medium') return minutes > 5 && minutes < 15;
  if (filter === 'long') return minutes >= 15;
  return true;
}

export default function ExploreScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { colors } = useTheme();
  const router = useRouter();
  const openSession = useOpenSession();
  const isPremium = usePremium((s) => s.isPremium);
  const programProgress = useProgress((s) => s.programs);

  const [query, setQuery] = useState('');
  const [duration, setDuration] = useState<DurationFilter>('all');

  const searching = query.trim().length > 0 || duration !== 'all';
  const results = useMemo(() => {
    if (!searching) return [];
    const q = normalizeSearch(query.trim());
    return catalog.sessions
      .filter((s) => matchesDuration(s.durationSec, duration))
      .filter((s) => {
        if (q.length === 0) return true;
        const haystack = normalizeSearch(
          `${s.title.tr} ${s.title.en} ${s.description.tr} ${s.description.en}`,
        );
        return haystack.includes(q);
      })
      .sort((a, b) => a.order - b.order);
  }, [query, duration, searching]);

  return (
    <Screen scroll>
      <View style={styles.stack}>
        <AppText variant="display2">{t('explore.title')}</AppText>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('explore.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel={t('explore.searchLabel')}
          style={[
            styles.search,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
          ]}
        />

        <View style={styles.filterRow}>
          {DURATION_FILTERS.map((f) => {
            const active = duration === f.id;
            return (
              <Pressable
                key={f.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setDuration(f.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.accentSoft : colors.surface,
                    borderColor: active ? colors.accent : colors.border,
                  },
                ]}
              >
                <AppText variant="caption" style={active ? { color: colors.accent } : undefined}>
                  {t(f.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {searching ? (
          <View style={styles.results}>
            {results.length === 0 ? (
              <EmptyState scene="search" title={t('explore.noResults')} body={t('explore.noResultsHint')} />
            ) : (
              results.map((session) => (
                <SessionCard
                  key={session.id}
                  id={session.id}
                  kind={session.type}
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
        ) : (
          <>
            <AppText variant="display3">{t('explore.programs')}</AppText>
            {catalog.programs.map((program) => {
              const progress = programProgress[program.id];
              return (
                <ProgramCard
                  key={program.id}
                  title={program.title[locale]}
                  subtitle={`${t('explore.daysCount', { count: program.days.length })} · ${program.description[locale].split('.')[0]}`}
                  progress={progress ? progress.completedDays.length / program.days.length : 0}
                  locked={program.access === 'premium' && !isPremium}
                  onPress={() =>
                    router.push({ pathname: '/program/[programId]', params: { programId: program.id } })
                  }
                />
              );
            })}

            <AppText variant="display3" style={styles.gridTitle}>
              {t('explore.categories')}
            </AppText>
            <View style={styles.grid}>
              {catalog.categories.map((category) => {
                const cover = categoryCoverSeed(category.id);
                return (
                  <Pressable
                    key={category.id}
                    accessibilityRole="button"
                    accessibilityLabel={category.name[locale]}
                    onPress={() =>
                      router.push({
                        pathname: '/category/[categoryId]',
                        params: { categoryId: category.id },
                      })
                    }
                    style={({ pressed }) => [
                      styles.gridItem,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      pressed && styles.pressed,
                    ]}
                  >
                    <CoverArt
                      seed={cover.seed}
                      categoryId={category.id as CategoryId}
                      height={110}
                      kind={cover.kind}
                    />
                    {/* Alt şerit: okunurluk için zemin renginde yarı saydam scrim */}
                    <View style={[styles.gridLabel, { backgroundColor: `${colors.bg}B8` }]}>
                      <AppText variant="bodyMedium">{category.name[locale]}</AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.md },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },
  search: {
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: space.md,
    fontFamily: fonts.body,
    fontSize: 17,
  },
  filterRow: { flexDirection: 'row', gap: space.xs },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  results: { gap: space.sm },
  empty: { alignItems: 'center', gap: space.xs, paddingVertical: space.xl },
  gridTitle: { marginTop: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  gridItem: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    minHeight: 40,
    justifyContent: 'center',
  },
});
