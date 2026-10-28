import { router } from 'expo-router';
import { Text } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content, type FinishedOption } from '@/content/types';
import { text } from '@/theme';

// Routing lives in each option's `next` in content.json; anything unexpected goes to a person, the safe side.
const go = (next: FinishedOption['next']) =>
  next === 'home' ? router.dismissTo('/home') : router.push('/talk-to-someone');

// S7. The answer is not saved anywhere.
export default function Finished() {
  const c = content.finished;
  return (
    <Screen
      actions={c.options.map((o, i) => (
        <BigButton key={`${o.label}-${i}`} secondary={i > 0} label={o.label} onPress={() => go(o.next)} />
      ))}
    >
      <Text accessibilityRole="header" style={text.heading}>
        {c.prompt}
      </Text>
    </Screen>
  );
}
