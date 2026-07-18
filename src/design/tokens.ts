// Tasarım token'ları — tek doğruluk kaynağı. DESIGN.md bu değerlerin
// insan-okur dokümantasyonudur; biri değişirse ikisi birlikte güncellenir.

export const palette = {
  dark: {
    bg: '#0D1412',
    surface: '#152019',
    surfaceHigh: '#1D2B22',
    border: '#FFFFFF0A',
    textPrimary: '#F1EDE4',
    textSecondary: '#A8B3A6',
    accent: '#E4B75D',
    accentSoft: '#E4B75D22',
    success: '#8FBF9F',
    danger: '#D98E7A',
  },
  light: {
    bg: '#F5F1E8',
    surface: '#FFFFFF',
    surfaceHigh: '#FFFFFF',
    border: '#0000000F',
    textPrimary: '#26302A',
    textSecondary: '#5E6A60',
    accent: '#C99A3B',
    accentSoft: '#C99A3B22',
    success: '#4E8A63',
    danger: '#B5654C',
  },
} as const;

export const categoryColors = {
  uyku: '#7C8FC9',
  odak: '#C9A96B',
  nefes: '#86B8A8',
  'stres-kaygi': '#B98FA6',
  sabah: '#D9B98A',
  'beden-taramasi': '#9FB08A',
  sukran: '#D0A98F',
  'oz-sefkat': '#C39BB4',
} as const;

export const type = {
  display: 'Fraunces',
  body: 'AlbertSans',
  size: { display1: 34, display2: 28, display3: 22, body: 17, secondary: 15, caption: 13 },
  bodyLineHeight: 1.5,
} as const;

export const space = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenMargin: 24,
} as const;

export const radius = {
  card: 20,
  pill: 999,
  playerArt: 28,
} as const;

export const motion = {
  // 300–600 ms, yumuşak; bounce/elastic yasak (DESIGN.md)
  fast: 300,
  slow: 600,
  easing: [0.4, 0, 0.2, 1] as const,
  breathCycleMs: 4000,
} as const;

export type ThemeColors = (typeof palette)['dark'];
export type CategoryId = keyof typeof categoryColors;
