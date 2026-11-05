import Svg, { Circle, Path, Rect } from 'react-native-svg';

// The small line icons from the v3 screens. Decorative: the text next to each icon says what it is.
export type IconName = 'drop' | 'wave' | 'heart' | 'back' | 'timer' | 'pause' | 'play' | 'stop' | 'logo';

export function Icon({ name, size = 22, color = '#2B3A34' }: { name: IconName; size?: number; color?: string }) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const shape = (() => {
    switch (name) {
      case 'drop':
        return <Path d="M12 3 C12 3 5.5 10.5 5.5 14.5 a6.5 6.5 0 0 0 13 0 C18.5 10.5 12 3 12 3 Z" {...stroke} />;
      case 'logo':
        return <Path d="M12 2 C12 2 4.5 10.5 4.5 15 a7.5 7.5 0 0 0 15 0 C19.5 10.5 12 2 12 2 Z" fill={color} />;
      case 'wave':
        return <Path d="M3 14 C5.5 9 7.5 9 9.5 13 S13.5 17 15.5 12 S19.5 8 21 11" {...stroke} />;
      case 'heart':
        return (
          <Path
            d="M12 20 C12 20 4 15 4 9.5 A4 4 0 0 1 12 7.5 A4 4 0 0 1 20 9.5 C20 15 12 20 12 20 Z"
            {...stroke}
          />
        );
      case 'back':
        return <Path d="M14.5 5 L8 12 L14.5 19" {...stroke} strokeWidth={2} />;
      case 'timer':
        return (
          <>
            <Circle cx="12" cy="13.5" r="7" {...stroke} />
            <Path d="M12 13.5 V9.5 M9.5 3.5 H14.5" {...stroke} />
          </>
        );
      case 'pause':
        return (
          <>
            <Rect x="7" y="5" width="3.4" height="14" rx="1.2" fill={color} />
            <Rect x="13.6" y="5" width="3.4" height="14" rx="1.2" fill={color} />
          </>
        );
      case 'play':
        return <Path d="M8 5 L19 12 L8 19 Z" fill={color} />;
      case 'stop':
        return <Rect x="6.5" y="6.5" width="11" height="11" rx="2" fill={color} />;
    }
  })();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {shape}
    </Svg>
  );
}
