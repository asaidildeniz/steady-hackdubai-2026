import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { content } from '@/content/types';
import { colors, space, type } from '@/theme';

export function NeedHelpButton() {
  const { label, hint } = content.needHelpButton;
  return (
    <Pressable
      onPress={() => router.push('/need-help')}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={({ pressed }) => [styles.pill, pressed && { opacity: 0.8 }]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: space.tap,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: space.tap / 2,
    backgroundColor: colors.needHelp,
  },
  label: { fontSize: type.button, fontWeight: '700', color: colors.needHelpText },
});
