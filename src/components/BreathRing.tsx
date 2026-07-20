import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/design/tokens';
import { useTheme } from '@/design/theme';

// DESIGN.md: reduced-motion açıkken halka ölçekle değil opaklıkla nefes alır.
export function breathAnimationMode(reducedMotion: boolean): 'scale' | 'opacity' {
  return reducedMotion ? 'opacity' : 'scale';
}

type Props = {
  size?: number;
  color?: string;
};

const EASING = Easing.bezier(...motion.easing);

export function BreathRing({ size = 160, color }: Props) {
  const { colors } = useTheme();
  const ringColor = color ?? colors.accent;
  const reduced = useReducedMotion();
  const mode = breathAnimationMode(reduced);
  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(1, { duration: motion.breathCycleMs / 2, easing: EASING }),
      -1,
      true,
    );
    return () => cancelAnimation(phase);
  }, [phase]);

  const animatedStyle = useAnimatedStyle(() => {
    if (mode === 'opacity') {
      return { opacity: 0.7 + phase.value * 0.3 };
    }
    return { transform: [{ scale: 1 + phase.value * 0.15 }] };
  });

  // Karşı-fazlı dış halka: içeri nefes alırken o dışarı verir — derinlik hissi
  const counterStyle = useAnimatedStyle(() => {
    if (mode === 'opacity') {
      return { opacity: 0.35 - phase.value * 0.2 };
    }
    return { transform: [{ scale: 1.12 - phase.value * 0.12 }] };
  });

  const ring = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderColor: ringColor,
  };
  const counterRing = {
    width: size * 1.18,
    height: size * 1.18,
    borderRadius: (size * 1.18) / 2,
    borderColor: ringColor,
  };
  const halo = {
    width: size * 1.3,
    height: size * 1.3,
    borderRadius: (size * 1.3) / 2,
    backgroundColor: colors.accentSoft,
  };

  return (
    <View accessibilityElementsHidden style={styles.wrap}>
      <Animated.View style={[styles.halo, halo, animatedStyle]} />
      <Animated.View style={[styles.counterRing, counterRing, counterStyle]} />
      <Animated.View style={[styles.ring, ring, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute' },
  counterRing: { position: 'absolute', borderWidth: 1, opacity: 0.35 },
  ring: { borderWidth: 2 },
});
