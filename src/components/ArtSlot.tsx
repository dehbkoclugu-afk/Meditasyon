import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { artRegistry, artSpecs, type AssetId } from '@/content/art-registry';
import { space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

type Props = {
  id: AssetId;
  height: number;
  /** cover: çerçeveyi doldurur (hero); contain: spot sanatı ortalar */
  fit?: 'cover' | 'contain';
  radius?: number;
  style?: ViewStyle;
  /**
   * Kayıtlı PNG yokken gösterilecek mevcut görsel (generative SVG, BreathRing,
   * CoverArt…). Verilirse etiketli placeholder yerine bu render edilir; böylece
   * ArtSlot'a geçmek regresyon yaratmaz — PNG düşünce otomatik yükseltir.
   */
  fallback?: ReactNode;
  /** Sanatın/fallback'in üzerine binen içerik (scrim, metin). */
  children?: ReactNode;
};

/**
 * Sanat yuvası: `artRegistry`'de kayıtlı bitmiş görsel varsa onu basar; yoksa
 * `fallback` (mevcut generative görsel) ya da yerleşimi kesinleştiren zarif
 * etiketli bir placeholder gösterir. Bkz. docs/asset-briefs.md.
 */
export function ArtSlot({ id, height, fit = 'cover', radius = 0, style, fallback, children }: Props) {
  const { colors } = useTheme();
  const source = artRegistry[id];
  const spec = artSpecs[id];

  return (
    <View style={[{ height, borderRadius: radius, overflow: 'hidden' }, style]}>
      {source ? (
        <Image
          source={source}
          resizeMode={fit}
          style={StyleSheet.absoluteFill}
          accessibilityIgnoresInvertColors
        />
      ) : fallback ? (
        <View style={StyleSheet.absoluteFill}>{fallback}</View>
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.placeholder,
            { backgroundColor: colors.surface, borderColor: colors.accent, borderRadius: radius },
          ]}
        >
          <AppText variant="caption" style={{ color: colors.accent, letterSpacing: 1 }}>
            {id}
          </AppText>
          <AppText variant="caption" tone="secondary">
            {spec.label} · {spec.size}
          </AppText>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    opacity: 0.9,
    padding: space.sm,
  },
});
