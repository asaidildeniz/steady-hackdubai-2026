import { type ReactNode, useId } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { BackButton } from '@/components/Bits';
import { colors, fonts, space, type } from '@/theme';

type Props = {
  children: ReactNode;
  actions?: ReactNode; // buttons that sit at the bottom, in thumb reach
  pinActions?: boolean; // keep actions outside the scroll, always visible (Breathe's controls)
  back?: boolean | (() => void); // the round back button, top left
  title?: string; // small centred title next to the back button (Breathe)
  calm?: boolean; // the soft off-white to sage gradient of the calmer screens
  centered?: boolean; // centre the content column (Welcome, age question)
};

// v3 frame: optional back button and title on top, content that scrolls, actions at the bottom.
// Help in a crisis comes from the typed-text safety check and the Reach Out emergency link.
export function Screen({ children, actions, pinActions, back, title, calm, centered }: Props) {
  const uid = useId().replace(/\W/g, ''); // SVG ids must be unique per page on the web
  return (
    <SafeAreaView style={styles.safe}>
      {calm && (
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden>
          <Defs>
            <LinearGradient id={`calm${uid}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.background} />
              <Stop offset="1" stopColor={colors.backgroundLow} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#calm${uid})`} />
        </Svg>
      )}
      {(back || title) && (
        <View style={[styles.top, styles.column]}>
          {back ? <BackButton onPress={typeof back === 'function' ? back : undefined} /> : <View style={styles.spacer} />}
          {title ? (
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
          ) : null}
          <View style={styles.spacer} />
        </View>
      )}
      <ScrollView contentContainerStyle={[styles.content, styles.column, centered && styles.centered]}>
        {children}
        {actions && !pinActions && <View style={styles.actions}>{actions}</View>}
      </ScrollView>
      {actions && pinActions && <View style={[styles.pinned, styles.column]}>{actions}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.screen,
    paddingTop: space.gap,
  },
  spacer: { width: 46 },
  title: { fontSize: type.body, fontFamily: fonts.medium, color: '#2B3A34' },
  content: { flexGrow: 1, padding: space.screen, gap: space.gap },
  centered: { alignItems: 'center' },
  // On a tablet the page stays a phone-like column in the middle, so lines and buttons keep a readable width.
  column: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  actions: { marginTop: 'auto', gap: space.gap - 4, paddingTop: space.screen, alignSelf: 'stretch' },
  pinned: { gap: space.gap, paddingHorizontal: space.screen, paddingBottom: space.screen, paddingTop: space.gap },
});
