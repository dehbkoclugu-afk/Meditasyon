import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/design/theme';
import { textVariants, type TextVariant } from '@/design/typography';

type Tone = 'primary' | 'secondary' | 'accent' | 'danger' | 'inverse';

type Props = TextProps & {
  variant?: TextVariant;
  tone?: Tone;
  color?: string; // tone'un karşılamadığı özel durumlar (örn. kategori rengi)
};

export function AppText({ variant = 'body', tone = 'primary', color, style, ...rest }: Props) {
  const { colors } = useTheme();
  const toneColor = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    accent: colors.accent,
    danger: colors.danger,
    inverse: colors.bg,
  }[tone];
  return <Text {...rest} style={[textVariants[variant], { color: color ?? toneColor }, style]} />;
}
