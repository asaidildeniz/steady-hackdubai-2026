import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { content } from '@/content/types';
import { embedderStatus, explain, goldenReport } from '@/lib/embedder';
import { colors, space, text, type } from '@/theme';

const THRESHOLDS = [0.3, 0.33, 0.36, 0.4, 0.45];

// Demo screen only: shows whether the on-phone model loaded, and what a test sentence matches.
export function ModelCheck() {
  const c = content.demo.modelCheck;
  const [status, setStatus] = useState(embedderStatus());
  const [sentence, setSentence] = useState('');
  const [result, setResult] = useState<string[] | null>(null);
  const [report, setReport] = useState<string[] | null>(null);

  const line = (() => {
    if (status.state === 'ready')
      return c.states.ready.replace('{seconds}', String(status.seconds)).replace('{phrases}', String(status.phrases));
    if (status.state === 'failed') return c.states.failed.replace('{error}', status.error);
    return c.states[status.state];
  })();

  const check = async () => {
    const r = await explain(sentence).catch(() => null);
    setStatus(embedderStatus());
    if (!r) return setResult([c.unavailable]);
    const tags = [...r.tags.feelings, ...r.tags.themes, ...r.tags.needs].join(', ') || c.none;
    const top = r.top.map((t) => `${t.id} ${t.score.toFixed(2)}${t.phrase ? ` ("${t.phrase}")` : ''}`).join(', ');
    setResult([c.tags.replace('{tags}', tags), c.top.replace('{top}', top)]);
  };

  const runGolden = async () => {
    setReport([c.states.loading]);
    const current = content.matching.meaningThreshold;
    const r = await goldenReport(THRESHOLDS, current).catch(() => null);
    setStatus(embedderStatus());
    if (!r) return setReport([c.unavailable]);
    const row = (g: (typeof r.rows)[number]) =>
      c.goldenRow
        .replace('{t}', g.threshold.toFixed(2))
        .replace('{hits}', String(g.hits))
        .replace('{total}', String(g.total))
        .replace('{alarms}', String(g.falseAlarms))
        .replace('{neutral}', String(g.neutral)) + (g.threshold === current ? ` ${c.current}` : '');
    const at = current.toFixed(2);
    setReport([
      ...r.rows.map(row),
      ...(r.misses.length ? [c.missesHeading.replace('{t}', at), ...r.misses.map((s) => `• ${s}`)] : []),
      ...(r.alarms.length ? [c.alarmsHeading.replace('{t}', at), ...r.alarms.map((s) => `• ${s}`)] : []),
    ]);
  };

  return (
    <>
      <Text accessibilityRole="header" style={text.title}>
        {c.heading}
      </Text>
      <Text style={text.body}>{line}</Text>
      <BigButton secondary label={c.refresh} onPress={() => setStatus(embedderStatus())} />
      <BigButton secondary label={c.golden} onPress={runGolden} />
      {report?.map((r, i) => (
        <Text key={`${i}-${r}`} style={text.note}>
          {r}
        </Text>
      ))}
      <TextInput
        accessibilityLabel={c.tryLabel}
        placeholder={c.tryLabel}
        placeholderTextColor={colors.muted}
        value={sentence}
        onChangeText={setSentence}
        style={styles.input}
      />
      <BigButton secondary label={c.run} disabled={!sentence.trim()} onPress={check} />
      {result?.map((r) => (
        <Text key={r} style={text.note}>
          {r}
        </Text>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: space.tap,
    borderWidth: 2,
    borderColor: colors.text,
    borderRadius: 16,
    paddingHorizontal: space.gap,
    fontSize: type.body,
    color: colors.text,
  },
});
