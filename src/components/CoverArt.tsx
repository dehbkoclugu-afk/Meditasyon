import { View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { categoryColors, type CategoryId } from '@/design/tokens';
import { useTheme } from '@/design/theme';

// Kapak üreteci: seans id'sinden deterministik organik blob (DESIGN.md —
// fotoğraf yasak, kapaklar kategori renginden türetilmiş soyut illüstrasyon).
// Aynı id her zaman aynı kapağı üretir; asset dosyası gerekmez.

type Props = {
  seed: string;
  categoryId: CategoryId;
  height?: number;
};

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 8 noktalı yumuşak kapalı eğri (catmull-rom → bezier)
function blobPath(rand: () => number, cx: number, cy: number, r: number): string {
  const n = 8;
  const pts = Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2;
    const radius = r * (0.72 + rand() * 0.4);
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius] as const;
  });
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    if (i === 0) d += `M ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} `;
    d += `C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return d + 'Z';
}

const W = 320;
const H = 128;

export function CoverArt({ seed, categoryId, height = 96 }: Props) {
  const { colors } = useTheme();
  const color = categoryColors[categoryId];
  const rand = mulberry32(hashSeed(seed));
  const blob1 = blobPath(rand, W * (0.32 + rand() * 0.36), H * 0.55, 52);
  const blob2 = blobPath(rand, W * (0.45 + rand() * 0.3), H * (0.3 + rand() * 0.3), 30);
  const moonX = W * (0.15 + rand() * 0.7);

  return (
    <View style={{ height, overflow: 'hidden' }} accessibilityElementsHidden>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id={`glow-${seed}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={W} height={H} fill={`${color}1F`} />
        <Circle cx={moonX} cy={H * 0.4} r={64} fill={`url(#glow-${seed})`} />
        <Path d={blob1} fill={`${color}55`} />
        <Path d={blob2} fill={`${color}88`} />
        <Circle cx={moonX} cy={H * 0.4} r={7} fill={colors.textPrimary} opacity={0.85} />
      </Svg>
    </View>
  );
}
