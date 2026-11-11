import { router } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { demo } from '@/lib/demo';
import { callableNumber, openPhone } from '@/lib/phone';
import { colors, fonts, radius, space, text, type } from '@/theme';

// Only verified, non-empty numbers survive. Unverified entries are not shown at all.
const callable = (entries: { label: string; number: string; verified: boolean; when?: string }[]) =>
  entries.flatMap((e) => {
    const number = callableNumber(e);
    return number ? [{ label: e.label, number, when: e.when }] : [];
  });

function callableGroups() {
  const c = content.needHelp;
  return [
    { heading: c.emergencyHeading, entries: callable(c.emergencyNumbers), emergency: true },
    { heading: c.helplinesHeading, entries: callable(c.helplines) },
    {
      heading: c.peopleHeading,
      entries: callable(
        content.talkToSomeone.contacts.map((p) => ({ label: p.name, number: p.phone, verified: p.verified })),
      ),
    },
  ].filter((g) => g.entries.length > 0);
}

// S9. The one screen without the Need help now link, since this is where it leads.
export default function NeedHelp() {
  const c = content.needHelp;
  const groups = callableGroups();
  const [failed, setFailed] = useState<string | null>(null);

  const call = async (number: string) => {
    // A live demo must never ring the police or an ambulance.
    if (demo.on) {
      setFailed(content.demo.callNote);
      return AccessibilityInfo.announceForAccessibility(content.demo.callNote);
    }
    if (await openPhone('tel', number)) return setFailed(null);
    const message = content.talkToSomeone.openFailed.replace('{number}', number);
    setFailed(message);
    AccessibilityInfo.announceForAccessibility(message);
  };

  return (
    <Screen noHelpLink>
      <Text accessibilityRole="header" style={text.heading}>
        {c.title}
      </Text>
      <Text style={text.body}>{c.message}</Text>
      {groups.length === 0 && <Text style={text.note}>{c.pendingMessage}</Text>}
      {groups.map((g) => [
        <Text key={g.heading} accessibilityRole="header" style={[text.body, { fontWeight: '700' }]}>
          {g.heading}
        </Text>,
        ...g.entries.map((e) =>
          // The number is in the visible label, so it stays readable even if the dialler cannot open.
          // The spoken label spells the number out so it is not read as one large figure.
          'emergency' in g ? (
            <EmergencyCard key={e.label} label={e.label} number={e.number} when={e.when} onPress={() => call(e.number)} />
          ) : (
            <BigButton
              key={g.heading + e.label}
              label={`${e.label}: ${e.number}`}
              a11yLabel={`${c.call} ${e.label}, ${e.number.split('').join(' ')}`}
              hint={c.callHint}
              onPress={() => call(e.number)}
            />
          ),
        ),
      ])}
      {failed && (
        <Text selectable style={text.body}>
          {failed}
        </Text>
      )}
      {/* dismissTo returns to a screen already in the history instead of stacking a new one. */}
      {/* Quieter than the emergency numbers, so the eye goes to those first. */}
      <BigButton secondary label={c.talk} onPress={() => router.dismissTo('/talk-to-someone')} />
      <BigButton secondary label={c.home} onPress={() => router.dismissTo('/home')} />
    </Screen>
  );
}

// Option D (11 Nov): who to call and why on the left, the number to tap in red on the right.
// The whole card is the button, so the tap target is large.
function EmergencyCard(props: { label: string; number: string; when?: string; onPress: () => void }) {
  const c = content.needHelp;
  return (
    <Pressable
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityLabel={`${c.call} ${props.label}, ${props.number.split('').join(' ')}`}
      accessibilityHint={props.when ?? c.callHint}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{props.label}</Text>
        {!!props.when && <Text style={styles.cardWhen}>{props.when}</Text>}
      </View>
      <View style={styles.callPill}>
        <Text style={styles.callNumber}>{props.number}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.gap,
    backgroundColor: colors.surface,
    borderRadius: radius.row,
    padding: space.gap + 2,
    minHeight: space.tap + 20,
  },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: type.body, lineHeight: 24, fontFamily: fonts.bold, color: colors.text },
  cardWhen: { fontSize: type.small, lineHeight: 20, fontFamily: fonts.regular, color: colors.muted },
  callPill: {
    minWidth: 76,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callNumber: { fontSize: 20, fontFamily: fonts.bold, color: colors.onEmergency, fontVariant: ['tabular-nums'] },
  pressed: { opacity: 0.85 },
});
