import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, space, type } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  hint?: string;
  disabled?: boolean;
};

export function BigButton({ label, onPress, hint, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}
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
  pressed: { opacity: 0.8 },
  disabled: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.muted },
  label: { fontSize: type.button, fontWeight: '700', color: colors.text, textAlign: 'center' },
  disabledLabel: { color: colors.muted },
});
