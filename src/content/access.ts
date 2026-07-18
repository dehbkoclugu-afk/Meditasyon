import type { Program, Session } from './schema';

// Erişim kuralları tek yerde (PLAN.md §7):
// ücretsiz içerik herkese, premium içerik aboneye,
// premium programın 1. günü herkese ("tadına bak" kuralı).

export function canAccessSession(session: Pick<Session, 'access'>, isPremium: boolean): boolean {
  return session.access === 'free' || isPremium;
}

export function canAccessProgramDay(
  program: Pick<Program, 'access'>,
  dayIndex: number,
  isPremium: boolean,
): boolean {
  if (program.access === 'free' || isPremium) return true;
  return dayIndex === 0;
}
