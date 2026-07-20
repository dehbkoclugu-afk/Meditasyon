import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';
import { useStats } from '@/stores/stats';

// Veri dışa/içe aktarma: hesap yok — cihaz değişiminde tek taşıma yolu bu.
// Dosya: sakin-yedek-YYYY-MM-DD.json (paylaşım sayfasıyla kaydedilir).

const FORMAT = 'sakin-backup';
const VERSION = 1;

type Backup = {
  format: typeof FORMAT;
  version: number;
  exportedAt: string;
  progress: unknown;
  stats: unknown;
  settings: unknown;
};

export function buildBackup(): Backup {
  const { sessions, programs, favorites } = useProgress.getState();
  const { totalMinutes, totalSessions, streak, activeDays } = useStats.getState();
  const s = useSettings.getState();
  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    progress: { sessions, programs, favorites },
    stats: { totalMinutes, totalSessions, streak, activeDays },
    settings: {
      intents: s.intents,
      themeMode: s.themeMode,
      language: s.language,
      reminder: s.reminder,
      hapticsEnabled: s.hapticsEnabled,
      bellEnabled: s.bellEnabled,
      ambience: s.ambience,
    },
  };
}

/** Yedeği doğrular ve store'lara uygular; geçersizse false döner. */
export function applyBackup(raw: string): boolean {
  let data: Backup;
  try {
    data = JSON.parse(raw);
  } catch {
    return false;
  }
  if (data?.format !== FORMAT || typeof data.version !== 'number') return false;

  const progress = data.progress as ReturnType<typeof buildBackup>['progress'] as {
    sessions?: unknown;
    programs?: unknown;
    favorites?: unknown;
  };
  if (progress && typeof progress === 'object') {
    useProgress.setState({
      sessions: (progress.sessions as never) ?? {},
      programs: (progress.programs as never) ?? {},
      favorites: Array.isArray(progress.favorites) ? (progress.favorites as string[]) : [],
    });
  }
  const stats = data.stats as {
    totalMinutes?: number;
    totalSessions?: number;
    streak?: never;
    activeDays?: string[];
  };
  if (stats && typeof stats === 'object') {
    useStats.setState({
      totalMinutes: stats.totalMinutes ?? 0,
      totalSessions: stats.totalSessions ?? 0,
      streak: stats.streak ?? { current: 0, best: 0, lastActiveDate: null },
      activeDays: stats.activeDays ?? [],
    });
  }
  const settings = data.settings as Partial<ReturnType<typeof useSettings.getState>>;
  if (settings && typeof settings === 'object') {
    useSettings.setState({
      intents: settings.intents ?? [],
      themeMode: settings.themeMode ?? 'system',
      language: settings.language ?? 'system',
      reminder: settings.reminder ?? { enabled: false, hour: 9, minute: 0 },
      hapticsEnabled: settings.hapticsEnabled ?? true,
      bellEnabled: settings.bellEnabled ?? true,
      ambience: settings.ambience ?? { ids: [], volume: 0.7 },
    });
  }
  return true;
}

export async function exportBackup(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const date = new Date().toISOString().slice(0, 10);
    const file = new File(Paths.cache, `sakin-yedek-${date}.json`);
    file.write(JSON.stringify(buildBackup(), null, 2));
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
    return true;
  } catch {
    return false;
  }
}

export async function importBackup(): Promise<'ok' | 'cancelled' | 'invalid'> {
  if (Platform.OS === 'web') return 'invalid';
  const picked = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (picked.canceled || !picked.assets[0]) return 'cancelled';
  try {
    const raw = await new File(picked.assets[0].uri).text();
    return applyBackup(raw) ? 'ok' : 'invalid';
  } catch {
    return 'invalid';
  }
}
