// Streak kuralları (PLAN.md §4.3): günde ≥1 tamamlanan seans seriyi sürdürür.
// Gün sınırı cihazın yerel saatine göre. Saf fonksiyonlar — testli.

export type Streak = {
  current: number;
  best: number;
  lastActiveDate: string | null; // "2026-07-18" (yerel gün)
};

export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dayDiff(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T12:00:00`); // öğlen: DST kaymalarına dayanıklı
  const to = new Date(`${toKey}T12:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

/** Bugün bir seans tamamlanınca yeni streak durumunu döndürür. */
export function advanceStreak(streak: Streak, today: string): Streak {
  if (streak.lastActiveDate === today) return streak; // aynı gün ikinci seans: değişmez
  const diff = streak.lastActiveDate === null ? Infinity : dayDiff(streak.lastActiveDate, today);
  const current = diff === 1 ? streak.current + 1 : 1;
  return { current, best: Math.max(streak.best, current), lastActiveDate: today };
}

/** Görüntüleme anında: dün ve bugün seans yoksa seri kırılmıştır (0 göster). */
export function effectiveStreak(streak: Streak, today: string): number {
  if (streak.lastActiveDate === null) return 0;
  const diff = dayDiff(streak.lastActiveDate, today);
  return diff <= 1 ? streak.current : 0;
}
