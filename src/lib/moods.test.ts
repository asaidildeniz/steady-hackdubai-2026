import { content, type Mood } from '@/content/types';
import { moodHref } from './moods';

const result = (group: string) => ({ pathname: '/check-in-result', params: { group } });
const topic = (id: string) => ({ pathname: '/topic', params: { id } });
const mood = (extra: Partial<Mood>): Mood => ({ id: 'x', label: 'X', group: 'gentle', ...extra });

test('every mood in content.json goes where the matching table says', () => {
  const routes = Object.fromEntries(content.checkIn.moods.map((m) => [m.id, moodHref(m)]));
  expect(routes).toEqual({
    good: result('kind'),
    okay: result('kind'),
    stressed: topic('stress'),
    anxious: topic('anxiety'),
    exams: topic('exams'),
    faith: topic('faith'),
    down: topic('down'),
    struggling: '/need-help',
  });
});

test('every topic a mood points to exists', () => {
  const ids = new Set(content.topics.list.map((t) => t.id));
  for (const m of content.checkIn.moods) if (m.topic) expect(ids).toContain(m.topic);
});

test('a missing or unknown topic falls back to the gentle message', () => {
  expect(moodHref(mood({}))).toEqual(result('gentle'));
  expect(moodHref(mood({ topic: 'typo' }))).toEqual(result('gentle'));
});

test('Struggling always goes to Need help, even with a topic', () => {
  expect(moodHref(mood({ group: 'urgent', topic: 'stress' }))).toBe('/need-help');
});

test('an unknown group goes to Need help, the safe side', () => {
  expect(moodHref(mood({ group: 'typo' as never }))).toBe('/need-help');
});
