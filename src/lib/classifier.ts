import model from '@/content/classifier/model.json';
import { type ClassifierCategory, content } from '@/content/types';
import { isCrisis } from './matching';
import { features, normalise } from './textFeatures';

// Steady's feeling classifier (Abel, 2026-11): a small trained model that runs entirely on the phone or in the
// browser. It is the weights in model.json, made by scripts/train-classifier.js from made-up sentences.
// Same sentence, same answer, every time; and every answer says which words it was based on.
// The crisis check in matching.ts always runs first and never depends on this model.

type Model = { classes: string[]; words: string[]; bias: number[]; weights: Record<string, number[]> };
const m = model as Model;
const known = new Set(m.words);

export type Classification = {
  category: string; // the most likely category, including 'suicidal' and 'none'
  confidence: number; // 0 to 1
  scores: { category: string; p: number }[]; // every category, most likely first
  because: string[]; // the words that pushed most towards the chosen category
};

// Letters to add, remove or swap to turn a into b; changing a letter counts as two, so a typo ("lonley", "anxous")
// is close but a different real word ("lovely" is not "lonely") is not.
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 2;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

// An unknown word of 5+ letters becomes the closest word from the training sentences one letter away (two for 8+),
// so "anxiuos" still counts as "anxious". Ties go to the alphabetically first word, so the answer never changes.
function spellCheck(w: string): string {
  if (w.length < 5 || known.has(w) || !/^[a-z]+$/.test(w)) return w;
  const allowed = w.length >= 8 ? 2 : 1;
  let best = w;
  let bestD = allowed + 1;
  for (const k of m.words) {
    if (Math.abs(k.length - w.length) > allowed) continue;
    const d = distance(w, k);
    if (d < bestD) {
      best = k;
      bestD = d;
    }
  }
  return best;
}

export function classify(text: string): Classification {
  const corrected = normalise(text).split(' ').map(spellCheck).join(' ');
  const fs = features(corrected).filter((f) => m.weights[f]);
  const z = m.classes.map((_, k) => fs.reduce((s, f) => s + m.weights[f][k], m.bias[k]));
  const max = Math.max(...z);
  const e = z.map((v) => Math.exp(v - max));
  const sum = e.reduce((s, v) => s + v, 0);
  const p = e.map((v) => v / sum);
  const scores = m.classes.map((category, k) => ({ category, p: p[k] })).sort((a, b) => b.p - a.p);
  const top = m.classes.indexOf(scores[0].category);
  const because = fs
    .filter((f) => m.weights[f][top] > 0)
    .sort((a, b) => m.weights[b][top] - m.weights[a][top] || (a < b ? -1 : 1))
    .slice(0, 3);
  return { category: scores[0].category, confidence: scores[0].p, scores, because };
}

export type Understood =
  | { kind: 'crisis' } // open Need help now
  | { kind: 'category'; category: ClassifierCategory; confidence: number; because: string[] }
  | { kind: 'unsure' }; // ask which feeling is closest

// What a typed sentence means for where Steady goes next, in this order:
// 1. the exact crisis phrases (reviewable, never depends on the model);
// 2. the model's 'suicidal' score at or above the safety net: when in doubt, offer help;
// 3. a category the model is confident about; otherwise ask, never guess.
export function understand(text: string): Understood {
  if (isCrisis(text)) return { kind: 'crisis' };
  const r = classify(text);
  const cfg = content.classifier;
  if ((r.scores.find((s) => s.category === 'suicidal')?.p ?? 0) >= cfg.suicideNet) return { kind: 'crisis' };
  const category = cfg.categories.find((c) => c.id === r.category);
  if (!category || r.confidence < cfg.confidence) return { kind: 'unsure' };
  return { kind: 'category', category, confidence: r.confidence, because: r.because };
}
