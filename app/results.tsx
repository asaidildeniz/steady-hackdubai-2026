import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/components/Bits';
import { Screen } from '@/components/Screen';
import { FeaturedTool, OtherTool, ToolRow } from '@/components/ToolCard';
import { content, type LibraryItem, type Tag, type ToolId } from '@/content/types';
import { groupFor, pickCards } from '@/lib/matching';
import { colors, space, text } from '@/theme';

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
  const { f, t, n } = useLocalSearchParams<{ f?: string; t?: string; n?: string }>();
  const { feelings, themes, needs } = content.taxonomy;
  const tags = { feelings: read(f, feelings), themes: read(t, themes), needs: read(n, needs) };
  const group = groupFor(tags);
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
});
