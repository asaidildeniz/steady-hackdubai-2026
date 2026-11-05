import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import type { BreathPhase } from '@/content/types';

// The Breathe droplet, made to feel like water. Everything moves on the native animation thread
// (transforms and opacity only), so it stays smooth for a 3-minute session:
// - two slightly irregular water bodies turn slowly in opposite directions, so the outline keeps changing;
// - two soft inner currents circle inside it, like light moving through water;
// - the light itself (highlight, rim, depth) stays still, as a real light would;
// - the whole drop floats a little, swells on "in", rests with a tiny pulse on "hold", settles on "out";
// - each new breath in sends one soft ring outward, like a drop touching water.
// Decorative only: the phase words carry the meaning. The screen shows a still droplet with reduce motion.

type Props = { motion: BreathPhase['motion']; seconds: number; step: string; paused?: boolean; size: number };

const SMALL = 0.68; // size at the end of a breath out
const ease = Easing.inOut(Easing.sin); // the shape of a natural breath: slow start, slow finish

// A smooth closed outline: a circle with a few gentle waves on its edge.
function blob(radius: number, waves: [number, number, number][], cx = 100, cy = 100): string {
  const n = 48;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = radius * (1 + waves.reduce((sum, [amp, k, phase]) => sum + amp * Math.sin(k * a + phase), 0));
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return `${d} Z`;
}

const BODY_A = blob(80, [[0.045, 3, 0.4], [0.03, 5, 1.3], [0.02, 2, 2.1]]);
const BODY_B = blob(80, [[0.05, 3, 2.2], [0.025, 4, 0.7], [0.02, 6, 1.9]]);
const CURRENT_A = blob(42, [[0.08, 3, 0.9], [0.05, 2, 2.4]], 90, 94);
const CURRENT_B = blob(34, [[0.09, 3, 1.7], [0.04, 5, 0.2]], 112, 118);

// A value that goes round and round (0 → 1), forever, on the native thread.
function useSpin(ms: number) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [v, ms]);
  return v;
}

// A value that drifts back and forth (0 → 1 → 0) with a sine ease, forever.
function useSway(ms: number) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: ms / 2, easing: ease, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: ms / 2, easing: ease, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, ms]);
  return v;
}

const turn = (v: Animated.Value, dir = 1) =>
  v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${dir * 360}deg`] });

export function LiquidOrb({ motion, seconds, step, paused, size }: Props) {
  const breath = useRef(new Animated.Value(0)).current; // 0 = breathed out, 1 = breathed in
  const pulse = useRef(new Animated.Value(1)).current; // a tiny swell while holding
  const ring = useRef(new Animated.Value(1)).current; // 0 → 1 as a ripple travels out

  const spinA = useSpin(29000);
  const spinB = useSpin(37000);
  const spinC = useSpin(19000);
  const spinD = useSpin(23000);
  const float = useSway(6400);
  const drift = useSway(9200);

  // The breath itself: each phase starts from where it should, so a restart after pause or lock never jumps.
  useEffect(() => {
    if (paused) return;
    const ms = seconds * 1000;
    if (motion === 'hold') {
      breath.setValue(1);
      pulse.setValue(1);
      const hold = Animated.sequence([
        Animated.timing(pulse, { toValue: 1.018, duration: ms / 2, easing: ease, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: ms / 2, easing: ease, useNativeDriver: true }),
      ]);
      hold.start();
      return () => hold.stop();
    }
    const growing = motion === 'grow';
    breath.setValue(growing ? 0 : 1);
    pulse.setValue(1);
    const anims = [Animated.timing(breath, { toValue: growing ? 1 : 0, duration: ms, easing: ease, useNativeDriver: true })];
    if (growing) {
      ring.setValue(0);
      anims.push(Animated.timing(ring, { toValue: 1, duration: 3200, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    }
    const all = Animated.parallel(anims);
    all.start();
    return () => all.stop();
  }, [motion, seconds, step, paused, breath, pulse, ring]);

  const scale = Animated.multiply(breath.interpolate({ inputRange: [0, 1], outputRange: [SMALL, 1] }), pulse);
  const height = size * 1.18;

  return (
    <View
      testID="breathing-circle"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height }}
    >
      {/* Shadow on the ground: wider and darker as the drop fills. */}
      <Animated.View
        style={[
          styles.layer,
          {
            top: size * 0.98,
            height: size * 0.18,
            opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
            transform: [{ scaleX: breath.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) }],
          },
        ]}
      >
        <Svg width={size} height={size * 0.18} viewBox="0 0 200 36">
          <Defs>
            <RadialGradient id="lqShadow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#5E7E78" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#5E7E78" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse cx="100" cy="18" rx="80" ry="14" fill="url(#lqShadow)" />
        </Svg>
      </Animated.View>

      {/* One soft ring per breath in, travelling outward and fading. */}
      <Animated.View
        style={[
          styles.layer,
          {
            height: size,
            opacity: ring.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.45, 0] }),
            transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.32] }) }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Ellipse cx="100" cy="100" rx="84" ry="84" stroke="#8FAEB6" strokeWidth="1.2" fill="none" />
        </Svg>
      </Animated.View>

      {/* The drop: floats gently, breathes in and out. */}
      <Animated.View
        style={[
          styles.layer,
          {
            height: size,
            transform: [
              { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [3, -3] }) },
              { scale },
            ],
          },
        ]}
      >
        <Animated.View style={[styles.fill, { transform: [{ rotate: turn(spinA) }] }]}>
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="lqBodyA" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#DAE4E9" />
                <Stop offset="0.6" stopColor="#B7CAD2" />
                <Stop offset="1" stopColor="#8EA8B3" />
              </RadialGradient>
            </Defs>
            <Path d={BODY_A} fill="url(#lqBodyA)" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.fill, { transform: [{ rotate: turn(spinB, -1) }] }]}>
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="lqBodyB" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#DAE4E9" />
                <Stop offset="0.6" stopColor="#B7CAD2" />
                <Stop offset="1" stopColor="#8EA8B3" />
              </RadialGradient>
            </Defs>
            <Path d={BODY_B} fill="url(#lqBodyB)" />
          </Svg>
        </Animated.View>

        {/* Depth: a little darker low and to the right, where light would not reach. */}
        <View style={styles.fill} pointerEvents="none">
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="lqDepth" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#5F818C" stopOpacity="0.28" />
                <Stop offset="1" stopColor="#5F818C" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Ellipse cx="122" cy="128" rx="62" ry="54" fill="url(#lqDepth)" />
          </Svg>
        </View>

        {/* Inner currents: soft lilac and aqua light circling inside the water. */}
        <Animated.View
          style={[
            styles.fill,
            {
              opacity: drift.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] }),
              transform: [{ rotate: turn(spinC) }],
            },
          ]}
        >
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="lqLilac" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#E7DAEE" stopOpacity="0.85" />
                <Stop offset="1" stopColor="#E7DAEE" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Path d={CURRENT_A} fill="url(#lqLilac)" />
          </Svg>
        </Animated.View>
        <Animated.View
          style={[
            styles.fill,
            {
              opacity: drift.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0.45] }),
              transform: [{ rotate: turn(spinD, -1) }],
            },
          ]}
        >
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="lqAqua" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#EEF7F8" stopOpacity="0.75" />
                <Stop offset="1" stopColor="#EEF7F8" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Path d={CURRENT_B} fill="url(#lqAqua)" />
          </Svg>
        </Animated.View>

        {/* The light stays where it is: a soft highlight, a bright glint and a thin rim of refracted light. */}
        <Animated.View
          style={[styles.fill, { opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]}
          pointerEvents="none"
        >
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="lqShine" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
                <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.45" />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="lqGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.4" />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Ellipse cx="72" cy="66" rx="22" ry="17" fill="url(#lqShine)" />
            <Ellipse cx="66" cy="60" rx="5" ry="4" fill="#FFFFFF" fillOpacity="0.9" />
            <Ellipse cx="134" cy="140" rx="24" ry="17" fill="url(#lqGlow)" />
            <Path
              d="M164 112 A66 66 0 0 1 118 164"
              stroke="#FFFFFF"
              strokeOpacity="0.35"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, top: 0, alignItems: 'center' },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});
