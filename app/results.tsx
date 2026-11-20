import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/components/Bits';
import { Screen } from '@/components/Screen';
import { FeaturedTool, OtherTool, ToolRow } from '@/components/ToolCard';
import { type ClassifierCategory, content, type LibraryItem, type Tag, type ToolId } from '@/content/types';
import { groupFor, pickCards } from '@/lib/matching';
import { colors, fonts, space, text, type } from '@/theme';

// Only ids that exist in the taxonomy are used; anything else in the link is ignored.
const read = (param: string | undefined, known: Tag[]) =>
  (param ?? '').split(',').filter((id) => known.some((t) => t.id === id));

const toolRoute: Record<ToolId, '/breathing' | '/untangle' | '/reach-out'> = {
  breathe: '/breathing',
  untangle: '/untangle',
  reachOut: '/reach-out',
};

const openReading = (item: LibraryItem) =>
  item.opens.topic ? router.push({ pathname: '/topic', params: { id: item.opens.topic } }) : router.push('/breathing');

// The v3 feeling page: what the student shared, one tool to try first, the others and matching readings after.
export default function Results() {
  const fp = content.feelingPages;
  const cl = content.classifier;
  const { f, t, n, c, r } = useLocalSearchParams<{ f?: string; t?: string; n?: string; c?: string; r?: string }>();
  const { feelings, themes, needs } = content.taxonomy;
  const tags = { feelings: read(f, feelings), themes: read(t, themes), needs: read(n, needs) };
  const group = groupFor(tags);
  const category = cl.categories.find((cat) => cat.id === c); // what the classifier heard, if it chose this page
  // A match that wasn't sure (under 80%): the other close feelings, closest first, one tap to switch.
  const close = (r ?? '').split(',').flatMap((id) => cl.categories.filter((cat) => cat.id === id && cat.id !== c));
  const switchTo = (cat: ClassifierCategory) =>
    router.replace({ pathname: '/results', params: { f: cat.feelings.join(','), t: t ?? '', n: n ?? '', c: cat.id } });
  if (!group) return <Redirect href="/breathing" />; // no feeling found: Breathe is a calm place to start

  const [first, ...others] = group.tools;
  const readings = [...pickCards(tags).main, ...pickCards(tags).more].filter((i) => i.type === 'reading');

  return (
    <Screen back>
      <Chip label={group.tag} />
      <Text accessibilityRole="header" style={text.heading}>
        {group.heading}
      </Text>
      <Text style={[text.body, styles.soft]}>{group.body}</Text>
      {category && (
        <View style={styles.heard}>
          <Text style={text.note}>{cl.soundsLike.replace('{label}', category.soundsLike)}</Text>
          {close.length > 0 && (
            <View style={styles.close}>
              <Text style={text.note}>{cl.alsoClose}</Text>
              <View style={styles.closeChips}>
                {close.map((cat) => (
                  <Chip key={cat.id} label={cat.label} onPress={() => switchTo(cat)} />
                ))}
              </View>
            </View>
          )}
          {/* One tap to correct it: back to Home with every category to choose from, the close ones first. */}
          <Pressable
            onPress={() => router.dismissTo({ pathname: '/home', params: { choose: '1', ...(r ? { r } : {}) } })}
            accessibilityRole="button"
            accessibilityLabel={cl.notQuite}
            accessibilityHint={cl.notQuiteHint}
            style={styles.notQuite}
          >
            <Text style={styles.notQuiteText}>{cl.notQuite}</Text>
          </Pressable>
        </View>
      )}
      <FeaturedTool tool={first} onPress={() => router.push(toolRoute[first])} />
      <Text style={[text.note, styles.orTry]}>{fp.orTry}</Text>
      <View style={styles.list}>
        {others.map((tool) => (
          <OtherTool key={tool} tool={tool} onPress={() => router.push(toolRoute[tool])} />
        ))}
        {readings.map((item) => (
          <ToolRow
            key={item.id}
            icon="read"
            tint={colors.chip}
            ink={colors.primary}
            title={item.title}
            body={fp.readingMeta.replace('{n}', String(item.durationMinutes))}
            a11yLabel={`${item.title}, ${fp.readingMeta.replace('{n}', String(item.durationMinutes))}`}
            onPress={() => openReading(item)}
          />
        ))}
      </View>
      <Text style={text.note}>{content.matching.notReplacement}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  soft: { color: colors.muted },
  orTry: { marginTop: space.gap / 2 },
  list: { gap: space.gap - 4 },
  heard: { gap: 2 },
  close: { gap: 6, marginTop: 6 },
  closeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.gap / 2 },
  notQuite: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  notQuiteText: { fontSize: type.small, fontFamily: fonts.medium, color: colors.muted, textDecorationLine: 'underline' },
});
