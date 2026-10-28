import { content } from '@/content/types';
import { moodHref } from './moods';

const result = (group: string) => ({ pathname: '/check-in-result', params: { group } });

test('every mood in content.json routes by its group', () => {
  const routes = Object.fromEntries(content.checkIn.moods.map((m) => [m.id, moodHref(m.group)]));
  expect(routes).toEqual({
    good: result('kind'),
    okay: result('kind'),
    stressed: result('gentle'),
    lonely: result('gentle'),
    low: result('gentle'),
    struggling: '/need-help',
  });
});

test('an unknown group goes to Need help, the safe side', () => {
  expect(moodHref('typo' as never)).toBe('/need-help');
});
