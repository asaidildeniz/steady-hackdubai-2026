import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeedHelpButton } from '@/components/NeedHelpButton';
import { colors, space } from '@/theme';

type Props = {
  children: ReactNode;
  showNeedHelp?: boolean; // off on S1, S2 and S9
};

// The Need help pill sits in its own row above the scrolling content,
// so it stays in the same place and never covers text at large font sizes.
export function Screen({ children, showNeedHelp = true }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      {showNeedHelp && (
        <View style={styles.top}>
          <NeedHelpButton />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { alignItems: 'flex-end', paddingHorizontal: space.screen, paddingTop: space.gap },
  content: { flexGrow: 1, padding: space.screen, gap: space.gap },
});
