import { BlurMask, Canvas, Circle, Fill, Oval, Shader, Skia, useClock, vec } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { BreathPhase } from '@/content/types';
import { WATER_SKSL } from './waterShader';

// The Breathe droplet as moving water: Steady's own shader (waterShader.ts), drawn by Skia on the graphics chip.
// The water always flows; the breath swells it on "in", rests it on "hold" and settles it on "out".
// Each breath in sends one soft ring outward. Decorative only: the words and the seconds row carry the meaning.

type Props = {
  motion: BreathPhase['motion'];
  seconds: number;
  step: string;
  paused?: boolean;
  size: number;
  ambient?: boolean; // outside Breathe: always floating and flowing, at a resting size, no breath and no ring
};

// Compiled once. Breathe only uses this component when it compiled (see BreathOrb).
export const water = Skia.RuntimeEffect.Make(WATER_SKSL);
const SMALL = 0.7; // size at the end of a breath out
const ease = Easing.inOut(Easing.sin);

export function ShaderOrb({ motion, seconds, step, paused, size, ambient }: Props) {
  const breath = useSharedValue(ambient ? 0.85 : 0); // 0 breathed out, 1 breathed in
  const ring = useSharedValue(1); // 0 → 1 as a ripple travels out
  const clock = useClock();

  useEffect(() => {
    if (ambient) return;
    if (paused) {
      cancelAnimation(breath);
      return;
    }
    const ms = seconds * 1000;
    if (motion === 'hold') {
      breath.value = 1;
      return;
    }
    const growing = motion === 'grow';
    breath.value = growing ? 0 : 1;
    breath.value = withTiming(growing ? 1 : 0, { duration: ms, easing: ease });
    if (growing) {
      ring.value = 0;
      ring.value = withTiming(1, { duration: 3200, easing: Easing.out(Easing.quad) });
    }
  }, [motion, seconds, step, paused, ambient, breath, ring]);

  // Floating: a slow wandering path (several unrelated slow waves, so it never visibly repeats), a gentle
  // sway, a soft squash and stretch like a drop of water, and a lift as the drop fills with breath.
  const float = useDerivedValue(() => {
    const t = clock.value / 1000;
    const x = size * (0.045 * Math.sin(t * 0.37) + 0.02 * Math.sin(t * 0.91 + 1.3));
    const y = size * (0.035 * Math.sin(t * 0.29 + 0.7) + 0.015 * Math.sin(t * 0.83)) - size * 0.05 * breath.value;
    // Speed of the drift, so the water inside can lag behind it.
    const vx = 0.045 * 0.37 * Math.cos(t * 0.37) + 0.02 * 0.91 * Math.cos(t * 0.91 + 1.3);
    const vy = 0.035 * 0.29 * Math.cos(t * 0.29 + 0.7) + 0.015 * 0.83 * Math.cos(t * 0.83);
    const squash = 0.028 * Math.sin(t * 1.15);
    const tilt = 4 * Math.sin(t * 0.23) + 2 * Math.sin(t * 0.61);
    return { x, y, vx: vx * 6, vy: vy * 6, squash, tilt };
  });
  const uniforms = useDerivedValue(() => ({
    res: vec(size, size),
    time: clock.value / 1000,
    breath: breath.value,
    drift: vec(float.value.vx, float.value.vy),
  }));
  const drop = useAnimatedStyle(() => {
    const s = SMALL + (1 - SMALL) * breath.value;
    return {
      transform: [
        { translateX: float.value.x },
        { translateY: float.value.y },
        { rotate: `${float.value.tilt}deg` },
        { scaleX: s * (1 + float.value.squash) },
        { scaleY: s * (1 - float.value.squash) },
      ],
    };
  });
  const ringRadius = useDerivedValue(() => size * 0.46 * (0.8 + 0.5 * ring.value));
  const ringOpacity = useDerivedValue(() => (ring.value < 0.1 ? ring.value * 4.5 : 0.45 * (1 - ring.value)));
  // The shadow follows the drop sideways and fades a little as it lifts.
  const shadowRx = useDerivedValue(() => size * 0.36 * (0.72 + 0.28 * breath.value) * (1 + float.value.y / size));
  const shadowOpacity = useDerivedValue(() => (0.5 + 0.5 * breath.value) * (1 + (1.5 * float.value.y) / size));
  const shadowRect = useDerivedValue(() => ({
    x: size / 2 + float.value.x - shadowRx.value,
    y: size * 1.02,
    width: shadowRx.value * 2,
    height: size * 0.08,
  }));

  const height = size * 1.18;
  return (
    <View
      testID="breathing-circle"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height }}
    >
      {/* Ground shadow and the ripple ring, behind the drop. */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Oval
          rect={shadowRect}
          color="#5E7E78"
          opacity={shadowOpacity}
        >
          <BlurMask blur={10} style="normal" />
        </Oval>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={ringRadius}
          color="#8FAEB6"
          style="stroke"
          strokeWidth={1.2}
          opacity={ringOpacity}
        />
      </Canvas>
      <Animated.View style={[styles.drop, { width: size, height: size }, drop]}>
        <Canvas style={{ width: size, height: size }}>
          <Fill>
            <Shader source={water!} uniforms={uniforms} />
          </Fill>
        </Canvas>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  drop: { position: 'absolute', top: 0, left: 0 },
});
