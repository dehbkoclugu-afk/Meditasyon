import { durationLabel, lowerTr, upperTr } from './format';

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
