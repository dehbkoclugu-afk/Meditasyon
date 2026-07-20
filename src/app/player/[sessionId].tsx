import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import * as StoreReview from 'expo-store-review';
import { useKeepAwake } from 'expo-keep-awake';

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
import { catalog, programsById, sessionsById } from '@/content/catalog';
import { recommendForToday } from '@/features/today/recommendation';
import { playbackController, usePlayback } from '@/features/player/controller';
import { findProgramDay, type SleepTimerChoice } from '@/features/player/logic';
import { timeLabel, upperFor } from '@/i18n/format';
import { useLocale } from '@/i18n';
import { motion, radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { useProgress } from '@/stores/progress';
import { usePremium } from '@/stores/premium';
import { useSettings } from '@/stores/settings';
import { useStats } from '@/stores/stats';

const SLEEP_CHOICES: { value: SleepTimerChoice; labelKey: string }[] = [
  { value: 5, labelKey: 'player.minutes5' },
  { value: 10, labelKey: 'player.minutes10' },
  { value: 20, labelKey: 'player.minutes20' },
  { value: 45, labelKey: 'player.minutes45' },
  { value: 'end', labelKey: 'player.sessionEnd' },
];

const VOLUME_CHOICES: { value: number; labelKey: string }[] = [
  { value: 0.35, labelKey: 'player.volLow' },
  { value: 0.7, labelKey: 'player.volMid' },
  { value: 1, labelKey: 'player.volHigh' },
];

export default function PlayerScreen() {
  const { t } = useTranslation();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const session = sessionId ? sessionsById.get(sessionId) : undefined;

  if (!session) {
    return (
      <Screen>
        <AppText variant="display2">{t('player.notFound')}</AppText>
      </Screen>
    );
  }
  return <Player sessionKey={session.id} />;
}

// Ayrı bileşen: hook'lar session garanti edildikten sonra koşulsuz çalışır.
// Oynatma sahibi controller — ekran kapansa da ses sürer (mini-player devralır).
function KeepAwakeWhileActive() {
  useKeepAwake(); // seans sırasında ekran kararmaz (PLAN §4.3)
  return null;
}

function Player({ sessionKey }: { sessionKey: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const session = sessionsById.get(sessionKey)!;
  const router = useRouter();
  const { colors } = useTheme();
  const playback = usePlayback();

  useEffect(() => {
    playbackController.start(sessionKey);
  }, [sessionKey]);

  const favorites = useProgress((s) => s.favorites);
  const toggleFavorite = useProgress((s) => s.toggleFavorite);
  const isFavorite = favorites.includes(session.id);

  const [panel, setPanel] = useState<'none' | 'sleep' | 'ambience'>('none');

  // Karartma modu (DESIGN.md §5.6): oynatma sürerken 10 sn dokunulmazsa
  // arayüz söner, yalnız halka kalır; herhangi bir dokunuş geri getirir.
  const [dimmed, setDimmed] = useState(false);
  const dimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uiOpacity = useSharedValue(1);
  const lastTap = useRef(0);

  function poke() {
    if (dimTimer.current) clearTimeout(dimTimer.current);
    setDimmed(false);
  }

  useEffect(() => {
    uiOpacity.value = withTiming(dimmed ? 0.08 : 1, {
      duration: motion.slow,
      easing: Easing.bezier(...motion.easing),
    });
  }, [dimmed, uiOpacity]);

  useEffect(() => {
    if (dimTimer.current) clearTimeout(dimTimer.current);
    if (playback.isPlaying && panel === 'none' && !dimmed) {
      dimTimer.current = setTimeout(() => setDimmed(true), 10000);
    }
    return () => {
      if (dimTimer.current) clearTimeout(dimTimer.current);
    };
  }, [playback.isPlaying, panel, dimmed]);

  const uiStyle = useAnimatedStyle(() => ({ opacity: uiOpacity.value }));

  const keepScreenAwake = useSettings((s) => s.keepScreenAwake);

  // Kapak arkasında çok yavaş dönen amber hale (PLAN §5.5: 120 sn/tur).
  const reducedMotion = useReducedMotion();
  const haloAngle = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) return;
    haloAngle.value = withRepeat(withTiming(360, { duration: 120000, easing: Easing.linear }), -1);
    return () => cancelAnimation(haloAngle);
  }, [haloAngle, reducedMotion]);
  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${haloAngle.value}deg` }, { scaleX: 1.06 }],
  }));

  function onArtPress() {
    const now = Date.now();
    if (now - lastTap.current < 300) playbackController.toggle(); // çift dokunuş
    lastTap.current = now;
    poke();
  }

  const categoryName =
    catalog.categories.find((c) => c.id === session.categories[0])?.name[locale] ?? '';
  const isCurrent = playback.sessionId === session.id;
  const progress =
    isCurrent && playback.durationSec > 0 ? playback.positionSec / playback.durationSec : 0;
  const remaining = isCurrent
    ? Math.max(0, playback.durationSec - playback.positionSec)
    : session.durationSec;

  if (isCurrent && playback.finished) {
    return (
      <FinishView
        sessionKey={session.id}
        onClose={() => {
          playbackController.acknowledgeFinished();
          router.back();
        }}
      />
    );
  }

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <Screen>
        {keepScreenAwake && playback.isPlaying && <KeepAwakeWhileActive />}
        <View style={styles.root} onTouchStart={poke}>
          <Animated.View style={uiStyle}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={() => router.back()}
              style={styles.close}
              hitSlop={12}
            >
              <ChevronDownIcon color={colors.textSecondary} />
            </Pressable>
          </Animated.View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={playback.isPlaying ? t('player.pause') : t('player.play')}
            onPress={onArtPress}
            style={styles.artBlock}
          >
            <Animated.View style={[styles.halo, { backgroundColor: colors.accentSoft }, haloStyle]} />
            <PlayRing progress={progress} size={264}>
              <View style={styles.artClip}>
                <CoverArt
                  seed={session.id}
                  categoryId={session.categories[0]}
                  height={232}
                  kind={session.type}
                />
              </View>
            </PlayRing>
          </Pressable>

          <Animated.View style={[styles.dimGroup, uiStyle]}>
            <View style={styles.meta}>
              <AppText variant="caption" tone="secondary">
                {upperFor(categoryName, locale)}
              </AppText>
              <AppText variant="display2" style={styles.centerText} numberOfLines={2}>
                {session.title[locale]}
              </AppText>
              <AppText variant="secondary" tone="secondary" style={{ fontVariant: ['tabular-nums'] }}>
                {timeLabel(isCurrent ? playback.positionSec : 0)} ·{' '}
                {t('player.remaining', { time: timeLabel(remaining) })}
              </AppText>
            </View>

            <View style={styles.controls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('player.back15')}
                onPress={() => playbackController.seekBy(-15)}
                hitSlop={8}
                style={styles.sideControl}
              >
                <Back15Icon color={colors.textPrimary} size={30} />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={playback.isPlaying ? t('player.pause') : t('player.play')}
                onPress={() => playbackController.toggle()}
                style={({ pressed }) => [
                  styles.playButton,
                  { backgroundColor: colors.accent },
                  pressed && styles.pressed,
                ]}
              >
                {playback.isPlaying ? (
                  <PauseIcon color={colors.bg} size={30} />
                ) : (
                  <PlayIcon color={colors.bg} size={30} />
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('player.fwd15')}
                onPress={() => playbackController.seekBy(15)}
                hitSlop={8}
                style={styles.sideControl}
              >
                <Fwd15Icon color={colors.textPrimary} size={30} />
              </Pressable>
            </View>

            <View style={styles.bottomRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isFavorite ? t('player.favRemove') : t('player.favAdd')}
                onPress={() => toggleFavorite(session.id)}
                hitSlop={8}
                style={styles.bottomButton}
              >
                <HeartIcon
                  color={isFavorite ? colors.accent : colors.textSecondary}
                  filled={isFavorite}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('player.sleepTimer')}
                onPress={() => setPanel(panel === 'sleep' ? 'none' : 'sleep')}
                hitSlop={8}
                style={styles.bottomButton}
              >
                <MoonIcon
                  color={playback.sleepTimer !== null ? colors.accent : colors.textSecondary}
                />
                {playback.sleepRemainingSec !== null && (
                  <AppText variant="caption" tone="accent" style={{ fontVariant: ['tabular-nums'] }}>
                    {timeLabel(playback.sleepRemainingSec)}
                  </AppText>
                )}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('player.ambience')}
                onPress={() => setPanel(panel === 'ambience' ? 'none' : 'ambience')}
                hitSlop={8}
                style={styles.bottomButton}
              >
                <WavesIcon color={playback.ambienceIds.length > 0 ? colors.accent : colors.textSecondary} />
              </Pressable>
            </View>

            {panel === 'sleep' && (
              <View
                style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <AppText variant="caption" tone="secondary">
                  {t('player.sleepTitle')}
                </AppText>
                <View style={styles.chipRow}>
                  {SLEEP_CHOICES.map((choice) => {
                    const active = playback.sleepTimer === choice.value;
                    return (
                      <Chip
                        key={String(choice.value)}
                        label={t(choice.labelKey)}
                        active={active}
                        onPress={() =>
                          playbackController.setSleepTimer(active ? null : choice.value)
                        }
                      />
                    );
                  })}
                </View>
              </View>
            )}

            {panel === 'ambience' && (
              <View
                style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <AppText variant="caption" tone="secondary">
                  {t('player.ambienceTitle')}
                </AppText>
                <View style={styles.chipRow}>
                  {catalog.ambiences.map((a) => (
                    <Chip
                      key={a.id}
                      label={a.title[locale]}
                      active={playback.ambienceIds.includes(a.id)}
                      onPress={() => playbackController.toggleAmbience(a.id)}
                    />
                  ))}
                </View>
                {playback.ambienceIds.length > 0 && (
                  <View style={styles.chipRow}>
                    {VOLUME_CHOICES.map((v) => (
                      <Chip
                        key={v.labelKey}
                        label={t(v.labelKey)}
                        active={playback.ambienceVolume === v.value}
                        onPress={() => playbackController.setAmbienceVolume(v.value)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        </View>
      </Screen>
    </>
  );
}

function FinishView({ sessionKey, onClose }: { sessionKey: string; onClose: () => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { colors } = useTheme();
  const router = useRouter();
  const programs = useProgress((s) => s.programs);
  const [mood, setMood] = useState<number | null>(null);
  const isPremium = usePremium((s) => s.isPremium);
  const intents = useSettings((s) => s.intents);
  // Sıradaki öneri: mevcut seans hariç (PLAN §6.4)
  const nextRec = recommendForToday(catalog, programs, new Date().getHours(), isPremium, intents);
  const nextSession = nextRec.session.id === sessionKey ? null : nextRec.session;
  const openNext = (id: string) => {
    playbackController.acknowledgeFinished();
    router.replace({ pathname: '/player/[sessionId]', params: { sessionId: id } });
  };

  // Program bitti mi? Son gün tamamlandıysa kutlama varyantı gösterilir.
  const day = findProgramDay(catalog, sessionKey);
  const program = day ? programsById.get(day.program.id) : undefined;
  const programDone =
    program != null && (programs[program.id]?.completedDays.length ?? 0) >= program.days.length;

  // Doğru anda değerlendirme istemi: 3. tamamlanan seans, bir kez.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const { totalSessions } = useStats.getState();
    const { reviewAsked, setReviewAsked } = useSettings.getState();
    if (reviewAsked || totalSessions < 3) return;
    StoreReview.hasAction().then((can) => {
      if (!can) return;
      setReviewAsked();
      StoreReview.requestReview().catch(() => {});
    });
  }, []);

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <Screen>
        <View style={styles.finish}>
          <BreathRing size={140} />
          <View style={styles.finishCopy}>
            <AppText variant="display1" style={styles.centerText}>
              {programDone ? t('player.programDoneTitle') : t('player.doneTitle')}
            </AppText>
            <AppText tone="secondary" style={styles.centerText}>
              {programDone && program
                ? t('player.programDoneBody', { program: program.title[locale] })
                : t('player.doneBody')}
            </AppText>
          </View>
          {/* Ruh hali check-in: tek dokunuş, cihazda kalır */}
          <View style={styles.moodRow}>
            {(
              [
                { value: 1, labelKey: 'player.moodCalmer' },
                { value: 0, labelKey: 'player.moodSame' },
                { value: -1, labelKey: 'player.moodTense' },
              ] as const
            ).map((option) => (
              <Chip
                key={option.value}
                label={t(option.labelKey)}
                active={mood === option.value}
                onPress={() => {
                  setMood(option.value);
                  useStats.getState().recordMood(option.value);
                }}
              />
            ))}
          </View>

          {nextSession && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('player.upNext')}: ${nextSession.title[locale]}`}
              onPress={() => openNext(nextSession.id)}
              style={({ pressed }) => [
                styles.nextCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={styles.nextArt}>
                <CoverArt
                  seed={nextSession.id}
                  categoryId={nextSession.categories[0]}
                  height={56}
                  kind={nextSession.type}
                />
              </View>
              <View style={styles.nextMeta}>
                <AppText variant="caption" tone="accent">
                  {upperFor(t('player.upNext'), locale)}
                </AppText>
                <AppText variant="bodyMedium" numberOfLines={1}>
                  {nextSession.title[locale]}
                </AppText>
              </View>
              <PlayIcon color={colors.accent} size={22} />
            </Pressable>
          )}

          <Button label={t('common.close')} onPress={onClose} />
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
  dimGroup: { alignItems: 'center', gap: space.lg, alignSelf: 'stretch' },
  pressed: { opacity: 0.85 },
  close: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  artBlock: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 320, height: 320, borderRadius: 160 },
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
  finish: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg },
  moodRow: { flexDirection: 'row', gap: space.xs },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'stretch',
    paddingRight: space.md,
    minHeight: 56,
  },
  nextArt: { width: 64, height: 56 },
  nextMeta: { flex: 1, gap: 2 },
  finishCopy: { alignItems: 'center', gap: space.xs },
});
