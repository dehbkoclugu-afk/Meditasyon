import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText, Button, Screen } from '@/components';
import { ChevronDownIcon } from '@/components/icons';
import { sessionsById } from '@/content/catalog';
import {
  PHASE_LABELS,
  cyclesForDuration,
  phaseAt,
  totalSeconds,
  type BreathPhase,
} from '@/features/breathing/engine';
import { motion, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { useSettings } from '@/stores/settings';
import { useStats } from '@/stores/stats';

const DURATIONS = [
  { label: '1 dk', seconds: 60 },
  { label: '3 dk', seconds: 180 },
  { label: '5 dk', seconds: 300 },
];

const EASING = Easing.bezier(...motion.easing);

export default function BreathingScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const session = sessionId ? sessionsById.get(sessionId) : undefined;

  if (!session?.pattern) {
    return (
      <Screen>
        <AppText variant="display2">Egzersiz bulunamadı</AppText>
      </Screen>
    );
  }
  return <Breathing sessionKey={session.id} />;
}

function Breathing({ sessionKey }: { sessionKey: string }) {
  const session = sessionsById.get(sessionKey)!;
  const pattern = session.pattern!;
  const router = useRouter();
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const hapticsEnabled = useSettings((s) => s.hapticsEnabled);

  const [durationSec, setDurationSec] = useState(180);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const cycles = cyclesForDuration(pattern, durationSec);
  const total = totalSeconds(pattern, cycles);
  const state = phaseAt(pattern, cycles, elapsed);
  const done = running && state.done; // türetilmiş — ayrı state tutulmaz
  const lastPhase = useRef<BreathPhase | null>(null);
  const scale = useSharedValue(1);
  const recorded = useRef(false);

  // Sayaç
  useEffect(() => {
    if (!running || done) return;
    const interval = setInterval(() => setElapsed((e) => e + 0.25), 250);
    return () => clearInterval(interval);
  }, [running, done]);

  // Faz geçişi: animasyon hedefi + haptik (yalnız ref + store — setState yok)
  useEffect(() => {
    if (!running) return;
    if (state.done) {
      if (!recorded.current) {
        recorded.current = true;
        useStats.getState().recordSession(total);
      }
      return;
    }
    if (lastPhase.current !== state.phase) {
      lastPhase.current = state.phase;
      const target = state.phase === 'inhale' ? 1.25 : state.phase === 'exhale' ? 1 : scale.value;
      if (!reduced) {
        scale.value = withTiming(target, {
          duration: state.phaseDuration * 1000,
          easing: EASING,
        });
      }
      if (Platform.OS !== 'web' && hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
  }, [running, state.phase, state.phaseDuration, state.done, reduced, hapticsEnabled, scale, total]);

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const remainingCycles = cycles - state.cycleIndex;

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

          <View style={styles.center}>
            <View style={styles.ringWrap}>
              <Animated.View
                style={[
                  styles.ring,
                  { borderColor: colors.accent, backgroundColor: colors.accentSoft },
                  ringStyle,
                ]}
              />
              <AppText variant="display2" style={styles.phaseText}>
                {done ? 'Bitti' : running ? PHASE_LABELS[state.phase] : session.title.tr}
              </AppText>
            </View>

            {done ? (
              <View style={styles.copy}>
                <AppText tone="secondary" style={styles.centerText}>
                  Güzel. Nefesin hep yanında.
                </AppText>
                <Button label="Kapat" onPress={() => router.back()} />
              </View>
            ) : running ? (
              <View style={styles.copy}>
                <AppText variant="secondary" tone="secondary">
                  {remainingCycles} döngü kaldı
                </AppText>
                <Button label="Bitir" variant="ghost" onPress={() => router.back()} />
              </View>
            ) : (
              <View style={styles.copy}>
                <AppText tone="secondary" style={styles.centerText}>
                  {session.description.tr}
                </AppText>
                <View style={styles.chipRow}>
                  {DURATIONS.map((d) => {
                    const active = durationSec === d.seconds;
                    return (
                      <Pressable
                        key={d.seconds}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => setDurationSec(d.seconds)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: active ? colors.accentSoft : colors.surface,
                            borderColor: active ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <AppText variant="caption" style={active ? { color: colors.accent } : undefined}>
                          {d.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
                <Button
                  label="Başla"
                  onPress={() => {
                    setElapsed(0);
                    recorded.current = false;
                    lastPhase.current = null;
                    setRunning(true);
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  close: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xxl },
  ringWrap: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  phaseText: { textAlign: 'center' },
  copy: { alignItems: 'center', gap: space.md, paddingHorizontal: space.lg },
  centerText: { textAlign: 'center' },
  chipRow: { flexDirection: 'row', gap: space.xs },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: space.md,
    minHeight: 40,
    justifyContent: 'center',
  },
});
