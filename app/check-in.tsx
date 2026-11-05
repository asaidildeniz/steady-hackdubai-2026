import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { meaningTags } from '@/lib/embedder';
import { isCrisis, type Tags, tagsFromText } from '@/lib/matching';
import { mergeTags } from '@/lib/meaning';
import { colors, space, text, type } from '@/theme';

// Only tag ids travel to the results screen; what someone typed never leaves this screen.
const resultsHref = ({ feelings, themes, needs }: Tags) =>
  ({ pathname: '/results', params: { f: feelings.join(','), t: themes.join(','), n: needs.join(',') } }) as const;

// S4, after Abel's plan: tap a feeling, or say it in your own words. Nothing is saved or sent.
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
    <Screen
      actions={
        <BigButton secondary label={c.unsafe} hint={c.unsafeHint} onPress={() => router.push('/need-help')} />
      }
    >
      <Text accessibilityRole="header" style={text.heading}>
        {c.prompt}
      </Text>
      <Text style={text.note}>{c.feelingsHint}</Text>
      {content.taxonomy.feelings.map((f) => (
        <BigButton
          key={f.id}
          secondary
          label={f.label}
          onPress={() => router.push(resultsHref({ feelings: [f.id], themes: [], needs: [] }))}
        />
      ))}
      <Text style={text.title}>{c.typeLabel}</Text>
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
      <Text style={text.note}>{c.typeNote}</Text>
      <BigButton label={c.find} disabled={!typed.trim()} onPress={find} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: space.tap * 2,
    borderWidth: 2,
    borderColor: colors.text,
    borderRadius: 16,
    padding: space.gap,
    fontSize: type.body,
    color: colors.text,
    textAlignVertical: 'top',
  },
});
