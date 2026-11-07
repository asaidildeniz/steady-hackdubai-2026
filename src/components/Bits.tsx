import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { content } from '@/content/types';
import { colors, fonts, radius, space, type } from '@/theme';

// Small shared pieces from the v3 screens.

type ChipProps = { label: string; onPress?: () => void; a11yLabel?: string; selected?: boolean };

export function Chip({ label, onPress, a11yLabel, selected }: ChipProps) {
  if (!onPress) {
    return (
      <View style={[styles.chip, styles.tag]}>
        <Text style={styles.chipText}>{label}</Text>
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

export function BackButton({ onPress = () => router.back() }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={content.common.back}
      hitSlop={8}
      style={({ pressed }) => [styles.back, pressed && styles.pressed]}
    >
      <Icon name="back" size={22} />
    </Pressable>
  );
}

export function LogoRow() {
  return (
    <View style={styles.logo} accessibilityRole="header">
      <Text style={styles.logoText}>{content.home.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
  },
  tag: { alignSelf: 'flex-start', minHeight: 32 },
  chipText: { fontSize: type.small, fontFamily: fonts.medium, color: colors.chipText },
  selected: { backgroundColor: colors.primary },
  selectedText: { color: colors.onPrimary },
  pressed: { opacity: 0.8 },
  back: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: space.gap / 2 + 4 },
  logoText: { fontSize: type.title - 2, fontFamily: fonts.bold, color: colors.text },
});
