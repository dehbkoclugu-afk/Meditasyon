import { dayPartForHour, durationLabel, lowerTr, normalizeSearch, upperTr } from './format';

describe('Türkçe büyük/küçük harf', () => {
  it('i → İ (noktalı), ı → I (noktasız)', () => {
    expect(upperTr('iğdır')).toBe('İĞDIR');
    expect(upperTr('ışık')).toBe('IŞIK');
  });

  it('İ → i, I → ı', () => {
    expect(lowerTr('İSTANBUL')).toBe('istanbul');
    expect(lowerTr('IŞIK')).toBe('ışık');
  });
});

describe('normalizeSearch', () => {
  it('diakritikleri katlar: Şükran ↔ sukran', () => {
    expect(normalizeSearch('Şükran')).toBe('sukran');
    expect(normalizeSearch('IŞIK')).toBe('isik');
    expect(normalizeSearch('Uykuya Yumuşak Geçiş')).toBe('uykuya yumusak gecis');
  });
});

describe('dayPartForHour', () => {
  it('saat dilimlerini doğru ayırır', () => {
    expect(dayPartForHour(7)).toBe('sabah');
    expect(dayPartForHour(13)).toBe('gunduz');
    expect(dayPartForHour(19)).toBe('aksam');
    expect(dayPartForHour(23)).toBe('gece');
    expect(dayPartForHour(3)).toBe('gece');
  });
});

describe('durationLabel', () => {
  it('saniyeyi dakikaya yuvarlar', () => {
    expect(durationLabel(900, 'tr')).toBe('15 dk');
    expect(durationLabel(900, 'en')).toBe('15 min');
    expect(durationLabel(869, 'tr')).toBe('14 dk');
  });

  it('1 dakikanın altını 1 dk yapar', () => {
    expect(durationLabel(20, 'tr')).toBe('1 dk');
  });
});
