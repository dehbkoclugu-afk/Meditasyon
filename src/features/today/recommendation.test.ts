import { recommendForToday } from './recommendation';
import { catalog } from '@/content/catalog';

describe('recommendForToday', () => {
  it('hiç başlamamış kullanıcıyı Başlangıç programına davet eder', () => {
    const rec = recommendForToday(catalog, {}, 9, false);
    expect(rec.kind).toBe('program-start');
    if (rec.kind === 'program-start') {
      expect(rec.program.id).toBe('baslangic');
      expect(rec.session.id).toBe('baslangic-gun-1');
    }
  });

  it('devam eden programda sıradaki günü önerir', () => {
    const rec = recommendForToday(
      catalog,
      { baslangic: { unlockedDay: 2, completedDays: [0, 1] } },
      9,
      false,
    );
    expect(rec.kind).toBe('program-day');
    if (rec.kind === 'program-day') {
      expect(rec.dayIndex).toBe(2);
      expect(rec.session.id).toBe('baslangic-gun-3');
    }
  });

  it('program bitince saat dilimine göre seans önerir (gece → uyku)', () => {
    const done = { baslangic: { unlockedDay: 7, completedDays: [0, 1, 2, 3, 4, 5, 6] } };
    const rec = recommendForToday(catalog, done, 23, false);
    expect(rec.kind).toBe('session');
    if (rec.kind === 'session') {
      expect(rec.session.categories).toContain('uyku');
      expect(rec.session.access).toBe('free');
    }
  });

  it('sabah saatinde sabah kategorisinden önerir', () => {
    const done = { baslangic: { unlockedDay: 7, completedDays: [0, 1, 2, 3, 4, 5, 6] } };
    const rec = recommendForToday(catalog, done, 7, false);
    if (rec.kind === 'session') {
      expect(rec.session.categories).toContain('sabah');
    }
  });

  it('premium kullanıcıya premium içerik de önerilebilir', () => {
    const done = { baslangic: { unlockedDay: 7, completedDays: [0, 1, 2, 3, 4, 5, 6] } };
    const rec = recommendForToday(catalog, done, 13, true);
    expect(rec.kind).toBe('session');
  });
});
