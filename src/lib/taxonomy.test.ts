import { content } from '@/content/types';

// Abel's feelings-to-content plan: matching only works if every tag an item uses exists, so guard the data.
const { taxonomy, library } = content;
const layers = ['feelings', 'themes', 'needs', 'intensity'] as const;
const ids = (layer: (typeof layers)[number]) => new Set(taxonomy[layer].map((t) => t.id));

test('every tag id is unique across all layers', () => {
  const all = layers.flatMap((l) => taxonomy[l].map((t) => t.id));
  expect(new Set(all).size).toBe(all.length);
});

test("Abel's layers have the agreed sizes", () => {
  expect(taxonomy.feelings).toHaveLength(12);
  expect(taxonomy.themes).toHaveLength(16);
  expect(taxonomy.needs.map((t) => t.id)).toEqual(['calm', 'comfort', 'understand', 'act']);
  expect(taxonomy.intensity.map((t) => t.id)).toEqual(['low', 'moderate', 'high']);
});

test('every feeling, theme and need has a label, a definition and example phrases', () => {
  for (const layer of ['feelings', 'themes', 'needs'] as const) {
    for (const tag of taxonomy[layer]) {
      expect(tag.label.trim()).not.toBe('');
      expect(tag.definition.trim()).not.toBe('');
      expect(tag.examplePhrases.length).toBeGreaterThan(0);
    }
  }
});

test('library item ids are unique', () => {
  expect(new Set(library.map((i) => i.id)).size).toBe(library.length);
});

test.each(library.map((i) => [i.id, i]))('%s only uses tags that exist', (_id, item) => {
  for (const layer of layers) {
    const known = ids(layer);
    for (const tag of item.tags[layer] ?? []) expect(known).toContain(tag);
  }
  expect(item.tags.feelings.length).toBeGreaterThan(0);
});

test.each(library.map((i) => [i.id, i]))('%s has a valid type, status and target', (_id, item) => {
  expect(['tool', 'reading', 'scripture', 'video', 'audio']).toContain(item.type);
  expect(['draft', 'inReview', 'approved', 'published', 'retired']).toContain(item.status);
  expect(item.forWhom.trim()).not.toBe('');
  if (item.opens.topic) expect(content.topics.list.map((t) => t.id)).toContain(item.opens.topic);
  if (item.opens.screen) expect(['breathing']).toContain(item.opens.screen);
  expect(!!item.opens.topic !== !!item.opens.screen).toBe(true); // exactly one target
});

test('nothing is published before the reviewer approves it', () => {
  for (const item of library) expect(item.status).toBe('draft');
});

test('every golden-set feeling exists in the taxonomy', () => {
  const golden = require('@/content/golden.json') as { sentences: { text: string; feelings: string[] }[] };
  const known = ids('feelings');
  for (const s of golden.sentences) {
    expect(s.feelings.length).toBeGreaterThan(0);
    for (const f of s.feelings) expect(known).toContain(f);
  }
});
