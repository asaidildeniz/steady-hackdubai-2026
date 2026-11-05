import { closestTags, cosine, goldenScore, mergeTags, type TagIndex } from './meaning';

const none = { feelings: [], themes: [], needs: [] };

test('cosine similarity: same direction 1, opposite -1, unrelated 0', () => {
  expect(cosine([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
  expect(cosine([1, 0], [-1, 0])).toBeCloseTo(-1);
  expect(cosine([1, 0], [0, 1])).toBeCloseTo(0);
  expect(cosine([0, 0], [1, 1])).toBe(0); // never NaN
});

describe('closest tags by meaning', () => {
  const index: TagIndex = [
    { layer: 'feelings', id: 'lonely', vec: [1, 0, 0] },
    { layer: 'feelings', id: 'lonely', vec: [0.9, 0.1, 0] }, // several phrases per tag: the best one counts
    { layer: 'feelings', id: 'anxious', vec: [0, 1, 0] },
    { layer: 'feelings', id: 'sad', vec: [0.7, 0.7, 0] },
    { layer: 'themes', id: 'comparison', vec: [0.8, 0, 0.6] },
    { layer: 'needs', id: 'calm', vec: [0, 0, 1] },
  ];

  test('keeps tags above the threshold, best first, each tag once', () => {
    expect(closestTags([1, 0, 0], index, 0.6).feelings).toEqual(['lonely', 'sad']);
  });

  test('never more than two per layer', () => {
    expect(closestTags([1, 0.6, 0], index, 0.1).feelings).toHaveLength(2);
  });

  test('fills each layer on its own', () => {
    expect(closestTags([1, 0, 0.5], index, 0.7)).toEqual({ feelings: ['lonely'], themes: ['comparison'], needs: [] });
  });

  test('nothing close enough gives nothing, never a guess', () => {
    expect(closestTags([0, 0, -1], index, 0.5)).toEqual(none);
  });
});

test('golden score counts hits from keywords or meaning, and neutral false alarms', () => {
  const none = { feelings: [], themes: [], needs: [] };
  const s = (id: string, score: number) => ({ layer: 'feelings' as const, id, score });
  const cases = [
    { keywords: none, scores: [s('sad', 0.4)], expected: ['sad'] }, // meaning only, needs threshold <= 0.4
    { keywords: { ...none, feelings: ['lonely'] }, scores: [], expected: ['lonely'] }, // keywords always count
    { keywords: none, scores: [s('angry', 0.5)], expected: ['sad'] }, // wrong feeling
  ];
  const neutral = [{ keywords: none, scores: [s('stressed', 0.33)] }];
  expect(goldenScore(cases, neutral, 0.45)).toEqual({ threshold: 0.45, hits: 1, total: 3, falseAlarms: 0, neutral: 1 });
  expect(goldenScore(cases, neutral, 0.3)).toEqual({ threshold: 0.3, hits: 2, total: 3, falseAlarms: 1, neutral: 1 });
});

test('merging keeps every tag once, keyword tags first', () => {
  expect(
    mergeTags(
      { feelings: ['anxious'], themes: ['study'], needs: [] },
      { feelings: ['lonely', 'anxious'], themes: [], needs: ['calm'] },
    ),
  ).toEqual({ feelings: ['anxious', 'lonely'], themes: ['study'], needs: ['calm'] });
});
