import { catalog, programDaySessions, programsById, sessionsById } from './catalog';
import { categoryColors } from '@/design/tokens';

describe('katalog bütünlüğü', () => {
  it('şemadan geçer ve id çakışması yoktur', () => {
    const ids = catalog.sessions.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('her kategorinin token rengi vardır', () => {
    for (const category of catalog.categories) {
      expect(categoryColors).toHaveProperty(category.id);
    }
  });

  it('program günleri var olan seanslara işaret eder', () => {
    for (const program of programsById.values()) {
      expect(programDaySessions(program)).toHaveLength(program.days.length);
    }
  });

  it('her kategoride en az bir ücretsiz sesli seans vardır (vitrin kuralı)', () => {
    for (const category of catalog.categories) {
      const free = catalog.sessions.filter(
        (s) => s.categories.includes(category.id) && s.access === 'free',
      );
      expect(free.length).toBeGreaterThan(0);
    }
  });

  it('başlangıç programı tamamen ücretsizdir', () => {
    const program = programsById.get('baslangic');
    expect(program?.access).toBe('free');
    for (const session of programDaySessions(program!)) {
      expect(session.access).toBe('free');
    }
  });

  it('nefes seansları pattern tanımlar', () => {
    for (const s of catalog.sessions.filter((s) => s.type === 'breathing')) {
      expect(s.pattern).toBeDefined();
      expect(sessionsById.get(s.id)).toBe(s);
    }
  });
});
