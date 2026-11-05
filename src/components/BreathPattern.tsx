import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { BreathPhase } from '@/content/types';
import { colors, fonts } from '@/theme';

// The breath as a small meter under the droplet: one pill per step, as wide as the step is long.
// In fills outward as the drop swells, Hold glows softly, Out draws back in as the drop settles.
// Native-driven transforms and opacity only. Read out once as a whole; never second by second.

type Props = {
  pattern: BreathPhase[];
  current: number; // index of the step in progress, within one breath
  secondsLeft: number;
  stepKey: string; // changes on every new step and every restart
  running: boolean;
  still: boolean; // reduce motion
  secondsText: (n: number) => string;
  a11yLabel: string;
};

const ease = Easing.inOut(Easing.sin);

export function BreathPattern({ pattern, current, secondsLeft, stepKey, running, still, secondsText, a11yLabel }: Props) {
  return (
    <View style={styles.row} accessible accessibilityLabel={a11yLabel}>
      {pattern.map((phase, i) => (
        <Pill
          key={`${phase.motion}-${i}`}
          phase={phase}
          active={i === current}
          seconds={i === current ? secondsLeft : phase.seconds}
          stepKey={stepKey}
          running={running}
          still={still}
          secondsText={secondsText}
        />
      ))}
    </View>
  );
}

type PillProps = {
  phase: BreathPhase;
  active: boolean;
  seconds: number;
  stepKey: string;
  running: boolean;
  still: boolean;
  secondsText: (n: number) => string;
};

function Pill({ phase, active, seconds, stepKey, running, still, secondsText }: PillProps) {
  const fill = useRef(new Animated.Value(0)).current; // 0 empty, 1 full (scaled from the centre)
  const glow = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const beat = useRef(new Animated.Value(1)).current;

  // The fill follows the breath: in fills, hold stays full and glows, out draws back.
  useEffect(() => {
    glow.setValue(1);
    if (!active) {
      fill.setValue(0);
      return;
    }
    if (still) {
      fill.setValue(1);
      return;
    }
    const ms = phase.seconds * 1000;
    if (phase.motion === 'hold') {
      fill.setValue(1);
      if (!running) return;
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 0.6, duration: 1000, easing: ease, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 1, duration: 1000, easing: ease, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
    const growing = phase.motion === 'grow';
    fill.setValue(growing ? 0 : 1);
    if (!running) return;
    const anim = Animated.timing(fill, { toValue: growing ? 1 : 0, duration: ms, easing: ease, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [active, stepKey, running, still, phase.motion, phase.seconds, fill, glow]);

  // The active pill lifts a little; the others rest.
  useEffect(() => {
    if (still) {
      lift.setValue(active ? 1 : 0);
      return;
    }
    Animated.spring(lift, { toValue: active ? 1 : 0, friction: 7, tension: 80, useNativeDriver: true }).start();
  }, [active, still, lift]);

  // A soft beat on every second of the active step.
  useEffect(() => {
    if (!active || still || !running) return;
    beat.setValue(1.16);
    Animated.spring(beat, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }).start();
  }, [seconds, active, still, running, beat]);

  return (
    <Animated.View
      style={[
        styles.pill,
        { flexGrow: phase.seconds },
        active && styles.pillActive,
        { transform: [{ scale: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.fill, { opacity: glow, transform: [{ scaleX: fill }] }]}
      />
      <Text style={[styles.name, active && styles.nameActive]}>{phase.short ?? phase.label.replace(/…$/, '')}</Text>
      <Animated.Text style={[styles.seconds, active && styles.secondsActive, { transform: [{ scale: beat }] }]}>
        {secondsText(seconds)}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignSelf: 'stretch', gap: 8 },
  pill: {
    flexBasis: 0,
    minWidth: 64,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  pillActive: { borderColor: colors.primary },
  fill: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.chip },
  name: { fontSize: 13, fontFamily: fonts.medium, color: colors.muted },
  nameActive: { color: colors.primary },
  seconds: { fontSize: 20, lineHeight: 26, fontFamily: fonts.medium, color: colors.text, fontVariant: ['tabular-nums'] },
  secondsActive: { color: colors.primary },
});
