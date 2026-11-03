import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { text } from '@/theme';

// One support topic. The faith part opens on request and is forgotten when the screen closes.
export default function Topic() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showFaith, setShowFaith] = useState(false);
  const t = content.topics;
  const topic = t.list.find((x) => x.id === id);
  if (!topic) return <Redirect href="/topics" />;

  return (
    <Screen
      actions={
        <>
          <BigButton label={t.breathe} onPress={() => router.push('/breathing')} />
          <BigButton secondary label={t.talk} onPress={() => router.push('/talk-to-someone')} />
        </>
      }
    >
      <Text accessibilityRole="header" style={text.heading}>
        {topic.label}
      </Text>
      <Text style={text.body}>{topic.opening}</Text>
      <Text accessibilityRole="header" style={text.title}>
        {t.tryThis}
      </Text>
      {topic.tips.map((tip) => (
        <Text key={tip} style={text.body}>
          {`•  ${tip}`}
        </Text>
      ))}
      {showFaith ? (
        <Text style={text.body}>{topic.faith}</Text>
      ) : (
        <BigButton secondary label={t.faithShow} hint={t.faithHint} onPress={() => setShowFaith(true)} />
      )}
      <Text style={text.note}>{t.reachOut}</Text>
      {/* Safety guidance reads as body text, not as a muted aside. */}
      <Text style={text.body}>{t.urgent}</Text>
      <Text style={text.note}>{t.disclaimer}</Text>
    </Screen>
  );
}
