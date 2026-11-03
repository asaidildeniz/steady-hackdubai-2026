import type { Href } from 'expo-router';
import { content, type Mood } from '@/content/types';

// Routing lives in each mood's `group` and `topic` in content.json, so the reviewer can rename, reorder or rematch moods.
export function moodHref({ group, topic }: Mood): Href {
  if (group === 'gentle' && content.topics.list.some((t) => t.id === topic)) {
    return { pathname: '/topic', params: { id: topic! } };
  }
  if (group === 'kind' || group === 'gentle') {
    return { pathname: '/check-in-result', params: { group } };
  }
  return '/need-help'; // urgent, or anything unexpected
}
