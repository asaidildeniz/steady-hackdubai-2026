import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { text } from '@/theme';

// S2. No buttons by spec; the help text is the way forward. Stores nothing.
// Reached with replace, so it is the only screen in the history: Android back closes the app, it cannot loop.
// If the reviewer adds numbers here, they must go through callableNumber like S9.
export default function AdultsOnly() {
  const c = content.adultsOnly;
  return (
    <Screen showNeedHelp={false}>
      <Text accessibilityRole="header" style={text.heading}>
        {c.message}
      </Text>
      <Text style={text.body}>{c.whereToGetHelp}</Text>
      {!!c.inDanger?.trim() && <Text style={text.body}>{c.inDanger}</Text>}
    </Screen>
  );
}
