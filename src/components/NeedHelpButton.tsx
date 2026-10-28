import { type Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { content } from '@/content/types';
import { colors, space, type } from '@/theme';

// shortcut: cast until app/need-help.tsx exists (Phase 2); typed routes reject the href before then.
const NEED_HELP = '/need-help' as Href;

export function NeedHelpButton() {
  const { label, hint } = content.needHelpButton;
  return (
    <Pressable
      onPress={() => router.push(NEED_HELP)}
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
