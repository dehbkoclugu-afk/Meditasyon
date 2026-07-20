import type { TextStyle } from 'react-native';

import { fonts, type } from './tokens';

export type TextVariant = keyof typeof textVariants;

export const textVariants = {
  display1: {
    fontFamily: fonts.display,
    fontSize: type.size.display1,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  display2: {
    fontFamily: fonts.display,
    fontSize: type.size.display2,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  display3: {
    fontFamily: fonts.display,
    fontSize: type.size.display3,
    lineHeight: 28,
    letterSpacing: -0.3,
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
  // Alıntı ve niyet metinleri: italik Fraunces — insani, el yazısına yakın his.
  quote: {
    fontFamily: fonts.displayItalic,
    fontSize: type.size.display3,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  // Selamlama alt satırı gibi kısa italik vurgular.
  quoteSmall: {
    fontFamily: fonts.displayItalic,
    fontSize: type.size.body,
    lineHeight: 24,
  },
  // Süre ve istatistik rakamları: tabular, hizalı — display font değil.
  numeral: {
    fontFamily: fonts.bodyBold,
    fontSize: type.size.display2,
    lineHeight: 34,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;
