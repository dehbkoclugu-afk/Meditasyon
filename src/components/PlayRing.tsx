import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/design/theme';

// Dairesel ilerleme halkası — player'da kapağın etrafını sarar.
type Props = {
  progress: number; // 0–1
  size: number;
  strokeWidth?: number;
  children?: React.ReactNode;
};

export function PlayRing({ progress, size, strokeWidth = 3, children }: Props) {
  const { colors } = useTheme();
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
        />
      </Svg>
      {children}
    </View>
  );
}
