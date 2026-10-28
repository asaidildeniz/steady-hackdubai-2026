import { router } from 'expo-router';
import { Text } from 'react-native';
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
          // The number is in the label, so it stays readable even if the dialler cannot open.
          <BigButton key={g.heading + e.label} label={`${e.label}: ${e.number}`} onPress={() => openPhone('tel', e.number)} />
        )),
      ])}
      <BigButton label={c.talk} onPress={() => router.push('/talk-to-someone')} />
      <BigButton label={c.back} onPress={() => router.replace('/home')} />
    </Screen>
  );
}
