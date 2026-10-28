import { router } from 'expo-router';
import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, BackHandler, findNodeHandle, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { setWelcomeSeen } from '@/lib/storage';
import { space, text } from '@/theme';

// S1, two steps on one route. replace (never push) so the back gesture cannot return to the age gate.
export default function Welcome() {
  const c = content.welcome;
  const [askAge, setAskAge] = useState(false);
  const heading = useRef<ComponentRef<typeof Text>>(null);
  const stepChanged = useRef(false);

  // The whole screen changes between steps, so move screen-reader focus to the new heading.
  useEffect(() => {
    if (!stepChanged.current) {
      stepChanged.current = true;
      return; // first render: the screen reader starts at the top anyway
    }
    const tag = heading.current && findNodeHandle(heading.current);
    if (tag) AccessibilityInfo.setAccessibilityFocus(tag);
    else AccessibilityInfo.announceForAccessibility(askAge ? c.ageQuestion : c.title);
  }, [askAge, c.ageQuestion, c.title]);

  // Android back on the age question returns to the intro instead of closing the app. Stores nothing.
  useEffect(() => {
    if (!askAge) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setAskAge(false);
      return true;
    });
    return () => sub.remove();
  }, [askAge]);

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
        <Text ref={heading} accessibilityRole="header" style={text.heading}>
          {c.title}
        </Text>
        <Text style={text.body}>{c.body}</Text>
        {/* The safety pair is one thought, so it reads as one block, set apart. */}
        <View style={styles.safety}>
          <Text style={text.body}>{c.notEmergency}</Text>
          <Text style={text.body}>{c.inDanger}</Text>
        </View>
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
      <Text ref={heading} accessibilityRole="header" style={text.heading}>
        {c.ageQuestion}
      </Text>
      <Text style={text.note}>{c.answerStays}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safety: { gap: space.gap / 2, marginTop: space.gap },
});
