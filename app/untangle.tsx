import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Chip } from '@/components/Bits';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { afterThat, thoughtParts } from '@/lib/untangle';
import { colors, fonts, radius, space, text, type } from '@/theme';

type Stage = 'intro' | 1 | 2 | 3 | 4 | 5 | 6 | 'summary';
type Mark = 'know' | 'guess';

// Untangle: Abel's counsellor-approved six steps, in the v3 look. Everything typed lives only in this
// screen's memory: never saved, never sent, gone when the student leaves or starts again.
export default function Untangle() {
  const u = content.untangle;
  const [stage, setStage] = useState<Stage>('intro');
  const [thought, setThought] = useState('');
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  const [more, setMore] = useState('');
  const [friend, setFriend] = useState('');
  const [balanced, setBalanced] = useState('');
  const [step, setStep] = useState('');
  const [when, setWhen] = useState<string | null>(null);

  const restart = () => {
    setThought('');
    setMarks({});
    setMore('');
    setFriend('');
    setBalanced('');
    setStep('');
    setWhen(null);
    setStage(1);
  };

  const back = () => {
    if (stage === 'intro') return router.back();
    if (stage === 'summary') return setStage(6);
    setStage(stage === 1 ? 'intro' : ((stage - 1) as Stage));
  };

  if (stage === 'intro') {
    return (
      <Screen back actions={<BigButton label={u.begin} onPress={() => setStage(1)} />}>
        <Text accessibilityRole="header" style={text.heading}>
          {u.title}
        </Text>
        <Text style={[text.body, styles.soft]}>{u.intro}</Text>
        <View style={styles.list}>
          {u.steps.map((s, i) => (
            <View key={s.title} style={styles.stageCard}>
              <View style={styles.number}>
                <Text style={styles.numberText}>{i + 1}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardBody}>{s.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </Screen>
    );
  }

  if (stage === 'summary') {
    const s = u.summary;
    return (
      <Screen
        back={back}
        actions={
          <>
            <BigButton label={u.done} onPress={() => router.replace('/finished')} />
            <BigButton secondary label={u.another} onPress={restart} />
          </>
        }
      >
        <Progress n={6} done />
        <Text accessibilityRole="header" style={text.heading}>
          {s.heading}
        </Text>
        <Row label={s.thought} value={thought.trim()} />
        <Row label={s.balanced} value={balanced.trim()} highlight />
        <Row label={when ? `${s.step} · ${when}` : s.step} value={step.trim()} />
        <Note>{s.returns}</Note>
        <Text style={text.note}>{s.help}</Text>
      </Screen>
    );
  }

  // Steps 1 to 6.
  const n = stage;
  const parts = thoughtParts(thought);
  const guesses = Object.values(marks).filter((m) => m === 'guess').length;
  const marked = Object.keys(marks).length > 0;
  const ready = { 1: !!thought.trim(), 2: true, 3: true, 4: !!friend.trim(), 5: !!balanced.trim(), 6: !!step.trim() }[n];
  const example = { 4: u.friend.example, 5: u.balanced.example, 6: u.nextStep.example }[n as 4 | 5 | 6];
  const fill = { 4: setFriend, 5: setBalanced, 6: setStep }[n as 4 | 5 | 6];
  const nextLabel = n === 2 ? u.stepBack.button : n === 6 ? u.nextStep.see : u.next;

  return (
    <Screen
      back={back}
      actions={
        <>
          {!!example && <BigButton secondary label={u.useExample} onPress={() => fill?.(stripDraft(example))} />}
          <BigButton
            label={nextLabel}
            disabled={!ready}
            onPress={() => setStage(n === 6 ? 'summary' : ((n + 1) as Stage))}
          />
        </>
      }
    >
      <Progress n={n} />

      {n === 1 && (
        <>
          <Title title={u.name.title} body={u.name.body} />
          <Field label={u.name.label} value={thought} onChange={setThought} placeholder={u.name.placeholder} />
          <Text style={text.note}>{u.name.examplesLabel}</Text>
          <View style={styles.list}>
            {u.name.examples.map((e) => (
              <Pressable
                key={e}
                onPress={() => {
                  setThought(e);
                  setMarks({});
                }}
                accessibilityRole="button"
                accessibilityLabel={e}
                style={({ pressed }) => [styles.example, pressed && styles.pressed]}
              >
                <Text style={text.body}>{e}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={text.note}>{u.name.note}</Text>
        </>
      )}

      {n === 2 && (
        <>
          <Title title={u.stepBack.title} body={u.stepBack.body} />
          <Defused prefix={u.stepBack.prefix} thought={thought} />
          <Text style={[text.body, styles.soft]}>{u.stepBack.further}</Text>
          <Defused prefix={u.stepBack.prefix2} thought={thought} />
          <Note>{u.stepBack.note}</Note>
        </>
      )}

      {n === 3 && (
        <>
          <Title title={u.knowGuess.title} body={u.knowGuess.body} />
          <View style={styles.list}>
            {parts.map((part, i) => (
              <View key={`${i}-${part}`} style={styles.part}>
                <Text style={text.body}>{part}</Text>
                <View style={styles.toggles}>
                  {(['know', 'guess'] as const).map((m) => (
                    <Chip
                      key={m}
                      label={m === 'know' ? u.knowGuess.know : u.knowGuess.guess}
                      a11yLabel={`${m === 'know' ? u.knowGuess.know : u.knowGuess.guess}: ${part}`}
                      selected={marks[i] === m}
                      onPress={() => setMarks({ ...marks, [i]: m })}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
          <Field label={u.knowGuess.moreLabel} value={more} onChange={setMore} placeholder={u.knowGuess.morePlaceholder} />
          {marked && (
            <Note>
              {guesses === 0
                ? u.knowGuess.allKnown
                : guesses === 1
                  ? u.knowGuess.guessOne
                  : u.knowGuess.guessMany.replace('{n}', String(guesses))}
            </Note>
          )}
        </>
      )}

      {n === 4 && (
        <>
          <Title title={u.friend.title} body={u.friend.body} />
          <View style={styles.quote}>
            <Text style={styles.quoteText}>{`“${thought.trim()}”`}</Text>
          </View>
          <Field label={u.friend.label} value={friend} onChange={setFriend} placeholder={u.friend.placeholder} />
        </>
      )}

      {n === 5 && (
        <>
          <Title title={u.balanced.title} body={u.balanced.body} />
          <Field label={u.balanced.label} value={balanced} onChange={setBalanced} placeholder={u.balanced.placeholder} />
        </>
      )}

      {n === 6 && (
        <>
          <Title title={u.nextStep.title} body={u.nextStep.body} />
          <Field label={u.nextStep.label} value={step} onChange={setStep} placeholder={u.nextStep.placeholder} />
          <Text style={styles.label}>{u.nextStep.whenLabel}</Text>
          <View style={styles.chips}>
            {u.nextStep.when.map((w) => (
              <Chip key={w} label={w} selected={when === w} onPress={() => setWhen(when === w ? null : w)} />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

// "Use example" fills the box with the example as shown, without its review label.
const stripDraft = (s: string) => {
  const t = s.replace(/^Draft:\s*/, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

function Progress({ n, done }: { n: number; done?: boolean }) {
  const u = content.untangle;
  return (
    <View style={styles.progressWrap}>
      {!done && <Text style={styles.stepOf}>{u.stepOf.replace('{n}', String(n))}</Text>}
      <View style={styles.track} accessibilityElementsHidden importantForAccessibility="no">
        <View style={[styles.bar, { width: `${((done ? 6 : n) / 6) * 100}%` }]} />
      </View>
    </View>
  );
}

function Title({ title, body }: { title: string; body: string }) {
  return (
    <>
      <Text accessibilityRole="header" style={text.heading}>
        {title}
      </Text>
      <Text style={[text.body, styles.soft]}>{body}</Text>
    </>
  );
}

function Field(props: { label: string; value: string; onChange: (s: string) => void; placeholder: string }) {
  return (
    <>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        accessibilityLabel={props.label}
        value={props.value}
        onChangeText={props.onChange}
        placeholder={props.placeholder}
        placeholderTextColor={colors.muted}
        multiline
        maxLength={400}
        style={styles.input}
      />
    </>
  );
}

function Defused({ prefix, thought }: { prefix: string; thought: string }) {
  return (
    <Text style={styles.defused}>
      <Text style={styles.highlight}>{prefix}</Text>
      {` ${afterThat(thought)}`}
    </Text>
  );
}

function Note({ children }: { children: string }) {
  return (
    <View style={styles.note}>
      <Text style={text.body}>{children}</Text>
    </View>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  if (!value) return null;
  return (
    <View style={[styles.row, highlight && styles.rowHighlight]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[text.body, styles.rowValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  soft: { color: colors.muted },
  flex: { flex: 1, gap: 2 },
  list: { gap: space.gap - 4 },
  pressed: { opacity: 0.85 },
  stageCard: {
    flexDirection: 'row',
    gap: space.gap,
    backgroundColor: colors.untangle,
    borderRadius: radius.row,
    padding: space.gap + 4,
  },
  number: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontSize: type.small, fontFamily: fonts.bold, color: colors.untangleInk },
  cardTitle: { fontSize: type.body, lineHeight: 24, fontFamily: fonts.medium, color: colors.text },
  cardBody: { fontSize: type.small, lineHeight: 20, fontFamily: fonts.regular, color: colors.muted },
  progressWrap: { gap: 8 },
  stepOf: { fontSize: type.small, fontFamily: fonts.medium, color: colors.untangleInk },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.untangle, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.untangleInk },
  label: { fontSize: type.small, fontFamily: fonts.medium, color: colors.text, marginTop: space.gap / 2 },
  input: {
    minHeight: 96,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.gap + 4,
    fontSize: type.body,
    fontFamily: fonts.regular,
    color: colors.text,
    textAlignVertical: 'top',
  },
  example: { backgroundColor: colors.surface, borderRadius: radius.row, padding: space.gap, minHeight: space.tap },
  defused: { fontSize: 22, lineHeight: 32, fontFamily: fonts.medium, color: colors.text },
  highlight: { backgroundColor: colors.untangle, color: colors.untangleInk },
  note: { borderLeftWidth: 4, borderLeftColor: colors.untangleInk, paddingLeft: space.gap, paddingVertical: 4 },
  part: { backgroundColor: colors.surface, borderRadius: radius.row, padding: space.gap, gap: space.gap / 2 },
  toggles: { flexDirection: 'row', gap: space.gap / 2, flexWrap: 'wrap' },
  quote: { backgroundColor: colors.untangle, borderRadius: radius.row, padding: space.gap + 4 },
  quoteText: { fontSize: 22, lineHeight: 30, fontFamily: fonts.medium, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.gap / 2 },
  row: { borderTopWidth: 1, borderTopColor: colors.line, paddingVertical: space.gap, gap: 4 },
  rowHighlight: { backgroundColor: colors.breathe, borderTopWidth: 0, borderRadius: radius.row, paddingHorizontal: space.gap },
  rowLabel: { fontSize: 13, fontFamily: fonts.medium, color: colors.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
  rowValue: { fontFamily: fonts.medium },
});
