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
