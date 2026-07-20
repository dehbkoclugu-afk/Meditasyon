import type { ColorValue } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

// Özel minimal ikon seti — 24 viewBox, 1.5 stroke, yuvarlak uçlar.
// Jenerik ikon kütüphanesi bilinçli olarak kullanılmıyor (DESIGN.md).

type IconProps = { color: ColorValue; size?: number };

const strokeProps = {
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

/** Bugün — ufukta güneş */
export function SunHorizonIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={3.5} y1={17} x2={20.5} y2={17} stroke={color} {...strokeProps} />
      <Path d="M7.5 17a4.5 4.5 0 0 1 9 0" stroke={color} {...strokeProps} />
      <Line x1={12} y1={9} x2={12} y2={6.8} stroke={color} {...strokeProps} />
      <Line x1={6.6} y1={11.4} x2={5.2} y2={10} stroke={color} {...strokeProps} />
      <Line x1={17.4} y1={11.4} x2={18.8} y2={10} stroke={color} {...strokeProps} />
    </Svg>
  );
}

/** Keşfet — pusula iğnesi */
export function CompassIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} stroke={color} {...strokeProps} />
      <Path d="M12 7.8 14 14l-2-1.2L10 14Z" stroke={color} {...strokeProps} />
    </Svg>
  );
}

/** Nefes — iç içe halkalar */
export function BreathIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} stroke={color} {...strokeProps} />
      <Circle cx={12} cy={12} r={4} stroke={color} opacity={0.55} {...strokeProps} />
    </Svg>
  );
}

/** Player — oynat */
export function PlayIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8.5 5.8v12.4L18.6 12Z" stroke={color} {...strokeProps} />
    </Svg>
  );
}

/** Player — duraklat */
export function PauseIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={9} y1={6} x2={9} y2={18} stroke={color} {...strokeProps} strokeWidth={2.2} />
      <Line x1={15} y1={6} x2={15} y2={18} stroke={color} {...strokeProps} strokeWidth={2.2} />
    </Svg>
  );
}

/** Player — 15 sn geri (saat yönü tersine ok) */
export function Back15Icon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5a7.5 7.5 0 1 1-7.3 5.6" stroke={color} {...strokeProps} />
      <Path d="M4.2 6.4v4.2h4.2" stroke={color} {...strokeProps} />
    </Svg>
  );
}

/** Player — 15 sn ileri (saat yönünde ok) */
export function Fwd15Icon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5a7.5 7.5 0 1 0 7.3 5.6" stroke={color} {...strokeProps} />
      <Path d="M19.8 6.4v4.2h-4.2" stroke={color} {...strokeProps} />
    </Svg>
  );
}

/** Favori — kalp */
export function HeartIcon({ color, size = 24, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 19.2C7.2 15.6 4.5 12.8 4.5 9.7a3.9 3.9 0 0 1 7-2.4L12 8l.5-.7a3.9 3.9 0 0 1 7 2.4c0 3.1-2.7 5.9-7.5 9.5Z"
        stroke={color}
        {...strokeProps}
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}

/** Uyku zamanlayıcısı — hilal */
export function MoonIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" stroke={color} {...strokeProps} />
    </Svg>
  );
}

/** Kapat — aşağı ok (modal kapatma) */
export function ChevronDownIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m6.5 9.8 5.5 5.4 5.5-5.4" stroke={color} {...strokeProps} />
    </Svg>
  );
}

/** Ambience — dalga çizgileri */
export function WavesIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 9c2 0 2.7-1.4 4-1.4S9.9 9 12 9s2.7-1.4 4-1.4S17.9 9 20 9" stroke={color} {...strokeProps} />
      <Path d="M4 15c2 0 2.7-1.4 4-1.4s1.9 1.4 4 1.4 2.7-1.4 4-1.4 1.9 1.4 4 1.4" stroke={color} {...strokeProps} />
    </Svg>
  );
}

/** Seri — alev */
export function FlameIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4.5c.6 2.4 2.2 3.7 3.6 5.2 1.3 1.4 2.2 2.9 2.2 4.8a5.8 5.8 0 0 1-11.6 0c0-2.4 1.4-3.9 2.5-5.5.9-1.3 1.3-2.1 1.1-3.6.9.5 1.7 1.3 2.2 2.3Z"
        stroke={color}
        {...strokeProps}
      />
    </Svg>
  );
}

/** Sen — filizlenen tohum */
export function SeedIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4.8C15.3 8 16.8 10.4 16.8 13.2a4.8 4.8 0 0 1-9.6 0C7.2 10.4 8.7 8 12 4.8Z"
        stroke={color}
        {...strokeProps}
      />
      <Line x1={12} y1={13} x2={12} y2={19.2} stroke={color} {...strokeProps} />
    </Svg>
  );
}
