import type { ProgramProgress } from '@/stores/progress';
import type { Catalog, Program, Session } from '@/content/schema';
import { dayPartForHour, type DayPart } from '@/i18n/format';

// Bugün ekranının öneri kuralı (PLAN.md §6.2) — saf fonksiyon, testli:
// 1. Devam eden program varsa sıradaki gün önerilir.
// 2. Yoksa günün dilimine uyan kategoriden erişilebilir bir seans.
// 3. Program hiç başlamadıysa hero programa davet eder.

export type Recommendation =
  | { kind: 'program-day'; program: Program; dayIndex: number; session: Session }
  | { kind: 'program-start'; program: Program; session: Session }
  | { kind: 'session'; session: Session };

const CATEGORY_BY_DAYPART: Record<DayPart, string> = {
  sabah: 'sabah',
  gunduz: 'odak',
  aksam: 'stres-kaygi',
  gece: 'uyku',
};

export function recommendForToday(
  catalog: Catalog,
  programs: Record<string, ProgramProgress>,
  hour: number,
  isPremium: boolean,
): Recommendation {
  // 1. Devam eden program (başlanmış, bitmemiş)
  for (const program of catalog.programs) {
    const progress = programs[program.id];
    if (!progress) continue;
    if (progress.completedDays.length >= program.days.length) continue;
    const dayIndex = Math.min(progress.unlockedDay, program.days.length - 1);
    const session = catalog.sessions.find((s) => s.id === program.days[dayIndex]);
    if (session) return { kind: 'program-day', program, dayIndex, session };
  }

  // 2. Saat dilimine uyan seans (erişilebilir olanlardan, sıraya göre ilk)
  const categoryId = CATEGORY_BY_DAYPART[dayPartForHour(hour)];
  const candidates = catalog.sessions
    .filter((s) => s.type !== 'breathing' && s.categories.includes(categoryId as Session['categories'][number]))
    .filter((s) => isPremium || s.access === 'free')
    .sort((a, b) => a.order - b.order);
  if (candidates.length > 0 && hasAnyProgress(programs, catalog)) {
    return { kind: 'session', session: candidates[0] };
  }

  // 3. Hiç başlamamış kullanıcı: Başlangıç programına davet
  const program = catalog.programs[0];
  const first = catalog.sessions.find((s) => s.id === program.days[0]);
  if (first) return { kind: 'program-start', program, session: first };

  // Katalog garantisi (program günleri doğrulanıyor) gereği buraya düşülmez;
  // yine de tip güvenliği için ilk seansa düş.
  return { kind: 'session', session: candidates[0] ?? catalog.sessions[0] };
}

function hasAnyProgress(programs: Record<string, ProgramProgress>, catalog: Catalog): boolean {
  return catalog.programs.some((p) => programs[p.id] !== undefined);
}
