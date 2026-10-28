import { router } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { type Contact, content } from '@/content/types';
import { callableNumber, openPhone } from '@/lib/phone';
import { space, text } from '@/theme';

const numberOf = (p: Contact) => callableNumber({ number: p.phone, verified: p.verified });

// S8
export default function TalkToSomeone() {
  const c = content.talkToSomeone;
  const contacts = c.contacts ?? [];
  const nonePending = contacts.length > 0 && contacts.every((p) => !numberOf(p));
  return (
    <Screen>
      <Text accessibilityRole="header" style={text.heading}>
        {c.title}
      </Text>
      <Text style={text.body}>{c.note}</Text>
      {nonePending && <Text style={text.note}>{c.pendingWhatNow}</Text>}
      {contacts.length === 0 && <Text style={text.note}>{c.noContacts}</Text>}
      <View style={styles.list}>
        {contacts.map((contact, i) => (
          <ContactCard key={`${contact.id}-${i}`} contact={contact} />
        ))}
      </View>
      {/* Quiet on purpose: the next calm step stays the main action, the crisis route stays in reach. */}
      <BigButton secondary label={c.needHelpNow} onPress={() => router.push('/need-help')} />
    </Screen>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  const c = content.talkToSomeone;
  const number = numberOf(contact);
  const [failed, setFailed] = useState<string | null>(null);
  const open = async (kind: 'tel' | 'sms') => {
    if (!number) return;
    if (await openPhone(kind, number)) return setFailed(null);
    const message = c.openFailed.replace('{number}', number);
    setFailed(message);
    AccessibilityInfo.announceForAccessibility(message);
  };
  // A disabled button says why, so a screen reader hears the reason before the dimmed control.
  const hint = number ? undefined : c.pending;
  // An unknown role is shown as written; empty parts are skipped so no stray comma appears.
  const about = [c.roles[contact.role] ?? contact.role, contact.church].filter(Boolean).join(', ');

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={text.title}>
        {contact.name}
      </Text>
      {!!about && <Text style={text.note}>{about}</Text>}
      {!!contact.canHelpWith && (
        <Text style={text.body}>
          <Text style={text.note}>{c.canHelpWith}: </Text>
          {contact.canHelpWith}
        </Text>
      )}
      {!!contact.cannotHelpWith && (
        <Text style={text.body}>
          <Text style={text.note}>{c.cannotHelpWith}: </Text>
          {contact.cannotHelpWith}
        </Text>
      )}
      {!number && <Text style={text.note}>{c.pending}</Text>}
      <BigButton
        label={c.call}
        a11yLabel={`${c.call} ${contact.name}`}
        hint={hint}
        disabled={!number}
        onPress={() => open('tel')}
      />
      <BigButton
        secondary
        label={c.message}
        a11yLabel={`${c.message} ${contact.name}`}
        hint={hint}
        disabled={!number}
        onPress={() => open('sms')}
      />
      {failed && (
        <Text selectable style={text.body}>
          {failed}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.screen * 2, paddingVertical: space.gap },
  card: { gap: space.gap / 2 },
});
