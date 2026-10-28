import type { Href } from 'expo-router';
import type { MoodGroup } from '@/content/types';

// Routing lives in each mood's `group` in content.json, so the reviewer can rename or reorder moods.
export function moodHref(group: MoodGroup): Href {
  if (group === 'kind' || group === 'gentle') {
    return { pathname: '/check-in-result', params: { group } };
  }
  return '/need-help'; // urgent, or anything unexpected
}
