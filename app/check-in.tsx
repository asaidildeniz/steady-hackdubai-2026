import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Chip, LogoRow } from '@/components/Bits';
import { LivingDroplet } from '@/components/BreathOrb';
import { Screen } from '@/components/Screen';
import { type ClassifierCategory, content } from '@/content/types';
import { alsoClose, subtopicsFor, understand } from '@/lib/classifier';
import { meaningTags } from '@/lib/embedder';
import { groupFor, type Tags, tagsFromText } from '@/lib/matching';
import { mergeTags } from '@/lib/meaning';
import { colors, fonts, radius, space, text, type } from '@/theme';

// Only ids travel to the results screen; what someone typed never leaves this screen.
const resultsHref = ({ feelings, themes, needs }: Tags, extra: Record<string, string> = {}) =>
  ({
    pathname: '/results',
    params: { f: feelings.join(','), t: themes.join(','), n: needs.join(','), ...extra },
  }) as const;

// A category's page: its own feelings first (they pick the page), then any the keywords found (for readings).
// r: the other close categories, closest first, shown under a match that isn't sure. s: the closest sub-topic.
const categoryHref = (
  category: ClassifierCategory,
  words: Tags = { feelings: [], themes: [], needs: [] },
  extra: { r?: string; s?: string } = {},
) =>
  resultsHref(mergeTags({ ...words, feelings: category.feelings }, words), {
    c: category.id,
    ...(extra.r ? { r: extra.r } : {}),
    ...(extra.s ? { s: extra.s } : {}),
  });

// Home (v3): say it in your own words, or tap a chip. Nothing is saved or sent.
export default function CheckIn() {
  const c = content.checkIn;
  const cl = content.classifier;
  const params = useLocalSearchParams<{ choose?: string; r?: string }>();
  const [typed, setTyped] = useState('');
  const [asking, setAsking] = useState(false); // nothing was clear enough: ask which category is closest
  const [closestFirst, setClosestFirst] = useState<string[]>([]); // category ids, closest first
  const choosing = asking || params?.choose === '1';
  // "Which is closest?" lists the categories the way a search lists results: the closest first, then the rest.
  const order = asking ? closestFirst : (params?.r ?? '').split(',').filter(Boolean);
  const choices = [...cl.categories].sort((a, b) => {
    const i = (id: string) => (order.includes(id) ? order.indexOf(id) : order.length + cl.categories.findIndex((x) => x.id === id));
    return i(a.id) - i(b.id);
  });

  const find = async () => {
    const said = typed;
    setTyped(''); // forget it straight away
    setAsking(false);
    // The crisis phrases, then the classifier's safety net, then its answer (src/lib/classifier.ts).
    const understood = understand(said);
    if (understood.kind === 'crisis') return router.push('/need-help');
    const words = tagsFromText(said);
    if (understood.kind === 'category') {
      const close = alsoClose(understood).map((x) => x.category.id).join(',');
      const s = subtopicsFor(said, understood.category)[0]?.subtopic.id;
      return router.push(categoryHref(understood.category, words, { r: close, s }));
    }
    // The classifier wasn't sure: keywords, plus the on-phone model where it runs.
    const meaning = await meaningTags(said).catch(() => null);
    const tags = meaning ? mergeTags(words, meaning) : words;
    if (groupFor(tags)) return router.push(resultsHref(tags));
    setClosestFirst(understood.ranked.map((x) => x.category.id));
    setAsking(true); // still nothing: ask, never guess, closest first
  };

  return (
    <Screen>
      <LogoRow />
      <View style={styles.hero}>
        <LivingDroplet size={130} />
      </View>
      <Text accessibilityRole="header" style={text.heading}>
        {c.prompt}
      </Text>
      <Text style={[text.body, styles.soft]}>{c.feelingsHint}</Text>
      <TextInput
        accessibilityLabel={c.typeLabel}
        value={typed}
        onChangeText={setTyped}
        placeholder={c.typePlaceholder}
        placeholderTextColor={colors.muted}
        multiline
        maxLength={300}
        style={styles.input}
      />
      {/* While asking, the full list below replaces the quick chips. */}
      {!choosing && (
        <View style={styles.chips}>
          {c.chips.map((chip) => (
            <Chip
              key={chip.feeling}
              label={chip.label}
              onPress={() => router.push(resultsHref({ feelings: [chip.feeling], themes: [], needs: [] }))}
            />
          ))}
        </View>
      )}
      {choosing && (
        <View style={styles.closest}>
          <Text style={text.body} accessibilityLiveRegion="polite">
            {cl.closest}
          </Text>
          <View style={styles.chips}>
            {choices.map((cat) => (
              <Chip key={cat.id} label={cat.label} onPress={() => router.push(categoryHref(cat))} />
            ))}
          </View>
        </View>
      )}
      <BigButton label={c.find} disabled={!typed.trim()} onPress={find} />
      <Text style={text.note}>{c.typeNote}</Text>
      {/* Quiet, but always here: the direct way to emergency help. */}
      <Pressable
        onPress={() => router.push('/need-help')}
        accessibilityRole="button"
        accessibilityLabel={c.unsafe}
        accessibilityHint={c.unsafeHint}
        style={styles.unsafe}
      >
        <Text style={styles.unsafeText}>{c.unsafe}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: space.gap / 2 },
  soft: { color: colors.muted },
  input: {
    minHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.screen - 4,
    fontSize: type.body,
    fontFamily: fonts.regular,
    color: colors.text,
    textAlignVertical: 'top',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.gap / 2 + 2 },
  closest: { gap: space.gap / 2 + 2 },
  unsafe: { minHeight: 44, justifyContent: 'center', alignSelf: 'center' },
  unsafeText: { fontSize: type.small, fontFamily: fonts.medium, color: colors.muted, textDecorationLine: 'underline' },
});
