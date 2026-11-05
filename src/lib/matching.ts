import { content, type LibraryItem, type Tag } from '@/content/types';

// Abel's Level 1 matching, entirely on the phone: no network, and typed text is never stored.

export type Tags = { feelings: string[]; themes: string[]; needs: string[] };

// Lower case, apostrophes dropped ("can't" -> "cant"), everything else that isn't a letter or digit becomes one space.
const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A phrase matches from the start of a word. A single word of 4+ letters may carry an ending
// ("panic" matches "panicking"); anything shorter or longer must match whole words ("low" never matches "following").
function contains(text: string, phrase: string): boolean {
  const p = normalise(phrase);
  if (!p) return false;
  const loose = !p.includes(' ') && p.length >= 4;
  return new RegExp(`(^| )${escape(p)}${loose ? '' : '(?= |$)'}`).test(normalise(text));
}

// Safety first (Abel 1.8): checked before any search, and a match always wins.
export function isCrisis(text: string): boolean {
  return content.safety.crisisPhrases.some((p) => contains(text, p));
}

// Keyword-to-tag dictionary (Abel 1.5): the taxonomy's labels and example phrases.
export function tagsFromText(text: string): Tags {
  const match = (tags: Tag[]) =>
    tags.filter((t) => [t.label, ...t.examplePhrases].some((p) => contains(text, p))).map((t) => t.id);
  const { feelings, themes, needs } = content.taxonomy;
  return { feelings: match(feelings), themes: match(themes), needs: match(needs) };
}

const overlap = (a: string[], b: string[]) => a.filter((x) => b.includes(x)).length;

// Abel 1.6: score by tag overlap, then fill one slot per type; the rest become "more like this".
// Drafts are shown while nothing is approved yet; retired items never are.
export function pickCards(tags: Tags): { main: LibraryItem[]; more: LibraryItem[] } {
  const ranked = content.library
    .filter((item) => item.status !== 'retired')
    .map((item, order) => ({
      item,
      order,
      score:
        3 * overlap(item.tags.feelings, tags.feelings) +
        2 * overlap(item.tags.themes, tags.themes) +
        overlap(item.tags.needs, tags.needs),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.item.durationMinutes - b.item.durationMinutes || a.order - b.order)
    .map((r) => r.item);

  const calmFirst =
    tags.needs.includes('calm') || tags.feelings.some((f) => content.matching.calmFirst.includes(f));
  const slots: LibraryItem['type'][][] = [['tool'], ['scripture'], ['video', 'audio'], ['reading']];
  if (!calmFirst) slots.push(slots.shift()!); // the quick tool moves to the end

  const main = slots
    .map((types) => ranked.find((i) => types.includes(i.type) && (i.type !== 'tool' || i.durationMinutes < 5)))
    .filter((i): i is LibraryItem => !!i);
  return { main, more: ranked.filter((i) => !main.includes(i)) };
}

// "For when you're feeling anxious about study." Labels keep their own capitals after the first letter.
export function heading({ feelings, themes }: Tags): string {
  const m = content.matching;
  const label = (list: Tag[], id?: string) => {
    const l = list.find((t) => t.id === id)?.label;
    return l && l.charAt(0).toLowerCase() + l.slice(1);
  };
  const feeling = label(content.taxonomy.feelings, feelings[0]);
  const theme = label(content.taxonomy.themes, themes[0]);
  if (feeling && theme) return m.headingFeelingTheme.replace('{feeling}', feeling).replace('{theme}', theme);
  if (feeling) return m.headingFeeling.replace('{feeling}', feeling);
  if (theme) return m.headingTheme.replace('{theme}', theme);
  return m.headingNone;
}
