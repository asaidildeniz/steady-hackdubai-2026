import type { BreathPhase } from '@/content/types';
import { content } from '@/content/types';
import { stepAt, totalSeconds } from './breathing';

const { phases, cycles } = content.breathing;

test('the shipped exercise lasts about a minute (4 in, 4 hold, 6 out, 4 cycles = 56s)', () => {
  expect(totalSeconds(phases, cycles)).toBe(56);
});

test('phases come in order with a counting-down number', () => {
  expect(stepAt(phases, cycles, 0)).toEqual({ index: 0, phase: phases[0], secondsLeft: 4 });
  expect(stepAt(phases, cycles, 3)).toEqual({ index: 0, phase: phases[0], secondsLeft: 1 });
  expect(stepAt(phases, cycles, 4)).toEqual({ index: 1, phase: phases[1], secondsLeft: 4 });
  expect(stepAt(phases, cycles, 8)).toEqual({ index: 2, phase: phases[2], secondsLeft: 6 });
  expect(stepAt(phases, cycles, 14)).toEqual({ index: 3, phase: phases[0], secondsLeft: 4 }); // cycle 2
});

test('after the last second the exercise is done', () => {
  expect(stepAt(phases, cycles, 55)?.secondsLeft).toBe(1);
  expect(stepAt(phases, cycles, 56)).toBeNull();
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
