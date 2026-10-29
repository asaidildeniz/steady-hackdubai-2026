import { router, useFocusEffect } from 'expo-router';
import { type ComponentRef, useCallback, useEffect, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Text } from 'react-native';
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
  const question = useRef<ComponentRef<typeof Text>>(null);
  const answered = useRef(false); // the first answer wins; a fast second tap does nothing
  const options = c.options.filter((o) => o.label?.trim()); // content.json is hand-edited

  // Back from Talk to someone returns to this same screen, so the answers must work again.
  useFocusEffect(
    useCallback(() => {
      answered.current = false;
    }, []),
  );

  // Start screen readers on the question, not on the Need help pill, once the screen has slid in.
  useEffect(() => {
    const id = setTimeout(() => {
      const tag = question.current && findNodeHandle(question.current);
      if (tag) AccessibilityInfo.setAccessibilityFocus(tag);
      else AccessibilityInfo.announceForAccessibility(c.prompt);
    }, 500);
    return () => clearTimeout(id);
  }, [c.prompt]);

  const answer = (next: FinishedOption['next']) => {
    if (answered.current) return;
    answered.current = true;
    go(next);
  };

  return (
    <Screen
      // Equal weight, like the check-in moods: no answer to a feelings question is the expected one.
      actions={options.map((o, i) => (
        <BigButton key={`${o.label}-${i}`} label={o.label} hint={o.hint || undefined} onPress={() => answer(o.next)} />
      ))}
    >
      {!!c.message?.trim() && <Text style={text.note}>{c.message}</Text>}
      <Text ref={question} accessibilityRole="header" style={text.heading}>
        {c.prompt}
      </Text>
    </Screen>
  );
}
