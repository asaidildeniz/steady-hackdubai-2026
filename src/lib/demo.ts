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

// Demo mode shows the wording as meant, without the "Draft:" label the reviewer still needs.
// content.json and a normal start keep every label.
export function dropDraftLabels(node: Record<string, unknown> | unknown[]) {
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string' && value.startsWith('Draft:')) {
      const rest = value.slice('Draft:'.length).trimStart();
      (node as Record<string, unknown>)[key] = rest.charAt(0).toUpperCase() + rest.slice(1);
    } else if (value && typeof value === 'object') {
      dropDraftLabels(value as Record<string, unknown>);
    }
  }
}

if (demo.on) dropDraftLabels(content as unknown as Record<string, unknown>);
