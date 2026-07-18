import { cycleSeconds, cyclesForDuration, phaseAt, totalSeconds } from './engine';

const box = { inhale: 4, hold: 4, exhale: 4, holdEmpty: 4, cycles: 10 };
const calm = { inhale: 4, hold: 0, exhale: 6, holdEmpty: 0, cycles: 10 };

describe('cycleSeconds / totalSeconds / cyclesForDuration', () => {
  it('temel hesaplar', () => {
    expect(cycleSeconds(box)).toBe(16);
    expect(totalSeconds(box, 10)).toBe(160);
    expect(cyclesForDuration(box, 60)).toBe(4);
    expect(cyclesForDuration(calm, 60)).toBe(6);
    expect(cyclesForDuration(box, 3)).toBe(1);
  });
});

describe('phaseAt', () => {
  it('kutu nefesinde fazları doğru gezer', () => {
    expect(phaseAt(box, 2, 0).phase).toBe('inhale');
    expect(phaseAt(box, 2, 5).phase).toBe('hold');
    expect(phaseAt(box, 2, 9).phase).toBe('exhale');
    expect(phaseAt(box, 2, 13).phase).toBe('holdEmpty');
    expect(phaseAt(box, 2, 17).phase).toBe('inhale');
    expect(phaseAt(box, 2, 17).cycleIndex).toBe(1);
  });

  it('sıfır süreli fazları atlar (4-0-6-0)', () => {
    expect(phaseAt(calm, 2, 4.5).phase).toBe('exhale');
    expect(phaseAt(calm, 2, 10.1).phase).toBe('inhale');
  });

  it('süre dolunca done', () => {
    const end = phaseAt(box, 2, 32);
    expect(end.done).toBe(true);
  });
});
