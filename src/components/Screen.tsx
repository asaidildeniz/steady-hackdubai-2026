import { router } from 'expo-router';
import { type ReactNode, useId } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { BackButton } from '@/components/Bits';
import { content } from '@/content/types';
import { colors, fonts, radius, space, type } from '@/theme';

type Props = {
  children: ReactNode;
  actions?: ReactNode; // buttons that sit at the bottom, in thumb reach
  pinActions?: boolean; // keep actions outside the scroll, always visible (Breathe's controls)
  back?: boolean | (() => void); // the round back button, top left
  title?: string; // small centred title next to the back button (Breathe)
  calm?: boolean; // the soft off-white to sage gradient of the calmer screens
  centered?: boolean; // centre the content column (Welcome, age question)
  noHelpLink?: boolean; // only Need help now itself and the presenter's Demo screen
};

// v3 frame: optional back button and title on top, content that scrolls, actions at the bottom.
// Need help now is one tap away on every screen (checklist 04, decided 11 Nov): a quiet link, top right.
export function Screen({ children, actions, pinActions, back, title, calm, centered, noHelpLink }: Props) {
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
      {(back || title || !noHelpLink) && (
        <View style={[styles.top, styles.column]}>
          {back ? <BackButton onPress={typeof back === 'function' ? back : undefined} /> : <View style={styles.spacer} />}
          {title ? (
            <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            <View style={styles.fill} />
          )}
          {noHelpLink ? (
            <View style={styles.spacer} />
          ) : (
            <Pressable
              onPress={() => router.push('/need-help')}
              accessibilityRole="button"
              accessibilityLabel={content.common.needHelpLink}
              accessibilityHint={content.common.needHelpLinkHint}
              hitSlop={8}
              style={({ pressed }) => [styles.help, pressed && styles.pressed]}
            >
              <Text style={styles.helpText}>{content.common.needHelpLink}</Text>
            </Pressable>
          )}
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
  fill: { flex: 1 },
  title: { flex: 1, textAlign: 'center', fontSize: type.body, fontFamily: fonts.medium, color: '#2B3A34', marginHorizontal: 8 },
  // Same white as the back button, so it reads as part of the frame rather than an alarm.
  help: {
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  helpText: { fontSize: 15, fontFamily: fonts.medium, color: colors.text },
  pressed: { opacity: 0.85 },
  content: { flexGrow: 1, padding: space.screen, gap: space.gap },
  centered: { alignItems: 'center' },
  // On a tablet the page stays a phone-like column in the middle, so lines and buttons keep a readable width.
  column: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  actions: { marginTop: 'auto', gap: space.gap - 4, paddingTop: space.screen, alignSelf: 'stretch' },
  pinned: { gap: space.gap, paddingHorizontal: space.screen, paddingBottom: space.screen, paddingTop: space.gap },
});
