import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content, type LibraryItem, type Tag } from '@/content/types';
import { heading, pickCards } from '@/lib/matching';
import { colors, space, text } from '@/theme';

// Only ids that exist in the taxonomy are used; anything else in the link is ignored.
const read = (param: string | undefined, known: Tag[]) =>
  (param ?? '').split(',').filter((id) => known.some((t) => t.id === id));

const open = (item: LibraryItem) =>
  item.opens.topic ? router.push({ pathname: '/topic', params: { id: item.opens.topic } }) : router.push('/breathing');

// Abel 1.6: a balanced set of cards for what the student tapped or typed.
export default function Results() {
  const m = content.matching;
  const { f, t, n } = useLocalSearchParams<{ f?: string; t?: string; n?: string }>();
  const { feelings, themes, needs } = content.taxonomy;
  const tags = { feelings: read(f, feelings), themes: read(t, themes), needs: read(n, needs) };
  const { main, more } = pickCards(tags);
  // Only good feelings (e.g. grateful): a kind reply, not help options. Any matching cards still follow.
  const good =
    tags.feelings.length > 0 && tags.feelings.every((id) => m.goodFeelings.includes(id)) && !tags.themes.length;

  if (good) {
    return (
      <Screen actions={<BigButton label={m.good.done} onPress={() => router.dismissTo('/home')} />}>
        <Text accessibilityRole="header" style={text.heading}>
          {m.good.heading}
        </Text>
        <Text style={text.body}>{m.good.message}</Text>
        {[...main, ...more].map((item) => (
          <Card key={item.id} item={item} />
        ))}
      </Screen>
    );
  }

  return (
    <Screen>
      <Text accessibilityRole="header" style={text.heading}>
        {main.length ? heading(tags) : m.headingNone}
      </Text>
      {main.length ? (
        main.map((item) => <Card key={item.id} item={item} />)
      ) : (
        <>
          <Text style={text.body}>{m.noMatch}</Text>
          <BigButton label={m.breathe} onPress={() => router.push('/breathing')} />
          <BigButton secondary label={m.talk} onPress={() => router.push('/talk-to-someone')} />
          <BigButton secondary label={m.browse} onPress={() => router.push('/topics')} />
        </>
      )}
      {more.length > 0 && (
        <>
          <Text accessibilityRole="header" style={text.title}>
            {m.more}
          </Text>
          {more.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </>
      )}
      <Text style={text.note}>{m.notReplacement}</Text>
    </Screen>
  );
}

function Card({ item }: { item: LibraryItem }) {
  const m = content.matching;
  const meta = `${m.types[item.type]} · ${m.minutes.replace('{n}', String(item.durationMinutes))}`;
  return (
    <Pressable
      onPress={() => open(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${meta}`}
      accessibilityHint={item.summary}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={text.note}>{meta}</Text>
      <Text style={text.title}>{item.title}</Text>
      <Text style={text.body}>{item.summary}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.gap / 4,
    padding: space.gap,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.text,
    minHeight: space.tap,
  },
  pressed: { opacity: 0.8 },
});
