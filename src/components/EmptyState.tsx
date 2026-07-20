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
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from './AppText';
import { motion, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

// Boş durum sahnesi: çıplak metin yerine küçük, sakin bir illüstrasyon.
// scene: 'search' (dalgalar arasında nokta) | 'heart' (filiz) | 'category' (ay doğuyor)

type Props = {
  scene: 'search' | 'heart' | 'category';
  title?: string;
  body: string;
};

export function EmptyState({ scene, title, body }: Props) {
  const { colors } = useTheme();
  const stroke = { stroke: colors.textSecondary, strokeWidth: 1.5, strokeLinecap: 'round' as const, fill: 'none' as const };
  const accent = { stroke: colors.accent, strokeWidth: 1.5, strokeLinecap: 'round' as const, fill: 'none' as const };

  // 6 sn'lik yumuşak süzülme — sahne canlı ama sakin (reduced-motion'da sabit)
  const reduced = useReducedMotion();
  const phase = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    phase.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.bezier(...motion.easing) }),
      -1,
      true,
    );
    return () => cancelAnimation(phase);
  }, [reduced, phase]);
  const float = useAnimatedStyle(() => ({ transform: [{ translateY: phase.value * -6 }] }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={float}>
      <Svg width={120} height={80} viewBox="0 0 120 80">
        {scene === 'search' && (
          <>
            <Path d="M12 56c10 0 13-7 20-7s10 7 20 7 13-7 20-7 10 7 20 7 11-7 16-7" {...stroke} opacity={0.5} />
            <Circle cx={60} cy={30} r={12} {...accent} />
            <Path d="M69 39 78 48" {...accent} />
          </>
        )}
        {scene === 'heart' && (
          <>
            <Path d="M60 62V38" {...stroke} />
            <Path d="M60 44c-2-8-8-10-14-10 0 8 6 12 14 12" {...accent} />
            <Path d="M60 38c2-8 8-10 14-10 0 8-6 12-14 12" {...accent} />
            <Path d="M40 66h40" {...stroke} opacity={0.5} />
          </>
        )}
        {scene === 'category' && (
          <>
            <Path d="M16 62h88" {...stroke} opacity={0.5} />
            <Circle cx={60} cy={44} r={14} {...accent} />
            <Circle cx={82} cy={26} r={2.5} fill={colors.textSecondary} stroke="none" />
            <Circle cx={34} cy={20} r={1.8} fill={colors.textSecondary} stroke="none" />
            <Circle cx={94} cy={40} r={1.5} fill={colors.textSecondary} stroke="none" />
          </>
        )}
      </Svg>
      </Animated.View>
      {title && (
        <AppText variant="display3" style={styles.center}>
          {title}
        </AppText>
      )}
      <AppText variant="secondary" tone="secondary" style={styles.center}>
        {body}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  center: { textAlign: 'center', maxWidth: 280 },
});
