import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { CoverArt } from './CoverArt';
import { PauseIcon, PlayIcon } from './icons';
import { sessionsById } from '@/content/catalog';
import { playbackController, usePlayback } from '@/features/player/controller';
import { useLocale } from '@/i18n';
import { motion, radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

// Oynatma sürerken oynat/duraklat düğmesi çevresinde 4 sn'lik nabız —
// "yaşıyor" sinyali; reduced-motion açıkken tamamen kapalı.
function PulseRing({ active, color }: { active: boolean; color: string }) {
  const reduced = useReducedMotion();
  const phase = useSharedValue(0);
  const running = active && !reduced;

  useEffect(() => {
    if (running) {
      phase.value = withRepeat(
        withTiming(1, { duration: motion.breathCycleMs, easing: Easing.bezier(...motion.easing) }),
        -1,
        false,
      );
    } else {
      cancelAnimation(phase);
      phase.value = 0;
    }
    return () => cancelAnimation(phase);
  }, [running, phase]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - phase.value),
    transform: [{ scale: 1 + phase.value * 0.4 }],
  }));

  if (!running) return null;
  return <Animated.View pointerEvents="none" style={[styles.pulse, { borderColor: color }, style]} />;
}

// Mini-player: player ekranı kapalıyken çalan seansın şeridi (tab bar üstü).
// Dokunuş player'ı açar; ✕ oynatmayı durdurur (pozisyon kaydedilir).
const TAB_BAR_HEIGHT = 49;

export function MiniPlayer() {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const playback = usePlayback();

  const session = playback.sessionId ? sessionsById.get(playback.sessionId) : undefined;
  if (!session || playback.finished) return null;

  return (
    <View
      style={[
        styles.wrap,
        {
          bottom: TAB_BAR_HEIGHT + insets.bottom + space.xs,
          backgroundColor: colors.surfaceHigh,
          borderColor: colors.border,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={session.title[locale]}
        onPress={() =>
          router.push({ pathname: '/player/[sessionId]', params: { sessionId: session.id } })
        }
        style={styles.main}
      >
        <View style={styles.art}>
          <CoverArt
            seed={session.id}
            categoryId={session.categories[0]}
            height={48}
            kind={session.type}
          />
        </View>
        <AppText variant="bodyMedium" numberOfLines={1} style={styles.title}>
          {session.title[locale]}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playback.isPlaying ? t('player.pause') : t('player.play')}
        onPress={() => playbackController.toggle()}
        hitSlop={8}
        style={styles.button}
      >
        <PulseRing active={playback.isPlaying} color={colors.accent} />
        {playback.isPlaying ? (
          <PauseIcon color={colors.textPrimary} size={22} />
        ) : (
          <PlayIcon color={colors.textPrimary} size={22} />
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={() => playbackController.stop()}
        hitSlop={8}
        style={styles.button}
      >
        <AppText variant="bodyMedium" tone="secondary">
          ✕
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: space.sm,
    right: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 56,
    paddingRight: space.xs,
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  art: { width: 56, height: 56 },
  title: { flex: 1 },
  button: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  pulse: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
  },
});
