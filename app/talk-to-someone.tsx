import { router } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { type Contact, content } from '@/content/types';
import { demo, demoContacts } from '@/lib/demo';
import { callableNumber, openPhone } from '@/lib/phone';
import { space, text } from '@/theme';

const numberOf = (p: Contact) => callableNumber({ number: p.phone, verified: p.verified });

// S8
export default function TalkToSomeone() {
  const c = content.talkToSomeone;
  // Demo mode swaps the placeholders for example contacts; a normal start shows content.json as written.
  const contacts = demo.on ? demoContacts() : (c.contacts ?? []);
  const nonePending = contacts.length > 0 && contacts.every((p) => !numberOf(p));
  return (
    <Screen>
      <Text accessibilityRole="header" style={text.heading}>
        {c.title}
      </Text>
      <Text style={text.body}>{c.note}</Text>
      {/* Safety guidance reads as body text, not as a muted aside. */}
      {nonePending && <Text style={text.body}>{c.pendingWhatNow}</Text>}
      {contacts.length === 0 && <Text style={text.note}>{c.noContacts}</Text>}
      <View style={styles.list}>
        {contacts.map((contact, i) => (
          <ContactCard
            key={`${contact.id}-${i}`}
            contact={contact}
            demoOnly={demo.on && 'tappable' in contact && contact.tappable === true}
          />
        ))}
      </View>
      {/* Quiet on purpose: the next calm step stays the main action, the crisis route stays in reach. */}
      <BigButton secondary label={c.needHelpNow} onPress={() => router.push('/need-help')} />
    </Screen>
  );
}

// demoOnly: tappable, but shows a note instead of dialling. Never has a number.
function ContactCard({ contact, demoOnly }: { contact: Contact; demoOnly?: boolean }) {
  const c = content.talkToSomeone;
  const number = demoOnly ? null : numberOf(contact);
  const live = demoOnly || !!number;
  const [failed, setFailed] = useState<string | null>(null);
  const open = async (kind: 'tel' | 'sms') => {
    if (demoOnly) {
      setFailed(content.demo.callNote);
      return AccessibilityInfo.announceForAccessibility(content.demo.callNote);
    }
    if (!number) return;
    if (await openPhone(kind, number)) return setFailed(null);
    const message = c.openFailed.replace('{number}', number);
    setFailed(message);
    AccessibilityInfo.announceForAccessibility(message);
  };
  // A disabled button says why, so a screen reader hears the reason before the dimmed control.
  const hint = live ? undefined : c.pending;
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
      {!live && <Text style={text.note}>{c.pending}</Text>}
      <BigButton
        label={c.call}
        a11yLabel={`${c.call} ${contact.name}`}
        hint={hint}
        disabled={!live}
        onPress={() => open('tel')}
      />
      <BigButton
        secondary
        label={c.message}
        a11yLabel={`${c.message} ${contact.name}`}
        hint={hint}
        disabled={!live}
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
