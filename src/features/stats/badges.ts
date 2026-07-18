// Rozetler — sade, çocuksu değil (PRODUCT.md). Saf türetme, kayıt tutulmaz.

export type Badge = { id: string; title: string; earned: boolean };

type BadgeInput = {
  totalMinutes: number;
  totalSessions: number;
  bestStreak: number;
  completedProgramCount: number;
};

export function computeBadges(input: BadgeInput): Badge[] {
  return [
    { id: 'ilk-adim', title: 'İlk seans', earned: input.totalSessions >= 1 },
    { id: 'yedi-gun', title: '7 gün üst üste', earned: input.bestStreak >= 7 },
    { id: 'ilk-program', title: 'İlk program bitti', earned: input.completedProgramCount >= 1 },
    { id: 'yuz-dakika', title: '100 dakika', earned: input.totalMinutes >= 100 },
    { id: 'otuz-seans', title: '30 seans', earned: input.totalSessions >= 30 },
    { id: 'otuz-gun', title: '30 gün üst üste', earned: input.bestStreak >= 30 },
  ];
}
