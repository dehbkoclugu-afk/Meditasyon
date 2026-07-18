import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, BreathRing, Button, CoverArt, PlayRing, Screen } from '@/components';
import {
  Back15Icon,
  ChevronDownIcon,
  Fwd15Icon,
  HeartIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  WavesIcon,
} from '@/components/icons';
import { catalog, sessionsById } from '@/content/catalog';
import { useAmbience, type AmbienceVolume } from '@/features/player/useAmbience';
import { useSessionPlayer } from '@/features/player/useSessionPlayer';
import type { SleepTimerChoice } from '@/features/player/logic';
import { timeLabel } from '@/i18n/format';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { useProgress } from '@/stores/progress';

const SLEEP_CHOICES: { value: SleepTimerChoice; label: string }[] = [
  { value: 5, label: '5 dk' },
  { value: 10, label: '10 dk' },
  { value: 20, label: '20 dk' },
  { value: 45, label: '45 dk' },
  { value: 'end', label: 'Seans sonu' },
];

const VOLUME_CHOICES: { value: AmbienceVolume; label: string }[] = [
  { value: 0.35, label: 'Kısık' },
  { value: 0.7, label: 'Orta' },
  { value: 1, label: 'Yüksek' },
];

export default function PlayerScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const session = sessionId ? sessionsById.get(sessionId) : undefined;

  if (!session) {
    return (
      <Screen>
        <AppText variant="display2">Seans bulunamadı</AppText>
      </Screen>
    );
  }
  return <Player sessionKey={session.id} />;
}

// Ayrı bileşen: hook'lar session garanti edildikten sonra koşulsuz çalışır.
function Player({ sessionKey }: { sessionKey: string }) {
  const session = sessionsById.get(sessionKey)!;
  const router = useRouter();
  const { colors } = useTheme();
  const { state, toggle, seekBy, setSleepTimer } = useSessionPlayer(session);
  const ambience = useAmbience();

  const favorites = useProgress((s) => s.favorites);
  const toggleFavorite = useProgress((s) => s.toggleFavorite);
  const isFavorite = favorites.includes(session.id);

  const [panel, setPanel] = useState<'none' | 'sleep' | 'ambience'>('none');

  const categoryName =
    catalog.categories.find((c) => c.id === session.categories[0])?.name.tr ?? '';
  const progress = state.durationSec > 0 ? state.positionSec / state.durationSec : 0;
  const remaining = Math.max(0, state.durationSec - state.positionSec);

  if (state.finished) {
    return (
      <>
        <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
        <Screen>
          <View style={styles.finish}>
            <BreathRing size={140} />
            <View style={styles.finishCopy}>
              <AppText variant="display1" style={styles.centerText}>
                Tamamlandı
              </AppText>
              <AppText tone="secondary" style={styles.centerText}>
                Bu anı kendine ayırdın. Yarın yine buluşalım mı?
              </AppText>
            </View>
            <Button label="Kapat" onPress={() => router.back()} />
          </View>
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <Screen>
        <View style={styles.root}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kapat"
            onPress={() => router.back()}
            style={styles.close}
            hitSlop={12}
          >
            <ChevronDownIcon color={colors.textSecondary} />
          </Pressable>

          <View style={styles.artBlock}>
            <PlayRing progress={progress} size={264}>
              <View style={styles.artClip}>
                <CoverArt seed={session.id} categoryId={session.categories[0]} height={232} />
              </View>
            </PlayRing>
          </View>

          <View style={styles.meta}>
            <AppText variant="caption" tone="secondary">
              {categoryName.toLocaleUpperCase('tr')}
            </AppText>
            <AppText variant="display2" style={styles.centerText} numberOfLines={2}>
              {session.title.tr}
            </AppText>
            <AppText variant="secondary" tone="secondary" style={{ fontVariant: ['tabular-nums'] }}>
              {timeLabel(state.positionSec)} · kalan {timeLabel(remaining)}
            </AppText>
          </View>

          <View style={styles.controls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="15 saniye geri"
              onPress={() => seekBy(-15)}
              hitSlop={8}
              style={styles.sideControl}
            >
              <Back15Icon color={colors.textPrimary} size={30} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={state.isPlaying ? 'Duraklat' : 'Oynat'}
              onPress={toggle}
              style={({ pressed }) => [
                styles.playButton,
                { backgroundColor: colors.accent },
                pressed && styles.pressed,
              ]}
            >
              {state.isPlaying ? (
                <PauseIcon color={colors.bg} size={30} />
              ) : (
                <PlayIcon color={colors.bg} size={30} />
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="15 saniye ileri"
              onPress={() => seekBy(15)}
              hitSlop={8}
              style={styles.sideControl}
            >
              <Fwd15Icon color={colors.textPrimary} size={30} />
            </Pressable>
          </View>

          <View style={styles.bottomRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              onPress={() => toggleFavorite(session.id)}
              hitSlop={8}
              style={styles.bottomButton}
            >
              <HeartIcon color={isFavorite ? colors.accent : colors.textSecondary} filled={isFavorite} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Uyku zamanlayıcısı"
              onPress={() => setPanel(panel === 'sleep' ? 'none' : 'sleep')}
              hitSlop={8}
              style={styles.bottomButton}
            >
              <MoonIcon color={state.sleepTimer !== null ? colors.accent : colors.textSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Arka plan sesi"
              onPress={() => setPanel(panel === 'ambience' ? 'none' : 'ambience')}
              hitSlop={8}
              style={styles.bottomButton}
            >
              <WavesIcon color={ambience.activeId ? colors.accent : colors.textSecondary} />
            </Pressable>
          </View>

          {panel === 'sleep' && (
            <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText variant="caption" tone="secondary">
                UYKU ZAMANLAYICISI
              </AppText>
              <View style={styles.chipRow}>
                {SLEEP_CHOICES.map((choice) => {
                  const active = state.sleepTimer === choice.value;
                  return (
                    <Chip
                      key={String(choice.value)}
                      label={choice.label}
                      active={active}
                      onPress={() => setSleepTimer(active ? null : choice.value)}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {panel === 'ambience' && (
            <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText variant="caption" tone="secondary">
                ARKA PLAN SESİ
              </AppText>
              <View style={styles.chipRow}>
                {catalog.ambiences.map((a) => (
                  <Chip
                    key={a.id}
                    label={a.title.tr}
                    active={ambience.activeId === a.id}
                    onPress={() => ambience.select(ambience.activeId === a.id ? null : a.id)}
                  />
                ))}
              </View>
              {ambience.activeId && (
                <View style={styles.chipRow}>
                  {VOLUME_CHOICES.map((v) => (
                    <Chip
                      key={v.label}
                      label={v.label}
                      active={ambience.volume === v.value}
                      onPress={() => ambience.setVolume(v.value)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </Screen>
    </>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.accentSoft : colors.surfaceHigh,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}
    >
      <AppText variant="caption" style={active ? { color: colors.accent } : undefined}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg },
  pressed: { opacity: 0.85 },
  close: { position: 'absolute', top: 0, left: 0, minWidth: 44, minHeight: 44, justifyContent: 'center' },
  artBlock: { alignItems: 'center' },
  artClip: { width: 232, height: 232, borderRadius: radius.playerArt * 4, overflow: 'hidden' },
  meta: { alignItems: 'center', gap: space.xs, paddingHorizontal: space.lg },
  centerText: { textAlign: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: space.xl },
  sideControl: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  playButton: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  bottomRow: { flexDirection: 'row', gap: space.xl },
  bottomButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  panel: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.md,
    gap: space.sm,
    alignSelf: 'stretch',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  finish: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl },
  finishCopy: { alignItems: 'center', gap: space.xs },
});
