import { useEffect, useState } from 'react';
import { AccessibilityInfo, TurboModuleRegistry } from 'react-native';
import type { BreathPhase } from '@/content/types';
import { Droplet } from './Droplet';
import { LiquidOrb } from './LiquidOrb';

type Props = {
  motion: BreathPhase['motion'];
  seconds: number;
  step: string;
  paused?: boolean;
  size: number;
  ambient?: boolean;
};

// The water shader needs Skia's native part (in Expo Go and new builds, not in older development builds)
// and a phone that compiles the shader. Otherwise the SVG droplet stands in, so Breathe never breaks.
function loadShaderOrb(): ((p: Props) => React.JSX.Element | null) | null {
  try {
    if (!TurboModuleRegistry.get('RNSkiaModule')) return null;
    const mod = require('./ShaderOrb');
    return mod.water ? mod.ShaderOrb : null;
  } catch {
    return null;
  }
}

const Shader = loadShaderOrb();

export function BreathOrb(props: Props) {
  return Shader ? <Shader {...props} /> : <LiquidOrb {...props} />;
}

// The droplet on calm screens (Welcome, Home, How do you feel now…): living water that floats on its own.
// A still droplet with reduce motion on, or where the shader can't run.
export function LivingDroplet({ size }: { size: number }) {
  const [still, setStill] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => alive && setStill(on))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setStill);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  if (still || !Shader) return <Droplet size={size} />;
  return <Shader ambient motion="hold" seconds={1} step="ambient" size={size} />;
}
