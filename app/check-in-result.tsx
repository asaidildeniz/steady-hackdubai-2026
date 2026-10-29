import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { text } from '@/theme';

// S5a (kind) and S5b (gentle) on one route.
export default function CheckInResult() {
  const { group } = useLocalSearchParams<{ group: string }>();
  if (group !== 'kind' && group !== 'gentle') return <Redirect href="/home" />;

  const c = content.results[group];
  const kind = group === 'kind';
  return (
    <Screen
      actions={
        <>
          <BigButton
            label={c.primary}
            onPress={() => (kind ? router.dismissTo('/home') : router.push('/breathing'))}
          />
          {/* One yellow action per screen; the other choice is outlined. */}
          <BigButton
            secondary
            label={c.secondary}
            onPress={() => router.push(kind ? '/breathing' : '/talk-to-someone')}
          />
        </>
      }
    >
      {/* The only text here, so screen readers can jump to it as the heading. */}
      <Text accessibilityRole="header" style={text.body}>
        {c.message}
      </Text>
    </Screen>
  );
}
