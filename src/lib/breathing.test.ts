import type { BreathPhase } from '@/content/types';
import { content } from '@/content/types';
import { cycleSeconds, cyclesFor, LIMITS, safePhases, stepAt, totalSeconds } from './breathing';

const { phases } = content.breathing;
const oneMinute = cyclesFor(phases, 1);

test('the shipped breath is 4 in, 4 hold, 6 out: one breath every 14 seconds', () => {
  expect(cycleSeconds(phases)).toBe(14);
});

describe('session length changes how many breaths, never how long one breath is', () => {
  test.each([
    [1, 4, 56],
    [2, 9, 126],
    [3, 13, 182],
  ])('%i min: %i whole breaths (%i s)', (minutes, breaths, total) => {
    expect(cyclesFor(phases, minutes)).toBe(breaths);
    expect(totalSeconds(phases, breaths)).toBe(total);
  });

  test('every breath is the same length whatever the session length', () => {
    for (const minutes of [1, 2, 3]) {
      const cycles = cyclesFor(phases, minutes);
      expect(stepAt(phases, cycles, 14 * (cycles - 1))).toEqual({ index: 3 * (cycles - 1), phase: phases[0], secondsLeft: 4 });
    }
  });

  test('always at least one breath, even for odd lengths', () => {
    expect(cyclesFor(phases, 0)).toBe(1);
    expect(cyclesFor(phases, -2)).toBe(1);
    expect(cyclesFor(phases, NaN)).toBe(1);
  });
});

describe('a breath step never goes beyond what is comfortable', () => {
  test('content asking for too long an inhale, hold or exhale is capped', () => {
    const tooLong = [
      { label: 'In', seconds: 20, motion: 'grow' },
      { label: 'Hold', seconds: 30, motion: 'hold' },
      { label: 'Out', seconds: 40, motion: 'shrink' },
    ] as BreathPhase[];
    expect(safePhases(tooLong).map((p) => p.seconds)).toEqual([LIMITS.grow[1], LIMITS.hold[1], LIMITS.shrink[1]]);
  });

  test('too short an inhale or exhale is raised to the minimum', () => {
    const tooShort = [
      { label: 'In', seconds: 0.5, motion: 'grow' },
      { label: 'Out', seconds: 1, motion: 'shrink' },
    ] as BreathPhase[];
    expect(safePhases(tooShort).map((p) => p.seconds)).toEqual([LIMITS.grow[0], LIMITS.shrink[0]]);
  });

  test('the limits themselves stay within a calm human breath', () => {
    expect(LIMITS.grow[1]).toBeLessThanOrEqual(8);
    expect(LIMITS.hold[1]).toBeLessThanOrEqual(8);
    expect(LIMITS.shrink[1]).toBeLessThanOrEqual(10);
  });
});

test('phases come in order with a counting-down number', () => {
  expect(stepAt(phases, oneMinute, 0)).toEqual({ index: 0, phase: phases[0], secondsLeft: 4 });
  expect(stepAt(phases, oneMinute, 3)).toEqual({ index: 0, phase: phases[0], secondsLeft: 1 });
  expect(stepAt(phases, oneMinute, 4)).toEqual({ index: 1, phase: phases[1], secondsLeft: 4 });
  expect(stepAt(phases, oneMinute, 8)).toEqual({ index: 2, phase: phases[2], secondsLeft: 6 });
  expect(stepAt(phases, oneMinute, 14)).toEqual({ index: 3, phase: phases[0], secondsLeft: 4 }); // breath 2
});

test('after the last second the exercise is done', () => {
  expect(stepAt(phases, oneMinute, 55)?.secondsLeft).toBe(1);
  expect(stepAt(phases, oneMinute, 56)).toBeNull();
});

// content.json is hand-edited, so bad timings must never hang the screen.
test('phases with 0, negative or missing seconds are skipped; nothing valid means done at once', () => {
  const odd = [
    { label: 'A', seconds: 0, motion: 'grow' },
    { label: 'B', seconds: 3, motion: 'hold' },
    { label: 'C', seconds: -2, motion: 'shrink' },
    { label: 'D', seconds: '4', motion: 'shrink' },
  ] as unknown as BreathPhase[];
  expect(totalSeconds(odd, 2)).toBe(6);
  expect(stepAt(odd, 2, 0)?.phase.label).toBe('B');
  expect(totalSeconds(odd, 0)).toBe(0);
  expect(stepAt(odd, 0, 0)).toBeNull();
  expect(stepAt([], 4, 0)).toBeNull();
});
