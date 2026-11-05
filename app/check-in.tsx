import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Chip, LogoRow } from '@/components/Bits';
import { Droplet } from '@/components/Droplet';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { meaningTags } from '@/lib/embedder';
import { isCrisis, type Tags, tagsFromText } from '@/lib/matching';
import { mergeTags } from '@/lib/meaning';
import { colors, fonts, radius, space, text, type } from '@/theme';

// Only tag ids travel to the results screen; what someone typed never leaves this screen.
const resultsHref = ({ feelings, themes, needs }: Tags) =>
  ({ pathname: '/results', params: { f: feelings.join(','), t: themes.join(','), n: needs.join(',') } }) as const;

// Home (v3): say it in your own words, or tap a chip. Nothing is saved or sent.
export default function CheckIn() {
  const c = content.checkIn;
  const [typed, setTyped] = useState('');

  const find = async () => {
    const said = typed;
    setTyped(''); // forget it straight away
    if (isCrisis(said)) return router.push('/need-help'); // safety first, before any model
    const words = tagsFromText(said);
    // The on-phone model adds tags by meaning; without it (Expo Go, loading, failure) keywords alone are used.
    const meaning = await meaningTags(said).catch(() => null);
    router.push(resultsHref(meaning ? mergeTags(words, meaning) : words));
  };

  return (
    <Screen>
      <LogoRow />
      <View style={styles.hero}>
        <Droplet size={130} />
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
      <View style={styles.chips}>
        {c.chips.map((chip) => (
          <Chip
            key={chip.feeling}
            label={chip.label}
            onPress={() => router.push(resultsHref({ feelings: [chip.feeling], themes: [], needs: [] }))}
          />
        ))}
      </View>
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
  unsafe: { minHeight: 44, justifyContent: 'center', alignSelf: 'center' },
  unsafeText: { fontSize: type.small, fontFamily: fonts.medium, color: colors.muted, textDecorationLine: 'underline' },
});
