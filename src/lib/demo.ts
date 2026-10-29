import { content } from '@/content/types';

// On only when started with `npm run demo` (EXPO_PUBLIC_DEMO=1). A normal start never sees any of it.
// An object, so tests can switch it on.
export const demo = { on: process.env.EXPO_PUBLIC_DEMO === '1' };

// The same breathing steps and words, one short round, so a live demo reaches Finished quickly.
export function breathingTiming() {
  const { phases, cycles } = content.breathing;
  if (!demo.on) return { phases, cycles };
  const seconds = content.demo.breathingSeconds;
  return { phases: phases.map((p, i) => ({ ...p, seconds: seconds[i] ?? p.seconds })), cycles: 1 };
}
