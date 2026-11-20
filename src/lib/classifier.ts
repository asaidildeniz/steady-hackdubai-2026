import model from '@/content/classifier/model.json';
import submodel from '@/content/classifier/submodel.json';
import { type ClassifierCategory, content, type Subtopic } from '@/content/types';
import { contains, isCrisis } from './matching';
import { features, normalise } from './textFeatures';

// Steady's feeling classifier (Abel, 2026-11): a small trained model that runs entirely on the phone or in the
// browser. It is the weights in model.json, made by scripts/train-classifier.js from made-up sentences.
// Same sentence, same answer, every time; and every answer says which words it was based on.
// The crisis check in matching.ts always runs first and never depends on this model.

type Model = { classes: string[]; words: string[]; bias: number[]; weights: Record<string, number[]> };
const m = model as Model;
const sm = submodel as Model;
const known = new Set([...m.words, ...sm.words]);

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
  for (const k of known) {
    if (Math.abs(k.length - w.length) > allowed) continue;
    const d = distance(w, k);
    if (d < bestD) {
      best = k;
      bestD = d;
    }
  }
  return best;
}

// Softmax scores of a model's classes for a sentence; `only` limits it to some classes (they then share 100%).
function score(mod: Model, text: string, only?: string[]) {
  const corrected = normalise(text).split(' ').map(spellCheck).join(' ');
  const fs = features(corrected).filter((f) => mod.weights[f]);
  const ks = mod.classes.map((_, k) => k).filter((k) => !only || only.includes(mod.classes[k]));
  const z = ks.map((k) => fs.reduce((s, f) => s + mod.weights[f][k], mod.bias[k]));
  const max = Math.max(...z);
  const e = z.map((v) => Math.exp(v - max));
  const sum = e.reduce((s, v) => s + v, 0);
  const scores = ks.map((k, i) => ({ category: mod.classes[k], p: e[i] / sum })).sort((a, b) => b.p - a.p);
  const top = mod.classes.indexOf(scores[0].category);
  const because = fs
    .filter((f) => mod.weights[f][top] > 0)
    .sort((a, b) => mod.weights[b][top] - mod.weights[a][top] || (a < b ? -1 : 1))
    .slice(0, 3);
  return { scores, because };
}

export function classify(text: string): Classification {
  const { scores, because } = score(m, text);
  return { category: scores[0].category, confidence: scores[0].p, scores, because };
}

// Within a feeling, the sub-topics (and so the writings) closest first (Abel, 2026-11-20). Empty for a feeling
// with only one kind of writing. The sub-topic model is trained on subtopics.json.
export function subtopicsFor(text: string, category: ClassifierCategory): { subtopic: Subtopic; p: number }[] {
  if (category.subtopics.length < 2) return category.subtopics.map((subtopic) => ({ subtopic, p: 1 }));
  return score(sm, text, category.subtopics.map((s) => s.id)).scores.map(({ category: id, p }) => ({
    subtopic: category.subtopics.find((s) => s.id === id)!,
    p,
  }));
}

// The writing to show for a sentence in this feeling: its closest sub-topic's writing, or the feeling's first
// writing while that sub-topic's own is not written yet. Null when the feeling has no writing at all.
export function writingFor(text: string, category: ClassifierCategory): string | null {
  const best = subtopicsFor(text, category)[0]?.subtopic;
  return best?.writing ?? category.content[0] ?? null;
}

export type Ranked = { category: ClassifierCategory; p: number }[];

export type Understood =
  | { kind: 'crisis'; ranked: Ranked } // open Need help now
  | { kind: 'category'; category: ClassifierCategory; confidence: number; because: string[]; sure: boolean; heavy: boolean; ranked: Ranked }
  | { kind: 'unsure'; heavy: boolean; ranked: Ranked }; // ask which feeling is closest, closest first
// heavy: at the limit but not a crisis ("I can't live with the guilt"). The feeling stays, and a quiet line offers Need help now.

// Every category a student can see, most likely first (Abel, 2026-11-20: like search results, the closest first).
// 'suicidal' and 'none' are never in it.
function rank(r: Classification): Ranked {
  const cats = content.classifier.categories;
  return r.scores.flatMap((s) => {
    const category = cats.find((c) => c.id === s.category);
    return category ? [{ category, p: s.p }] : [];
  });
}

// What a typed sentence means for where Steady goes next, in this order:
// 1. the exact crisis phrases (reviewable, never depends on the model);
// 2. the model's 'suicidal' score at or above the safety net: when in doubt, offer help;
// 3. a category the model is confident about; otherwise ask, never guess.
// Below `sureEnough` (80%) a match is not sure: the other close feelings are shown under it, closest first.
// In between (Abel, 2026-11-20): a sentence at the limit, by a reviewable phrase ("I can't take", "I can't live with")
// or a 'suicidal' score from `heavyNet` up to the safety net, keeps its feeling and is marked heavy.
export function understand(text: string): Understood {
  const r = classify(text);
  const ranked = rank(r);
  if (isCrisis(text)) return { kind: 'crisis', ranked };
  const cfg = content.classifier;
  const risk = r.scores.find((s) => s.category === 'suicidal')?.p ?? 0;
  if (risk >= cfg.suicideNet) return { kind: 'crisis', ranked };
  const heavy = risk >= cfg.heavyNet || cfg.heavyPhrases.some((p) => contains(text, p));
  const category = cfg.categories.find((c) => c.id === r.category);
  if (!category || r.confidence < cfg.confidence) return { kind: 'unsure', heavy, ranked };
  const sure = r.confidence >= cfg.sureEnough;
  return { kind: 'category', category, confidence: r.confidence, because: r.because, sure, heavy, ranked };
}

// The close alternatives to show under a match that isn't sure: the next few by likelihood, each at least `floor`.
// Okay is never offered under a hard feeling, nor a hard feeling under Okay ("nobody likes me" is never Okay).
export const alsoClose = (u: Extract<Understood, { kind: 'category' }>, max = 3, floor = 0.05) =>
  u.sure
    ? []
    : u.ranked
        .filter((x) => x.category.id !== u.category.id && x.p >= floor)
        .filter((x) => (x.category.id === 'okay') === (u.category.id === 'okay'))
        .slice(0, max);
