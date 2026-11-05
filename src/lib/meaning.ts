import type { Tags } from '@/lib/matching';

// Meaning matching (Abel 1.4, on the phone): pure maths over embedding vectors, no model here.

export type Vec = ArrayLike<number>;
export type TagIndex = { layer: keyof Tags; id: string; vec: Vec; phrase?: string }[]; // one entry per phrase; a tag may have several

export function cosine(a: Vec, b: Vec): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

export type Scored = { layer: keyof Tags; id: string; score: number; phrase?: string };

// Every tag with the score of its best phrase, best first.
export function scoreTags(query: Vec, index: TagIndex): Scored[] {
  const best = new Map<string, Scored>();
  for (const { layer, id, vec, phrase } of index) {
    const score = cosine(query, vec);
    const key = `${layer}:${id}`;
    if (score > (best.get(key)?.score ?? -Infinity)) best.set(key, { layer, id, score, phrase });
  }
  return [...best.values()].sort((a, b) => b.score - a.score);
}

// Keep tags at or above the threshold, best first, at most two per layer.
export function closestTags(query: Vec, index: TagIndex, threshold: number, perLayer = 2): Tags {
  const ranked = scoreTags(query, index).filter((t) => t.score >= threshold);
  const pick = (layer: keyof Tags) =>
    ranked
      .filter((t) => t.layer === layer)
      .slice(0, perLayer)
      .map((t) => t.id);
  return { feelings: pick('feelings'), themes: pick('themes'), needs: pick('needs') };
}

// Golden-set score at one threshold: how many sentences found an expected feeling (keywords + meaning),
// and how many neutral sentences wrongly found any feeling.
export type GoldenCase = { keywords: Tags; scores: Scored[]; expected: string[] };
export function goldenScore(cases: GoldenCase[], neutral: Omit<GoldenCase, 'expected'>[], threshold: number) {
  const feelingsAt = (c: Omit<GoldenCase, 'expected'>) =>
    mergeTags(c.keywords, closestFrom(c.scores, threshold)).feelings;
  return {
    threshold,
    hits: cases.filter((c) => feelingsAt(c).some((f) => c.expected.includes(f))).length,
    total: cases.length,
    falseAlarms: neutral.filter((c) => feelingsAt(c).length > 0).length,
    neutral: neutral.length,
  };
}

// closestTags from already-computed scores.
function closestFrom(scores: Scored[], threshold: number, perLayer = 2): Tags {
  const keep = (layer: keyof Tags) =>
    scores
      .filter((t) => t.layer === layer && t.score >= threshold)
      .slice(0, perLayer)
      .map((t) => t.id);
  return { feelings: keep('feelings'), themes: keep('themes'), needs: keep('needs') };
}

// Keyword tags first (exact and reviewable), then anything the meaning added.
export function mergeTags(a: Tags, b: Tags): Tags {
  const join = (x: string[], y: string[]) => [...new Set([...x, ...y])];
  return { feelings: join(a.feelings, b.feelings), themes: join(a.themes, b.themes), needs: join(a.needs, b.needs) };
}
