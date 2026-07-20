import type { Session } from './schema';

// "Yeni" işareti: yayın tarihinden itibaren 14 gün (PLAN §6.2 'Yeni eklenenler').

const FRESH_DAYS = 14;

export function isNewSession(session: Pick<Session, 'publishedAt'>, now: Date = new Date()): boolean {
  const published = new Date(`${session.publishedAt}T00:00:00`);
  const ageDays = (now.getTime() - published.getTime()) / 86400000;
  return ageDays >= 0 && ageDays <= FRESH_DAYS;
}

export function newestSessions(sessions: Session[], count: number): Session[] {
  return [...sessions]
    .filter((s) => s.type !== 'breathing')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.order - b.order)
    .slice(0, count);
}
