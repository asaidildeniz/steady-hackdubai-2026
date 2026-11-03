import { router } from 'expo-router';
import { Text } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { text } from '@/theme';

// What's weighing on you? One button per topic. Nothing is saved.
export default function Topics() {
  const t = content.topics;
  return (
    <Screen>
      <Text accessibilityRole="header" style={text.heading}>
        {t.prompt}
      </Text>
      <Text style={text.body}>{t.intro}</Text>
      {t.list.map((topic) => (
        <BigButton
          key={topic.id}
          secondary
          label={topic.label}
          onPress={() => router.push({ pathname: '/topic', params: { id: topic.id } })}
        />
      ))}
      <BigButton secondary label={t.other} hint={t.otherHint} onPress={() => router.push('/talk-to-someone')} />
    </Screen>
  );
}
