import type { BreathPhase } from '@/content/types';

// content.json is hand-edited: keep only phases with a positive number of seconds.
const valid = (phases: BreathPhase[]) =>
  (phases ?? []).filter((p) => typeof p.seconds === 'number' && p.seconds > 0);

const cycleCount = (cycles: number) => (Number.isFinite(cycles) ? Math.max(0, Math.floor(cycles)) : 0);

export function totalSeconds(phases: BreathPhase[], cycles: number): number {
  return valid(phases).reduce((sum, p) => sum + p.seconds, 0) * cycleCount(cycles);
}

// Where the exercise is after `elapsed` whole seconds; null once it is done.
// `index` counts phases across cycles, so it changes on every new phase.
export function stepAt(phases: BreathPhase[], cycles: number, elapsed: number) {
  const list = valid(phases);
  let t = elapsed;
  for (let index = 0; index < list.length * cycleCount(cycles); index++) {
    const phase = list[index % list.length];
    if (t < phase.seconds) return { index, phase, secondsLeft: phase.seconds - t };
    t -= phase.seconds;
  }
  return null;
}
