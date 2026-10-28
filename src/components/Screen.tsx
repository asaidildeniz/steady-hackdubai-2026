import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeedHelpButton } from '@/components/NeedHelpButton';
import { colors, space } from '@/theme';

type Props = {
  children: ReactNode;
  actions?: ReactNode; // buttons that sit at the bottom, in thumb reach
  showNeedHelp?: boolean; // off on S1, S2 and S9
};

// The Need help pill sits in its own row above the scrolling content,
// so it stays in the same place and never covers text at large font sizes.
// `actions` sit at the bottom when there is room and scroll with the text when there is not.
export function Screen({ children, actions, showNeedHelp = true }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      {showNeedHelp && (
        <View style={styles.top}>
          <NeedHelpButton />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        {children}
        {actions && <View style={styles.actions}>{actions}</View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { alignItems: 'flex-end', paddingHorizontal: space.screen, paddingTop: space.gap },
  content: { flexGrow: 1, padding: space.screen, gap: space.gap },
  actions: { marginTop: 'auto', gap: space.gap, paddingTop: space.screen },
});
