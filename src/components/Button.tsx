import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

type Variant = 'primary' | 'ghost' | 'text';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

const MIN_TARGET = 44;

export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const { colors } = useTheme();

  const base: ViewStyle = {
    minHeight: variant === 'text' ? MIN_TARGET : 52,
    minWidth: MIN_TARGET,
    borderRadius: radius.pill,
    paddingHorizontal: variant === 'text' ? space.xs : space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const byVariant: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: colors.accent },
    ghost: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    text: {},
  };
  const pressedByVariant: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: colors.accentPressed }, // opaklık değil, gerçek ton
    ghost: { backgroundColor: colors.surfaceHigh },
    text: { opacity: 0.7 },
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        base,
        byVariant[variant],
        pressed && pressedByVariant[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.bg : colors.textPrimary} />
      ) : (
        <AppText
          variant="bodyMedium"
          tone={variant === 'primary' ? 'inverse' : 'primary'}
          style={variant === 'text' ? { color: colors.accent } : undefined}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
});
