import { router } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { callableNumber, openPhone } from '@/lib/phone';
import { text } from '@/theme';

// Only verified, non-empty numbers survive. Unverified entries are not shown at all.
const callable = (entries: { label: string; number: string; verified: boolean }[]) =>
  entries.flatMap((e) => {
    const number = callableNumber(e);
    return number ? [{ label: e.label, number }] : [];
  });

function callableGroups() {
  const c = content.needHelp;
  return [
    { heading: c.emergencyHeading, entries: callable(c.emergencyNumbers) },
    { heading: c.helplinesHeading, entries: callable(c.helplines) },
    {
      heading: c.peopleHeading,
      entries: callable(
        content.talkToSomeone.contacts.map((p) => ({ label: p.name, number: p.phone, verified: p.verified })),
      ),
    },
  ].filter((g) => g.entries.length > 0);
}

// S9. No Need help pill here.
export default function NeedHelp() {
  const c = content.needHelp;
  const groups = callableGroups();
  const [failed, setFailed] = useState<string | null>(null);

  const call = async (number: string) => {
    if (await openPhone('tel', number)) return setFailed(null);
    const message = `${content.talkToSomeone.openFailed} ${number}`;
    setFailed(message);
    AccessibilityInfo.announceForAccessibility(message);
  };

  return (
    <Screen showNeedHelp={false}>
      <Text accessibilityRole="header" style={text.heading}>
        {c.title}
      </Text>
      <Text style={text.body}>{c.message}</Text>
      {groups.length === 0 && <Text style={text.note}>{c.pendingMessage}</Text>}
      {groups.map((g) => [
        <Text key={g.heading} accessibilityRole="header" style={[text.body, { fontWeight: '700' }]}>
          {g.heading}
        </Text>,
        ...g.entries.map((e) => (
          // The number is in the visible label, so it stays readable even if the dialler cannot open.
          // The spoken label spells the number out so it is not read as one large figure.
          <BigButton
            key={g.heading + e.label}
            label={`${e.label}: ${e.number}`}
            a11yLabel={`${c.call} ${e.label}, ${e.number.split('').join(' ')}`}
            hint={c.callHint}
            onPress={() => call(e.number)}
          />
        )),
      ])}
      {failed && (
        <Text selectable style={text.body}>
          {failed}
        </Text>
      )}
      {/* dismissTo returns to a screen already in the history instead of stacking a new one. */}
      <BigButton label={c.talk} onPress={() => router.dismissTo('/talk-to-someone')} />
      <BigButton label={c.home} onPress={() => router.dismissTo('/home')} />
    </Screen>
  );
}
