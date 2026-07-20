import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, BreathRing, Button, Screen } from '@/components';
import { ChevronDownIcon } from '@/components/icons';
import { audioAssets } from '@/content/audio-map';
import { catalog } from '@/content/catalog';
import { playBell, playBellIfEnabled } from '@/features/player/bell';
import { timeLabel } from '@/i18n/format';
import { useLocale } from '@/i18n';
import { space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { useSettings } from '@/stores/settings';
import { useStats } from '@/stores/stats';

// Zamansız oturum: rehbersiz meditasyon zamanlayıcısı — süre + aralıklı çan +
// ambience. Bitişte istatistiğe yazılır (Insight Timer tarzı çekirdek özellik).

const DURATIONS = [5, 10, 15, 20, 30, 45];
const BELL_INTERVALS = [0, 5, 10]; // dk; 0 = kapalı

type Phase = 'setup' | 'running' | 'done';

export default function TimerScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const { colors } = useTheme();
  const keepScreenAwake = useSettings((s) => s.keepScreenAwake);

  const [phase, setPhase] = useState<Phase>('setup');
  const [durationMin, setDurationMin] = useState(10);
  const [bellEvery, setBellEvery] = useState(0);
  const [ambienceId, setAmbienceId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const ambienceRef = useRef<AudioPlayer | null>(null);
  const lastBellMinute = useRef(0);
  const recorded = useRef(false);

  const totalSec = durationMin * 60;
  const remaining = Math.max(0, totalSec - elapsed);

  // Sayaç + aralıklı çan + bitiş
  useEffect(() => {
    if (phase !== 'running' || paused) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [phase, paused]);

  useEffect(() => {
    if (phase !== 'running') return;
    const minute = Math.floor(elapsed / 60);
    if (bellEvery > 0 && minute > lastBellMinute.current && minute % bellEvery === 0 && elapsed < totalSec) {
      lastBellMinute.current = minute;
      playBell(0.5);
    }
    if (elapsed >= totalSec && !recorded.current) {
      recorded.current = true;
      useStats.getState().recordSession(totalSec);
      playBellIfEnabled();
      stopAmbience();
      setPhase('done');
    }
  }, [phase, elapsed, bellEvery, totalSec]);

  function stopAmbience() {
    ambienceRef.current?.remove();
    ambienceRef.current = null;
  }

  function toggleAmbience(id: string | null) {
    stopAmbience();
    setAmbienceId(id);
    if (id && audioAssets[id] != null) {
      const player = createAudioPlayer(audioAssets[id]);
      player.loop = true;
      player.volume = 0.7;
      player.play();
      ambienceRef.current = player;
    }
  }

  useEffect(() => stopAmbience, []); // unmount

  function begin() {
    lastBellMinute.current = 0;
    recorded.current = false;
    setElapsed(0);
    setPaused(false);
    setPhase('running');
  }

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <Screen>
        {keepScreenAwake && phase === 'running' && !paused && <KeepAwakeActive />}
        <View style={styles.root}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={() => router.back()}
            style={styles.close}
            hitSlop={12}
          >
            <ChevronDownIcon color={colors.textSecondary} />
          </Pressable>

          <View style={styles.center}>
            {phase === 'setup' && (
              <>
                <AppText variant="display2" style={styles.centerText}>
                  {t('timer.title')}
                </AppText>

                {/* Süre sahnesi: büyük rakam + yan ± adımlar; çipler hızlı seçim */}
                <View style={styles.section}>
                  <View style={styles.durationScene}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`−5 ${t('timer.duration')}`}
                      disabled={durationMin <= 5}
                      onPress={() => setDurationMin((m) => Math.max(5, m - 5))}
                      style={({ pressed }) => [
                        styles.stepButton,
                        { backgroundColor: colors.surface, opacity: durationMin <= 5 ? 0.35 : 1 },
                        pressed && styles.pressed,
                      ]}
                    >
                      <AppText variant="display3" tone="secondary">
                        −
                      </AppText>
                    </Pressable>
                    <View style={styles.durationCenter}>
                      <AppText variant="numeral" style={styles.durationBig}>
                        {durationMin}
                      </AppText>
                      <AppText variant="caption" tone="secondary">
                        {t('timer.duration')}
                      </AppText>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`+5 ${t('timer.duration')}`}
                      disabled={durationMin >= 60}
                      onPress={() => setDurationMin((m) => Math.min(60, m + 5))}
                      style={({ pressed }) => [
                        styles.stepButton,
                        { backgroundColor: colors.surface, opacity: durationMin >= 60 ? 0.35 : 1 },
                        pressed && styles.pressed,
                      ]}
                    >
                      <AppText variant="display3" tone="secondary">
                        +
                      </AppText>
                    </Pressable>
                  </View>
                  <View style={[styles.chipRow, styles.chipRowCenter]}>
                    {DURATIONS.map((minutes) => (
                      <Chip
                        key={minutes}
                        label={t('player.minutes', { count: minutes })}
                        active={durationMin === minutes}
                        onPress={() => setDurationMin(minutes)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <AppText variant="caption" tone="secondary">
                    {t('timer.intervalBell')}
                  </AppText>
                  <View style={styles.chipRow}>
                    {BELL_INTERVALS.map((minutes) => (
                      <Chip
                        key={minutes}
                        label={minutes === 0 ? t('timer.bellOff') : t('timer.bellEvery', { count: minutes })}
                        active={bellEvery === minutes}
                        onPress={() => setBellEvery(minutes)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <AppText variant="caption" tone="secondary">
                    {t('player.ambienceTitle')}
                  </AppText>
                  <View style={styles.chipRow}>
                    {catalog.ambiences.map((a) => (
                      <Chip
                        key={a.id}
                        label={a.title[locale]}
                        active={ambienceId === a.id}
                        onPress={() => toggleAmbience(ambienceId === a.id ? null : a.id)}
                      />
                    ))}
                  </View>
                </View>

                <Button label={t('common.start')} onPress={begin} />
              </>
            )}

            {phase === 'running' && (
              <>
                <BreathRing size={180} />
                <View style={styles.copy}>
                  <AppText
                    variant="numeral"
                    style={[styles.bigTime, { fontVariant: ['tabular-nums'] }]}
                  >
                    {timeLabel(remaining)}
                  </AppText>
                  <AppText variant="secondary" tone="secondary">
                    {t('timer.remaining')}
                  </AppText>
                </View>
                <View style={styles.rowActions}>
                  <Button
                    label={paused ? t('timer.resume') : t('timer.pause')}
                    variant="ghost"
                    onPress={() => setPaused((p) => !p)}
                  />
                  <Button label={t('timer.finishEarly')} variant="text" onPress={() => router.back()} />
                </View>
              </>
            )}

            {phase === 'done' && (
              <>
                <BreathRing size={140} />
                <View style={styles.copy}>
                  <AppText variant="display1" style={styles.centerText}>
                    {t('player.doneTitle')}
                  </AppText>
                  <AppText tone="secondary" style={styles.centerText}>
                    {t('timer.doneBody')}
                  </AppText>
                </View>
                <Button label={t('common.close')} onPress={() => router.back()} />
              </>
            )}
          </View>
        </View>
      </Screen>
    </>
  );
}

function KeepAwakeActive() {
  useKeepAwake();
  return null;
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
          backgroundColor: active ? colors.accentSoft : colors.surface,
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
  root: { flex: 1 },
  close: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', gap: space.xl },
  centerText: { textAlign: 'center' },
  section: { gap: space.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: space.xs,
  },
  copy: { alignItems: 'center', gap: 4 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },
  durationScene: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.lg,
  },
  durationCenter: { alignItems: 'center', minWidth: 96 },
  durationBig: { fontSize: 64, lineHeight: 72 },
  stepButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRowCenter: { justifyContent: 'center' },
  bigTime: { fontSize: 44, lineHeight: 52 },
  rowActions: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, alignItems: 'center' },
});
