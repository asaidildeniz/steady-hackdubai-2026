// Text helpers for Untangle. Pure functions over text held in memory; nothing here stores anything.

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// The parts of a thought, to mark one by one: split at sentence ends, ";", and joins like ", so" or " but ".
export function thoughtParts(thought: string): string[] {
  return thought
    .split(/[.!?;]+|,?\s+(?:so|but|and)\s+(?=[a-z’']*\s)/i)
    .map((p) => p.trim().replace(/[,.]+$/, ''))
    .filter(Boolean)
    .map(capital)
    .slice(0, 4);
}

// The thought as the end of "I'm having the thought that …": lower case first letter (except "I"), a closing stop.
export function afterThat(thought: string): string {
  const t = thought.trim();
  const first = /^I(\s|’|')/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1);
  return /[.!?]$/.test(first) ? first : `${first}.`;
}
