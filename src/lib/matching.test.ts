import { content } from '@/content/types';
import { heading, isCrisis, pickCards, tagsFromText } from './matching';

const none = { feelings: [], themes: [], needs: [] };
const ids = (items: { id: string }[]) => items.map((i) => i.id);

describe('safety check (runs before any search)', () => {
  test.each(content.safety.crisisPhrases)('catches "%s"', (phrase) => {
    expect(isCrisis(phrase)).toBe(true);
  });

  test.each([
    'I want to KILL MYSELF.',
    'honestly i cant go on like this',
    "Sometimes I think I'd be better off dead...",
    'been having   suicidal   thoughts',
  ])('catches it inside a sentence, in any case or spacing: "%s"', (text) => {
    expect(isCrisis(text)).toBe(true);
  });

  test.each(['I smashed my exam, killing it', 'so stressed about my deadline', ''])('does not flag "%s"', (text) => {
    expect(isCrisis(text)).toBe(false);
  });
});

describe('typed text to tags', () => {
  test('finds feelings and themes from example phrases, including word endings', () => {
    const tags = tagsFromText('I keep panicking about my exams and I cannot sleep');
    expect(tags.feelings).toContain('anxious');
    expect(tags.themes).toEqual(expect.arrayContaining(['study']));
  });

  test('a short phrase only matches a whole word', () => {
    expect(tagsFromText('I feel low today').feelings).toContain('sad');
    expect(tagsFromText('I am following the plan').feelings).not.toContain('sad');
  });

  test('nothing recognisable gives no tags', () => {
    expect(tagsFromText('asdf qwerty')).toEqual(none);
  });
});

describe('picking the cards', () => {
  test('a calm-first feeling puts the quick tool first, then the reading', () => {
    const { main } = pickCards({ ...none, feelings: ['anxious'] });
    expect(ids(main)).toEqual(['breathe-one-minute', 'reading-anxiety']);
  });

  test('otherwise the reading comes first', () => {
    const { main } = pickCards({ ...none, feelings: ['distant-from-god'] });
    expect(ids(main)[0]).toBe('reading-faith');
  });

  test('main shows at most one item of each type; the rest go to "more like this"', () => {
    const { main, more } = pickCards({ ...none, feelings: ['stressed'], themes: ['study'] });
    const types = main.map((i) => i.type);
    expect(new Set(types).size).toBe(types.length);
    expect(more.length).toBeGreaterThan(0);
    for (const item of more) expect(ids(main)).not.toContain(item.id);
  });

  test('a theme counts, so study brings up the exams reading', () => {
    const { main, more } = pickCards({ ...none, themes: ['study'] });
    expect([...ids(main), ...ids(more)]).toContain('reading-exams');
  });

  test('a feeling with no content gives nothing, never a random item', () => {
    expect(pickCards({ ...none, feelings: ['grateful'] })).toEqual({ main: [], more: [] });
  });

  test('retired items are never shown', () => {
    const item = content.library.find((i) => i.id === 'reading-anxiety')!;
    const before = item.status;
    item.status = 'retired';
    try {
      const { main, more } = pickCards({ ...none, feelings: ['anxious'] });
      expect([...ids(main), ...ids(more)]).not.toContain('reading-anxiety');
    } finally {
      item.status = before;
    }
  });
});

describe('heading', () => {
  test('feeling and theme', () => {
    expect(heading({ ...none, feelings: ['anxious'], themes: ['study'] })).toBe(
      content.matching.headingFeelingTheme.replace('{feeling}', 'anxious').replace('{theme}', 'study'),
    );
  });

  test('keeps capitals inside a label', () => {
    expect(heading({ ...none, feelings: ['distant-from-god'] })).toContain('distant from God');
  });

  test('no tags falls back to the general heading', () => {
    expect(heading(none)).toBe(content.matching.headingNone);
  });
});
