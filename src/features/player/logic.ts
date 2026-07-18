import type { Catalog, Program } from '@/content/schema';

// Player'ın saf iş kuralları — hook'tan bağımsız, testli.

/** Tamamlanma eşiği: sürenin ≥%80'i dinlendiyse seans tamamlandı sayılır (PLAN.md §6.4). */
export function isSessionCompleted(positionSec: number, durationSec: number): boolean {
  if (durationSec <= 0) return false;
  return positionSec / durationSec >= 0.8;
}

/** Seans bir programın günüyse programı ve gün indeksini döndürür. */
export function findProgramDay(
  catalog: Catalog,
  sessionId: string,
): { program: Program; dayIndex: number } | null {
  for (const program of catalog.programs) {
    const dayIndex = program.days.indexOf(sessionId);
    if (dayIndex !== -1) return { program, dayIndex };
  }
  return null;
}

export type SleepTimerChoice = 5 | 10 | 20 | 45 | 'end' | null;

/** Uyku zamanlayıcısı için kalan süre (sn); 'end' seans sonunu kullanır. */
export function sleepTimerSeconds(
  choice: SleepTimerChoice,
  positionSec: number,
  durationSec: number,
): number | null {
  if (choice === null) return null;
  if (choice === 'end') return Math.max(0, durationSec - positionSec);
  return choice * 60;
}

/** Fade-out eğrisi: kalan adım sayısına göre lineer ses seviyesi (10 adım). */
export function fadeVolume(step: number, totalSteps: number): number {
  return Math.max(0, 1 - step / totalSteps);
}
