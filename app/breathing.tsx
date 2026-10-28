import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { BreathingCircle } from '@/components/BreathingCircle';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { cycleCount, stepAt, valid } from '@/lib/breathing';
import { space, text } from '@/theme';

// S6. Fully offline: a one-second timer and React Native's Animated, nothing else.
export default function Breathing() {
  useKeepAwake(); // only while this screen is open
  const c = content.breathing;
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [restarts, setRestarts] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { width, fontScale } = useWindowDimensions();
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

  // Locking the phone pauses; coming back restarts the current phase, so the circle and countdown agree.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setElapsed((e) => {
          const at = stepAt(c.phases, c.cycles, e);
          return at ? e - (at.phase.seconds - at.secondsLeft) : e;
        });
        setRestarts((r) => r + 1);
        setPaused(false);
      } else {
        setPaused(true);
      }
    });
    return () => sub.remove();
  }, [c.phases, c.cycles]);

  // Cleared on pause and on unmount, so leaving early can never navigate later.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);

  // replace, so back from Finished does not drop someone mid-exercise.
  useEffect(() => {
    if (done) router.replace('/finished');
  }, [done]);

  // Announce each new phase, not every second.
  const label = step?.phase.label;
  useEffect(() => {
    if (label) AccessibilityInfo.announceForAccessibility(label);
  }, [step?.index, label]);

  // Smaller on narrow phones and at large text, so the words still fit above Stop.
  const size = Math.min(220, width * 0.55) * (fontScale > 1.3 ? 0.7 : 1);
  const perRound = valid(c.phases).length || 1;
  const progress = step
    ? c.progress
        .replace('{current}', String(Math.floor(step.index / perRound) + 1))
        .replace('{total}', String(cycleCount(c.cycles)))
    : '';

  return (
    <Screen pinActions actions={<BigButton secondary label={c.stop} onPress={() => router.dismissTo('/home')} />}>
      <Text accessibilityRole="header" style={[text.title, styles.centred]}>
        {c.title}
      </Text>
      {!!c.intro && <Text style={[text.note, styles.centred]}>{c.intro}</Text>}
      {step && (
        <View style={styles.exercise}>
          {!reduceMotion && (
            <BreathingCircle
              motion={step.phase.motion}
              seconds={step.phase.seconds}
              step={`${step.index}-${restarts}`}
              size={size}
            />
          )}
          <Text style={text.title}>{step.phase.label}</Text>
          <Text style={text.heading}>{String(step.secondsLeft)}</Text>
          <Text style={text.note}>{progress}</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centred: { textAlign: 'center' },
  exercise: { alignItems: 'center', gap: space.gap, paddingVertical: space.screen },
});
