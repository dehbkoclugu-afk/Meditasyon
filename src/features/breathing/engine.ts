import type { BreathPattern } from '@/content/schema';

// Nefes egzersizi faz motoru — saf, testli. Animasyon ve haptik bunu izler.

export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'holdEmpty';

export const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: 'Nefes al',
  hold: 'Tut',
  exhale: 'Ver',
  holdEmpty: 'Bekle',
};

export function cycleSeconds(pattern: BreathPattern): number {
  return pattern.inhale + pattern.hold + pattern.exhale + pattern.holdEmpty;
}

export function totalSeconds(pattern: BreathPattern, cycles: number): number {
  return cycleSeconds(pattern) * cycles;
}

/** Toplam süreden döngü sayısı türetir (1/3/5 dk seçimleri için, en az 1). */
export function cyclesForDuration(pattern: BreathPattern, durationSec: number): number {
  return Math.max(1, Math.round(durationSec / cycleSeconds(pattern)));
}

export type PhaseState = {
  phase: BreathPhase;
  phaseElapsed: number;
  phaseDuration: number;
  cycleIndex: number; // 0 tabanlı
  done: boolean;
};

export function phaseAt(pattern: BreathPattern, cycles: number, elapsedSec: number): PhaseState {
  const cycle = cycleSeconds(pattern);
  if (elapsedSec >= cycle * cycles) {
    return { phase: 'exhale', phaseElapsed: 0, phaseDuration: pattern.exhale, cycleIndex: cycles - 1, done: true };
  }
  const cycleIndex = Math.floor(elapsedSec / cycle);
  let t = elapsedSec - cycleIndex * cycle;

  const phases: [BreathPhase, number][] = [
    ['inhale', pattern.inhale],
    ['hold', pattern.hold],
    ['exhale', pattern.exhale],
    ['holdEmpty', pattern.holdEmpty],
  ];
  for (const [phase, duration] of phases) {
    if (duration > 0 && t < duration) {
      return { phase, phaseElapsed: t, phaseDuration: duration, cycleIndex, done: false };
    }
    t -= duration;
  }
  // kayan nokta artığı: döngü sonu = son faz sonu
  return { phase: 'holdEmpty', phaseElapsed: 0, phaseDuration: pattern.holdEmpty || 1, cycleIndex, done: false };
}
