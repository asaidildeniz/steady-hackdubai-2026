import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { BreathPhase } from '@/content/types';
import { colors } from '@/theme';

const SMALL = 0.55;
const SIZE = 220;

type Props = { motion: BreathPhase['motion']; seconds: number; step: number };

// Grows on "in", rests on "hold", shrinks on "out". Decorative: the label and countdown carry the meaning.
export function BreathingCircle({ motion, seconds, step }: Props) {
  const scale = useRef(new Animated.Value(SMALL)).current;

  useEffect(() => {
    if (motion === 'hold') return;
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
      style={[styles.circle, { transform: [{ scale }] }]}
    />
  );
}

const styles = StyleSheet.create({
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.accent,
    alignSelf: 'center',
  },
});
