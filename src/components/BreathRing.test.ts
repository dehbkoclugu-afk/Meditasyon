import { breathAnimationMode } from './BreathRing';

describe('BreathRing reduced-motion', () => {
  it('hareket azaltma açıkken opaklıkla nefes alır (DESIGN.md)', () => {
    expect(breathAnimationMode(true)).toBe('opacity');
  });

  it('normalde ölçekle nefes alır', () => {
    expect(breathAnimationMode(false)).toBe('scale');
  });
});
