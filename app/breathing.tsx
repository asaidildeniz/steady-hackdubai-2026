import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Chip } from '@/components/Bits';
import { BreathPattern } from '@/components/BreathPattern';
import { Droplet } from '@/components/Droplet';
import { Icon, type IconName } from '@/components/Icon';
import { LiquidOrb } from '@/components/LiquidOrb';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { cycleSeconds, cyclesFor, safePhases, stepAt, totalSeconds } from '@/lib/breathing';
import { breathingTiming } from '@/lib/demo';
import { colors, fonts, space, text } from '@/theme';

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// S6 Breathe. Fully offline: a one-second timer drives the phases; the droplet animates on the native thread.
// A longer session repeats the same breath; it never makes one breath longer (see lib/breathing).
export default function Breathing() {
  useKeepAwake(); // only while this screen is open
  const c = content.breathing;
  const { phases, short } = breathingTiming(); // shortened only in demo mode
  const [minutes, setMinutes] = useState<number | null>(short ? null : c.defaultMinutes);
  const [cycles, setCycles] = useState(() => (short ? 1 : cyclesFor(phases, c.defaultMinutes)));
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false); // the Pause button
  const [away, setAway] = useState(false); // the phone is locked or the app is in the background
  const [restarts, setRestarts] = useState(0);
  const [choosing, setChoosing] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const pattern = safePhases(phases); // the steps of one breath, with the seconds actually used
  const step = stepAt(phases, cycles, elapsed);
  const done = step === null;
  const left = Math.max(0, totalSeconds(phases, cycles) - elapsed);

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

  // Back to the top of the current phase, so the droplet and the words always agree.
  const restartPhase = () => {
    setElapsed((e) => {
      const at = stepAt(phases, cycles, e);
      return at ? e - (at.phase.seconds - at.secondsLeft) : e;
    });
    setRestarts((r) => r + 1);
  };

  // Locking the phone pauses; coming back restarts the current phase.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        restartPhase();
        setAway(false);
      } else {
        setAway(true);
      }
    });
    return () => sub.remove();
    // restartPhase only reads phases and cycles, which are the dependencies here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases, cycles]);

  // Cleared on pause and on unmount, so leaving early can never navigate later.
  const running = !paused && !away;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // replace, so back from Finished does not drop someone mid-exercise.
  useEffect(() => {
    if (done) router.replace('/finished');
  }, [done]);

  // Announce each new phase, not every second, and again when a phase restarts.
  const label = step?.phase.label;
  useEffect(() => {
    if (label) AccessibilityInfo.announceForAccessibility(label);
  }, [step?.index, label, restarts]);

  const togglePause = () => {
    if (paused) restartPhase(); // resume from the top of the phase
    setPaused(!paused);
  };

  // A new length never cuts the breath in progress short.
  const choose = (m: number) => {
    const current = Math.floor(elapsed / Math.max(1, cycleSeconds(phases)));
    setMinutes(m);
    setCycles(Math.max(cyclesFor(phases, m), current + 1));
    setChoosing(false);
  };

  // Smaller on narrow phones and at large text, so the words still fit above the controls.
  const size = Math.min(260, width * 0.66) * (fontScale > 1.3 ? 0.7 : 1);
  const option = (m: number) => c.lengthOption.replace('{n}', String(m));

  return (
    <Screen
      calm
      back
      title={c.title}
      pinActions
      actions={
        <View style={styles.bottom}>
          {choosing && (
            <View style={styles.lengths}>
              {c.minutes.map((m) => (
                <Chip key={m} label={option(m)} selected={m === minutes} onPress={() => choose(m)} />
              ))}
            </View>
          )}
          <View style={styles.controls}>
            <View style={styles.side}>
              <RoundButton
                icon="timer"
                label={minutes ? `${c.length}: ${option(minutes)}` : c.length}
                hint={c.lengthHint}
                onPress={() => setChoosing((v) => !v)}
              />
              <Text style={styles.caption}>{c.timeLeft.replace('{time}', clock(left))}</Text>
            </View>
            <RoundButton main icon={paused ? 'play' : 'pause'} label={paused ? c.resume : c.pause} onPress={togglePause} />
            <View style={styles.side}>
              <RoundButton icon="stop" label={c.stop} onPress={() => router.dismissTo('/home')} />
              <Text style={styles.caption}> </Text>
            </View>
          </View>
        </View>
      }
    >
      {step && (
        <View style={styles.exercise}>
          {reduceMotion ? (
            <Droplet size={size * 0.7} />
          ) : (
            <LiquidOrb
              motion={step.phase.motion}
              seconds={step.phase.seconds}
              step={`${step.index}-${restarts}`}
              paused={!running}
              size={size}
            />
          )}
          <Text accessibilityRole="header" style={[text.heading, styles.centred]}>
            {step.phase.label}
          </Text>
          <BreathPattern
            pattern={pattern}
            current={step.index % pattern.length}
            secondsLeft={step.secondsLeft}
            stepKey={`${step.index}-${restarts}`}
            running={running}
            still={reduceMotion}
            secondsText={(n) => c.seconds.replace('{n}', String(n))}
            a11yLabel={pattern
              .map((p) => c.patternLabel.replace('{label}', p.label.replace(/…$/, '')).replace('{n}', String(p.seconds)))
              .join(', ')}
          />
          {!!c.intro && <Text style={[text.body, styles.centred, styles.soft]}>{c.intro}</Text>}
        </View>
      )}
    </Screen>
  );
}

type RoundProps = { icon: IconName; label: string; hint?: string; onPress: () => void; main?: boolean };

function RoundButton({ icon, label, hint, onPress, main }: RoundProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={({ pressed }) => [styles.round, main && styles.main, pressed && styles.pressed]}
    >
      <Icon name={icon} size={main ? 28 : 22} color={main ? colors.onPrimary : colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  exercise: { alignItems: 'center', gap: space.gap, paddingTop: space.screen, flexGrow: 1 },
  centred: { textAlign: 'center' },
  soft: { color: colors.muted },
  bottom: { gap: space.gap },
  lengths: { flexDirection: 'row', justifyContent: 'center', gap: space.gap / 2 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  side: { alignItems: 'center', gap: 6, width: 76 },
  caption: { fontSize: 13, fontFamily: fonts.regular, color: colors.muted, fontVariant: ['tabular-nums'] },
  round: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary },
  pressed: { opacity: 0.85 },
});
