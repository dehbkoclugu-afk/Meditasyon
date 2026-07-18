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
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
});
