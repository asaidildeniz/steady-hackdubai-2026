import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, space, type } from '@/theme';

type Props = {
  label: string;
  a11yLabel?: string; // when the visible label alone is ambiguous, e.g. "Call <name>"
  onPress: () => void;
  hint?: string;
  disabled?: boolean;
  secondary?: boolean; // white pill with a thin outline, so a screen keeps one teal main action
  compact?: boolean; // the small "Start" button on tool cards
};

export function BigButton({ label, a11yLabel, onPress, hint, disabled, secondary, compact }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        secondary && styles.secondary,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, secondary && styles.secondaryLabel, disabled && styles.disabledLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: space.tap,
    justifyContent: 'center',
    paddingHorizontal: space.screen,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  compact: { alignSelf: 'flex-start', minHeight: 48, paddingHorizontal: 24 },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  pressed: { opacity: 0.85 },
  disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled },
  label: { fontSize: type.button, fontFamily: fonts.medium, color: colors.onPrimary, textAlign: 'center' },
  secondaryLabel: { color: colors.text },
  disabledLabel: { color: colors.disabledText },
});
