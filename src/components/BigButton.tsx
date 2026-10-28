import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, space, type } from '@/theme';

type Props = {
  label: string;
  a11yLabel?: string; // when the visible label alone is ambiguous, e.g. "Call <name>"
  onPress: () => void;
  hint?: string;
  disabled?: boolean;
  secondary?: boolean; // quiet outlined button, so a screen keeps one yellow main action
};

export function BigButton({ label, a11yLabel, onPress, hint, disabled, secondary }: Props) {
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
        secondary && styles.secondary,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: space.tap,
    justifyContent: 'center',
    paddingHorizontal: space.screen,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.accent,
  },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.text },
  pressed: { opacity: 0.8 },
  disabled: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.muted },
  label: { fontSize: type.button, fontWeight: '700', color: colors.text, textAlign: 'center' },
  disabledLabel: { color: colors.muted },
});
