import type { BreathPhase } from '@/content/types';

// Seconds one step of a breath may take, so the exercise always stays a comfortable human breath:
// a slow inhale, an easy hold, a longer exhale. content.json cannot ask for more (or less) than this.
export const LIMITS: Record<BreathPhase['motion'], readonly [number, number]> = {
  grow: [2, 7],
  hold: [1, 7],
  shrink: [2, 10],
};

// content.json is hand-edited: keep only phases with a positive number of seconds.
export const valid = (phases: BreathPhase[]) =>
  (phases ?? []).filter((p) => typeof p.seconds === 'number' && p.seconds > 0);

// Valid phases with whole seconds inside the human limits.
export const safePhases = (phases: BreathPhase[]): BreathPhase[] =>
  valid(phases).map((p) => {
    const [min, max] = LIMITS[p.motion] ?? LIMITS.hold;
    return { ...p, seconds: Math.min(max, Math.max(min, Math.round(p.seconds))) };
  });

export const cycleCount = (cycles: number) => (Number.isFinite(cycles) ? Math.max(0, Math.floor(cycles)) : 0);

// One full breath (in, hold, out), in seconds.
export const cycleSeconds = (phases: BreathPhase[]) => safePhases(phases).reduce((sum, p) => sum + p.seconds, 0);

// A longer session repeats the breath; it never stretches it. Whole breaths closest to the length, at least one.
export function cyclesFor(phases: BreathPhase[], minutes: number): number {
  const breath = cycleSeconds(phases);
  if (!breath || !Number.isFinite(minutes) || minutes <= 0) return 1;
  return Math.max(1, Math.round((minutes * 60) / breath));
}

export function totalSeconds(phases: BreathPhase[], cycles: number): number {
  return cycleSeconds(phases) * cycleCount(cycles);
}

// Where the exercise is after `elapsed` whole seconds; null once it is done.
// `index` counts phases across cycles, so it changes on every new phase.
export function stepAt(phases: BreathPhase[], cycles: number, elapsed: number) {
  const list = safePhases(phases);
  let t = elapsed;
  for (let index = 0; index < list.length * cycleCount(cycles); index++) {
    const phase = list[index % list.length];
    if (t < phase.seconds) return { index, phase, secondsLeft: phase.seconds - t };
    t -= phase.seconds;
  }
  return null;
}
