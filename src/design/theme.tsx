import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { palette, type ThemeColors } from './tokens';

export type ThemeMode = 'dark' | 'light' | 'system';

type Theme = { colors: ThemeColors; isDark: boolean };

const ThemeContext = createContext<Theme>({ colors: palette.dark, isDark: true });

// mode: kullanıcı ayarı (M6'da settings store'dan gelecek); 'system' cihazı izler.
export function ThemeProvider({ children, mode = 'system' }: { children: ReactNode; mode?: ThemeMode }) {
  const systemScheme = useColorScheme();
  const isDark = mode === 'system' ? systemScheme !== 'light' : mode === 'dark';
  const value: Theme = { colors: isDark ? palette.dark : palette.light, isDark };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
