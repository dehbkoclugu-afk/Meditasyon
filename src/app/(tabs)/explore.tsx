import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText, ProgramCard, Screen, SessionCard } from '@/components';
import { canAccessSession } from '@/content/access';
import { catalog } from '@/content/catalog';
import { useOpenSession } from '@/features/navigation';
import { durationLabel, normalizeSearch } from '@/i18n/format';
import { categoryColors, fonts, radius, space, type CategoryId } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { usePremium } from '@/stores/premium';
import { useProgress } from '@/stores/progress';

type DurationFilter = 'all' | 'short' | 'medium' | 'long';

const DURATION_FILTERS: { id: DurationFilter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'short', label: '≤5 dk' },
  { id: 'medium', label: '10 dk' },
  { id: 'long', label: '15+ dk' },
];

function matchesDuration(seconds: number, filter: DurationFilter): boolean {
  const minutes = seconds / 60;
  if (filter === 'short') return minutes <= 5;
  if (filter === 'medium') return minutes > 5 && minutes < 15;
  if (filter === 'long') return minutes >= 15;
  return true;
}

export default function ExploreScreen() {
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
        <AppText variant="display2">Keşfet</AppText>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ara: uyku, odak, şükran…"
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel="Meditasyon ara"
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
                  {f.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {searching ? (
          <View style={styles.results}>
            {results.length === 0 ? (
              <View style={styles.empty}>
                <AppText variant="display3">Sonuç yok</AppText>
                <AppText tone="secondary" variant="secondary">
                  Farklı bir kelime dene — ya da kategorilere göz at.
                </AppText>
              </View>
            ) : (
              results.map((session) => (
                <SessionCard
                  key={session.id}
                  id={session.id}
                  title={session.title.tr}
                  durationLabel={durationLabel(session.durationSec, 'tr')}
                  categoryLabel={
                    catalog.categories.find((c) => c.id === session.categories[0])?.name.tr ?? ''
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
            <AppText variant="display3">Programlar</AppText>
            {catalog.programs.map((program) => {
              const progress = programProgress[program.id];
              return (
                <ProgramCard
                  key={program.id}
                  title={program.title.tr}
                  subtitle={`${program.days.length} gün · ${program.description.tr.split('.')[0]}`}
                  progress={progress ? progress.completedDays.length / program.days.length : 0}
                  locked={program.access === 'premium' && !isPremium}
                  onPress={() =>
                    router.push({ pathname: '/program/[programId]', params: { programId: program.id } })
                  }
                />
              );
            })}

            <AppText variant="display3" style={styles.gridTitle}>
              Kategoriler
            </AppText>
            <View style={styles.grid}>
              {catalog.categories.map((category) => (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityLabel={category.name.tr}
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
                  <View
                    style={[styles.dot, { backgroundColor: categoryColors[category.id as CategoryId] }]}
                  />
                  <AppText variant="bodyMedium">{category.name.tr}</AppText>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.md },
  pressed: { opacity: 0.9 },
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
    minHeight: 36,
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
    padding: space.md,
    gap: space.xs,
    minHeight: 72,
    justifyContent: 'center',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
