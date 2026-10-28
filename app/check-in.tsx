import { router } from 'expo-router';
import { Text } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { moodHref } from '@/lib/moods';
import { text } from '@/theme';

// S4. Tapping a mood navigates at once. Nothing is saved or logged.
export default function CheckIn() {
  return (
    <Screen>
      <Text accessibilityRole="header" style={text.heading}>
        {content.checkIn.prompt}
      </Text>
      {content.checkIn.moods.map((mood) => (
        <BigButton key={mood.id} label={mood.label} onPress={() => router.push(moodHref(mood.group))} />
      ))}
    </Screen>
  );
}
