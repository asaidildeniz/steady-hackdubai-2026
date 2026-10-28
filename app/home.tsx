import { router } from 'expo-router';
import { Text } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { text } from '@/theme';

// S3. No name, date, streak or greeting that depends on past use.
export default function Home() {
  const c = content.home;
  return (
    <Screen>
      <Text accessibilityRole="header" style={text.heading}>
        {c.title}
      </Text>
      <BigButton label={c.checkIn} onPress={() => router.push('/check-in')} />
      <BigButton label={c.calm} onPress={() => router.push('/breathing')} />
      <BigButton label={c.talk} onPress={() => router.push('/talk-to-someone')} />
    </Screen>
  );
}
