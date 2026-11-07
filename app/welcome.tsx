import { router } from 'expo-router';
import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, BackHandler, findNodeHandle, Platform, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Chip, LogoRow } from '@/components/Bits';
import { LivingDroplet } from '@/components/BreathOrb';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { setWelcomeSeen } from '@/lib/storage';
import { colors, space, text } from '@/theme';

// S1, two steps on one route. replace (never push) so the back gesture cannot return to the age gate.
export default function Welcome() {
  const c = content.welcome;
  const [askAge, setAskAge] = useState(false);
  const heading = useRef<ComponentRef<typeof Text>>(null);
  const stepChanged = useRef(false);
  const answered = useRef(false); // the first answer wins; a fast second tap does nothing

  // The whole screen changes between steps, so move screen-reader focus to the new heading.
  useEffect(() => {
    if (!stepChanged.current) {
      stepChanged.current = true;
      return; // first render: the screen reader starts at the top anyway
    }
    const tag = Platform.OS !== 'web' && heading.current && findNodeHandle(heading.current);
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
    if (answered.current) return;
    answered.current = true;
    try {
      await setWelcomeSeen(); // the only value Steady ever saves
    } catch {
      // Not saved: the age question simply appears again next launch.
    }
    router.replace('/home');
  };

  const underAge = () => {
    if (answered.current) return;
    answered.current = true; // and nothing is written
    router.replace('/adults-only');
  };

  if (!askAge) {
    return (
      <Screen calm actions={<BigButton label={c.continue} onPress={() => setAskAge(true)} />}>
        <LogoRow />
        <View style={styles.hero}>
          <LivingDroplet size={190} />
        </View>
        <Text ref={heading} accessibilityRole="header" style={[text.heading, styles.center]}>
          {c.title}
        </Text>
        {!!c.body && <Text style={[text.body, styles.center, styles.soft]}>{c.body}</Text>}
        {/* Honest up front: what Steady is based on, and that it is not emergency care. */}
        <View style={styles.notes}>
          {!!c.basis && <Text style={[text.note, styles.center]}>{c.basis}</Text>}
          {!!c.notEmergency && <Text style={[text.note, styles.center]}>{c.notEmergency}</Text>}
          {!!c.inDanger && <Text style={[text.note, styles.center]}>{c.inDanger}</Text>}
        </View>
      </Screen>
    );
  }

  // The age question. Under 18 writes nothing; the round Back returns to step 1 (iPhone has no back button here).
  return (
    <Screen
      calm
      back={() => setAskAge(false)}
      actions={
        <>
          <BigButton label={c.adult} onPress={adult} />
          <BigButton secondary label={c.underAge} onPress={underAge} />
        </>
      }
    >
      <View style={styles.hero}>
        <LivingDroplet size={110} />
      </View>
      <View style={styles.tagRow}>
        <Chip label={c.ageTag} />
      </View>
      <Text ref={heading} accessibilityRole="header" style={[text.heading, styles.center]}>
        {c.ageQuestion}
      </Text>
      {!!c.ageBody && <Text style={[text.body, styles.center, styles.soft]}>{c.ageBody}</Text>}
      {!!c.answerStays && <Text style={[text.note, styles.center]}>{c.answerStays}</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: space.gap },
  center: { textAlign: 'center' },
  soft: { color: colors.muted },
  notes: { gap: space.gap / 4, marginTop: space.gap / 2 },
  tagRow: { alignItems: 'center' },
});
