import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { BreathPhase } from '@/content/types';
import { colors } from '@/theme';

const SMALL = 0.55;

type Props = { motion: BreathPhase['motion']; seconds: number; step: string; size: number };

// Grows on "in", rests on "hold", shrinks on "out". Decorative: the label and countdown carry the meaning.
// `step` changes on every new phase and on every restart after the phone was locked.
export function BreathingCircle({ motion, seconds, step, size }: Props) {
  const scale = useRef(new Animated.Value(SMALL)).current;

  useEffect(() => {
    if (motion === 'hold') return;
    // Start each phase from where it should begin, so a restart never jumps mid-way.
    scale.setValue(motion === 'grow' ? SMALL : 1);
    const anim = Animated.timing(scale, {
      toValue: motion === 'grow' ? 1 : SMALL,
      duration: seconds * 1000,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop(); // leaving the screen or the phase stops the animation
  }, [motion, seconds, step, scale]);

  return (
    <Animated.View
      testID="breathing-circle"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, transform: [{ scale }] }]}
    />
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.accent, alignSelf: 'center' },
});
