import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { type Contact, content } from '@/content/types';
import { callableNumber, openPhone } from '@/lib/phone';
import { colors, space, text } from '@/theme';

// S8
export default function TalkToSomeone() {
  const c = content.talkToSomeone;
  return (
    <Screen>
      <Text accessibilityRole="header" style={text.heading}>
        {c.title}
      </Text>
      <Text style={text.body}>{c.note}</Text>
      {c.contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
      <BigButton label={c.needHelpNow} onPress={() => router.push('/need-help')} />
    </Screen>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  const c = content.talkToSomeone;
  const number = callableNumber({ number: contact.phone, verified: contact.verified });
  const [failed, setFailed] = useState(false);
  const open = async (kind: 'tel' | 'sms') => {
    if (number) setFailed(!(await openPhone(kind, number)));
  };

  return (
    <View style={styles.card}>
      <Text style={[text.body, styles.name]}>{contact.name}</Text>
      <Text style={text.note}>
        {c.roles[contact.role]} · {contact.church}
      </Text>
      <Text style={text.body}>
        {c.canHelpWith}: {contact.canHelpWith}
      </Text>
      <Text style={text.body}>
        {c.cannotHelpWith}: {contact.cannotHelpWith}
      </Text>
      <BigButton label={c.call} a11yLabel={`${c.call} ${contact.name}`} disabled={!number} onPress={() => open('tel')} />
      <BigButton label={c.message} a11yLabel={`${c.message} ${contact.name}`} disabled={!number} onPress={() => open('sms')} />
      {!number && <Text style={text.note}>{c.pending}</Text>}
      {number && failed && (
        <Text selectable style={text.body}>
          {c.openFailed} {number}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.gap / 2, paddingVertical: space.gap, borderTopWidth: 1, borderTopColor: colors.muted },
  name: { fontWeight: '700' },
});
