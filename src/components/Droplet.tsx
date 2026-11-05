import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

// The glossy droplet from the v3 screens: a soft blue-grey body, a faint lilac glow, two highlights
// and a soft shadow underneath. Pure vector, no image files. Decorative, so hidden from screen readers.
export function Droplet({ size = 200 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 200 230"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <RadialGradient id="shadow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#6E8C86" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#6E8C86" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="body" cx="45%" cy="40%" r="65%">
          <Stop offset="0" stopColor="#D9E3E8" />
          <Stop offset="0.55" stopColor="#B8CBD3" />
          <Stop offset="1" stopColor="#8FA9B4" />
        </RadialGradient>
        <RadialGradient id="lilac" cx="50%" cy="55%" r="40%">
          <Stop offset="0" stopColor="#E3D6EA" stopOpacity="0.75" />
          <Stop offset="1" stopColor="#E3D6EA" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="shine" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="100" cy="212" rx="78" ry="14" fill="url(#shadow)" />
      <Path
        d="M100 14 C140 14 182 58 188 106 C194 156 158 192 100 192 C42 192 6 158 12 108 C18 60 60 14 100 14 Z"
        fill="url(#body)"
      />
      <Path
        d="M100 14 C140 14 182 58 188 106 C194 156 158 192 100 192 C42 192 6 158 12 108 C18 60 60 14 100 14 Z"
        fill="url(#lilac)"
      />
      <Ellipse cx="66" cy="62" rx="24" ry="20" fill="url(#shine)" />
      <Ellipse cx="140" cy="150" rx="30" ry="22" fill="url(#glow)" />
    </Svg>
  );
}
