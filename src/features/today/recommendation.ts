import type { ProgramProgress } from '@/stores/progress';
import type { Intent } from '@/stores/settings';
import type { Catalog, Program, Session } from '@/content/schema';
import { dayPartForHour, type DayPart } from '@/i18n/format';

// Bugün ekranının öneri kuralı (PLAN.md §6.2) — saf fonksiyon, testli:
// 1. Devam eden program varsa sıradaki gün önerilir.
// 2. Yoksa günün dilimi + onboarding niyetlerine göre puanlanan seans.
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

const CATEGORY_BY_INTENT: Partial<Record<Intent, string>> = {
  uyku: 'uyku',
  stres: 'stres-kaygi',
  odak: 'odak',
  // merak: tercih belirtmez
};

export function recommendForToday(
  catalog: Catalog,
  programs: Record<string, ProgramProgress>,
  hour: number,
  isPremium: boolean,
  intents: Intent[] = [],
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

  // 2. Puanlama: saat dilimi kategorisi +2, onboarding niyeti +1; en yüksek kazanır,
  // eşitlikte katalog sırası. Gece uykuyu, sabah niyetli kullanıcıda sabahı öne çıkarır.
  const daypartCategory = CATEGORY_BY_DAYPART[dayPartForHour(hour)];
  const intentCategories = new Set(
    intents.map((i) => CATEGORY_BY_INTENT[i]).filter((c): c is string => c != null),
  );
  const candidates = catalog.sessions
    .filter((s) => s.type !== 'breathing')
    .filter((s) => isPremium || s.access === 'free')
    .map((session) => {
      let score = 0;
      if (session.categories.includes(daypartCategory as Session['categories'][number])) score += 2;
      if (session.categories.some((c) => intentCategories.has(c))) score += 1;
      return { session, score };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || a.session.order - b.session.order)
    .map((c) => c.session);
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
