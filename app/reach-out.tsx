import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Chip } from '@/components/Bits';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { colors, fonts, radius, space, text, type } from '@/theme';

type Stage = 'moment' | 'needs' | 'message';
type Tone = 'casual' | 'open';

// The reviewer's "Draft:" label never goes into the message box, so it can never be sent.
const clean = (s: string) => {
  const t = s.replace(/^Draft:\s*/, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// The web can only share where the browser offers it; phones always have a share menu.
const canShare = Platform.OS !== 'web' || (typeof navigator !== 'undefined' && typeof navigator.share === 'function');

// Reach Out, adapted from Abel's self-care tools prototype: a short kind moment (Kristin Neff's
// Self-Compassion Break), then help with the words. What is written lives only in this screen's
// memory: never saved, and Steady never sends it. Send opens the phone's share menu.
export default function ReachOut() {
  const r = content.reachOut;
  const [stage, setStage] = useState<Stage>('moment');
  const [line, setLine] = useState(0);
  const [need, setNeed] = useState(0);
  const [tone, setTone] = useState<Tone>('casual');
  const [wording, setWording] = useState(0);
  const [message, setMessage] = useState('');

  const option = r.needs.options[need];
  const choose = (n: number, t: Tone, w: number) => {
    setNeed(n);
    setTone(t);
    setWording(w);
    setMessage(clean(r.needs.options[n][t][w]));
  };

  const back = () => {
    if (stage === 'message') return setStage('needs');
    if (stage === 'needs') {
      setLine(0);
      return setStage('moment');
    }
    router.back();
  };

  const send = () => {
    // The student picks the app and the person; dismissing the menu is fine too.
    Share.share({ message: message.trim() }).catch(() => {});
  };

  if (stage === 'moment') {
    const last = line === r.moment.lines.length - 1;
    const l = r.moment.lines[line];
    return (
      <Screen
        key="moment"
        back={back}
        actions={
          <>
            <BigButton
              label={last ? r.moment.continue : r.moment.next}
              onPress={() => (last ? setStage('needs') : setLine(line + 1))}
            />
            <BigButton secondary label={r.moment.skip} onPress={() => setStage('needs')} />
          </>
        }
      >
        <Text accessibilityRole="header" style={text.heading}>
          {r.moment.heading}
        </Text>
        <Text style={[text.body, styles.soft]}>{clean(r.moment.body)}</Text>
        <View style={styles.moment} accessibilityLiveRegion="polite">
          <Text style={styles.line}>{clean(l.text)}</Text>
          <Text style={[text.body, styles.centred, styles.soft]}>{clean(l.note)}</Text>
        </View>
        <View
          style={styles.dots}
          accessible
          accessibilityLabel={r.moment.lineOf.replace('{n}', String(line + 1)).replace('{total}', String(r.moment.lines.length))}
        >
          {r.moment.lines.map((_, i) => (
            <View key={i} style={[styles.dot, i <= line && styles.dotOn]} />
          ))}
        </View>
      </Screen>
    );
  }

  if (stage === 'needs') {
    return (
      <Screen key="needs" back={back}>
        <Text accessibilityRole="header" style={text.heading}>
          {r.needs.heading}
        </Text>
        <Text style={[text.body, styles.soft]}>{clean(r.needs.body)}</Text>
        <View style={styles.list}>
          {r.needs.options.map((o, i) => (
            <Pressable
              key={o.id}
              onPress={() => {
                choose(i, 'casual', 0);
                setStage('message');
              }}
              accessibilityRole="button"
              accessibilityLabel={o.label}
              accessibilityHint={clean(o.sub)}
              style={({ pressed }) => [styles.need, pressed && styles.pressed]}
            >
              <Text style={styles.needTitle}>{o.label}</Text>
              <Text style={styles.needSub}>{clean(o.sub)}</Text>
            </Pressable>
          ))}
        </View>
      </Screen>
    );
  }

  const list = option[tone];
  return (
    <Screen
      key="message"
      back={back}
      actions={
        <>
          {canShare && (
            <BigButton label={r.message.send} hint={r.message.sendHint} disabled={!message.trim()} onPress={send} />
          )}
          <BigButton secondary label={r.message.back} onPress={() => setStage('needs')} />
        </>
      }
    >
      <Chip label={option.label} />
      <Text accessibilityRole="header" style={text.heading}>
        {r.message.heading}
      </Text>
      <Text style={[text.body, styles.soft]}>{clean(r.message.body)}</Text>

      <Text style={styles.label}>{r.message.toneLabel}</Text>
      <View style={styles.chips}>
        {(['casual', 'open'] as const).map((t) => (
          <Chip key={t} label={r.message[t]} selected={tone === t} onPress={() => choose(need, t, 0)} />
        ))}
      </View>

      <Text style={styles.label}>{r.message.label}</Text>
      <TextInput
        accessibilityLabel={r.message.label}
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={600}
        style={styles.input}
      />
      <View style={styles.wordingRow}>
        <Text style={text.note}>
          {r.message.wordingOf.replace('{n}', String(wording + 1)).replace('{total}', String(list.length))}
        </Text>
        <Chip label={r.message.another} onPress={() => choose(need, tone, (wording + 1) % list.length)} />
      </View>
      <Text style={text.note}>{r.message.note}</Text>

      <View style={styles.tip}>
        <Text style={text.body}>{clean(r.message.who)}</Text>
      </View>
      <Text style={text.note}>{clean(r.message.help)}</Text>
      <BigButton secondary compact label={r.message.talk} onPress={() => router.push('/talk-to-someone')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  soft: { color: colors.muted },
  centred: { textAlign: 'center' },
  pressed: { opacity: 0.85 },
  list: { gap: space.gap - 4 },
  moment: {
    backgroundColor: colors.reachOut,
    borderRadius: radius.card,
    padding: space.screen,
    gap: space.gap,
    minHeight: 220,
    justifyContent: 'center',
  },
  line: { fontSize: 26, lineHeight: 34, fontFamily: fonts.medium, color: colors.text, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.reachOut },
  dotOn: { backgroundColor: colors.reachOutInk },
  need: {
    backgroundColor: colors.reachOut,
    borderRadius: radius.row,
    padding: space.gap + 4,
    gap: 2,
    minHeight: space.tap,
  },
  needTitle: { fontSize: type.body, lineHeight: 24, fontFamily: fonts.medium, color: colors.text },
  needSub: { fontSize: type.small, lineHeight: 20, fontFamily: fonts.regular, color: colors.muted },
  label: { fontSize: type.small, fontFamily: fonts.medium, color: colors.text, marginTop: space.gap / 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.gap / 2 },
  input: {
    minHeight: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.gap + 4,
    fontSize: type.body,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colors.text,
    textAlignVertical: 'top',
  },
  wordingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.gap, flexWrap: 'wrap' },
  tip: { borderLeftWidth: 4, borderLeftColor: colors.reachOutInk, paddingLeft: space.gap, paddingVertical: 4 },
});
