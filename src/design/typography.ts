import type { TextStyle } from 'react-native';

import { fonts, type } from './tokens';

export type TextVariant = keyof typeof textVariants;

export const textVariants = {
  display1: {
    fontFamily: fonts.display,
    fontSize: type.size.display1,
    lineHeight: 40,
  },
  display2: {
    fontFamily: fonts.display,
    fontSize: type.size.display2,
    lineHeight: 34,
  },
  display3: {
    fontFamily: fonts.display,
    fontSize: type.size.display3,
    lineHeight: 28,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: type.size.body,
    lineHeight: Math.round(type.size.body * type.bodyLineHeight),
  },
  bodyMedium: {
    fontFamily: fonts.bodyMedium,
    fontSize: type.size.body,
    lineHeight: Math.round(type.size.body * type.bodyLineHeight),
  },
  secondary: {
    fontFamily: fonts.body,
    fontSize: type.size.secondary,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fonts.bodyMedium,
    fontSize: type.size.caption,
    lineHeight: 18,
  },
  // Süre ve istatistik rakamları: tabular, hizalı — display font değil.
  numeral: {
    fontFamily: fonts.bodyBold,
    fontSize: type.size.display2,
    lineHeight: 34,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;
