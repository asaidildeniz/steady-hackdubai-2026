import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { BreathingCircle } from '@/components/BreathingCircle';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { stepAt } from '@/lib/breathing';
import { space, text } from '@/theme';

// S6. Fully offline: a one-second timer and React Native's Animated, nothing else.
export default function Breathing() {
  const c = content.breathing;
  const [elapsed, setElapsed] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const step = stepAt(c.phases, c.cycles, elapsed);
  const done = step === null;

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => alive && setReduceMotion(on))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  // Cleared on unmount, so leaving early can never navigate later.
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // replace, so back from Finished does not drop someone mid-exercise.
  useEffect(() => {
    if (done) router.replace('/finished');
  }, [done]);

  // Announce each new phase, not every second.
  const label = step?.phase.label;
  useEffect(() => {
    if (label) AccessibilityInfo.announceForAccessibility(label);
  }, [step?.index, label]);

  return (
    <Screen actions={<BigButton secondary label={c.stop} onPress={() => router.dismissTo('/home')} />}>
      <Text accessibilityRole="header" style={text.heading}>
        {c.title}
      </Text>
      {step && (
        <View style={styles.centre}>
          {!reduceMotion && (
            <BreathingCircle motion={step.phase.motion} seconds={step.phase.seconds} step={step.index} />
          )}
          <Text style={text.title}>{step.phase.label}</Text>
          <Text style={text.heading}>{String(step.secondsLeft)}</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', gap: space.gap, paddingVertical: space.screen },
});
