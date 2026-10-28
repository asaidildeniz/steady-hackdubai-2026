import { router } from 'expo-router';
import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Text } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { setWelcomeSeen } from '@/lib/storage';
import { text } from '@/theme';

// S1, two steps on one route. replace (never push) so the back gesture cannot return to the age gate.
export default function Welcome() {
  const c = content.welcome;
  const [askAge, setAskAge] = useState(false);
  const question = useRef<ComponentRef<typeof Text>>(null);

  // The whole screen changes on Continue, so move screen-reader focus to the question.
  useEffect(() => {
    if (!askAge) return;
    const tag = question.current && findNodeHandle(question.current);
    if (tag) AccessibilityInfo.setAccessibilityFocus(tag);
    else AccessibilityInfo.announceForAccessibility(c.ageQuestion);
  }, [askAge, c.ageQuestion]);

  const adult = async () => {
    try {
      await setWelcomeSeen(); // the only value Steady ever saves
    } catch {
      // Not saved: the age question simply appears again next launch.
    }
    router.replace('/home');
  };

  if (!askAge) {
    return (
      <Screen showNeedHelp={false} actions={<BigButton label={c.continue} onPress={() => setAskAge(true)} />}>
        <Text accessibilityRole="header" style={text.heading}>
          {c.title}
        </Text>
        <Text style={text.body}>{c.body}</Text>
        <Text style={text.body}>{c.notEmergency}</Text>
        <Text style={text.body}>{c.inDanger}</Text>
      </Screen>
    );
  }

  // Both answers look the same so neither is nudged. Under 18 writes nothing.
  return (
    <Screen
      showNeedHelp={false}
      actions={
        <>
          <BigButton secondary label={c.adult} onPress={adult} />
          <BigButton secondary label={c.underAge} onPress={() => router.replace('/adults-only')} />
        </>
      }
    >
      <Text ref={question} accessibilityRole="header" style={text.heading}>
        {c.ageQuestion}
      </Text>
      <Text style={text.note}>{c.answerStays}</Text>
    </Screen>
  );
}
