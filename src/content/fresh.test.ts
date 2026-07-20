import { isNewSession, newestSessions } from './fresh';
import { dailyQuote } from './quotes';
import { catalog } from './catalog';

describe('isNewSession', () => {
  it('14 gün içinde yeni, sonra değil', () => {
    const s = { publishedAt: '2026-07-10' };
    expect(isNewSession(s, new Date('2026-07-20T12:00:00'))).toBe(true);
    expect(isNewSession(s, new Date('2026-07-25T12:00:00'))).toBe(false);
  });
});

describe('newestSessions', () => {
  it('nefes hariç, tarihe göre sıralar', () => {
    const top = newestSessions(catalog.sessions, 4);
    expect(top).toHaveLength(4);
    for (const s of top) expect(s.type).not.toBe('breathing');
  });
});

describe('dailyQuote', () => {
  it('aynı gün aynı söz, deterministik', () => {
    expect(dailyQuote('2026-07-20')).toBe(dailyQuote('2026-07-20'));
    expect(dailyQuote('2026-07-20').tr.length).toBeGreaterThan(0);
  });
});
