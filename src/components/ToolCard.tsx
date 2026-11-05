import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Icon, type IconName } from '@/components/Icon';
import { content, type ToolId } from '@/content/types';
import { colors, fonts, radius, space, text, type } from '@/theme';

// The three self-care tools as cards: a large coloured "Try this first" card, or a white row under "Or try".
const look: Record<ToolId, { icon: IconName; card: string; ink: string }> = {
  breathe: { icon: 'drop', card: colors.breathe, ink: colors.primary },
  untangle: { icon: 'wave', card: colors.untangle, ink: colors.untangleInk },
  reachOut: { icon: 'heart', card: colors.reachOut, ink: colors.reachOutInk },
};

export function FeaturedTool({ tool, onPress }: { tool: ToolId; onPress: () => void }) {
  const t = content.tools[tool];
  const fp = content.feelingPages;
  const l = look[tool];
  return (
    <View style={[styles.featured, { backgroundColor: l.card }]}>
      <Text style={[styles.eyebrow, { color: l.ink }]}>{fp.tryFirst}</Text>
      <View style={styles.titleRow}>
        <View style={[styles.iconBig, { backgroundColor: colors.surface }]}>
          <Icon name={l.icon} size={26} color={l.ink} />
        </View>
        <Text accessibilityRole="header" style={styles.featuredTitle}>
          {t.title}
        </Text>
      </View>
      <Text style={text.body}>{t.body}</Text>
      <BigButton compact label={fp.start} a11yLabel={`${fp.start} ${t.title}`} onPress={onPress} />
    </View>
  );
}

export function ToolRow({
  icon,
  tint,
  ink,
  title,
  body,
  a11yLabel,
  onPress,
}: {
  icon: IconName;
  tint: string;
  ink: string;
  title: string;
  body: string;
  a11yLabel?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? title}
      accessibilityHint={a11yLabel ? undefined : body}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconSmall, { backgroundColor: tint }]}>
        <Icon name={icon} size={20} color={ink} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowBody}>{body}</Text>
      </View>
    </Pressable>
  );
}

export function OtherTool({ tool, onPress }: { tool: ToolId; onPress: () => void }) {
  const t = content.tools[tool];
  const l = look[tool];
  return <ToolRow icon={l.icon} tint={l.card} ink={l.ink} title={t.title} body={t.body} onPress={onPress} />;
}

const styles = StyleSheet.create({
  featured: { borderRadius: radius.card, padding: space.screen, gap: space.gap - 2 },
  eyebrow: { fontSize: type.small - 1, fontFamily: fonts.medium },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.gap },
  iconBig: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  featuredTitle: { fontSize: 26, lineHeight: 32, fontFamily: fonts.medium, color: colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.gap,
    backgroundColor: colors.surface,
    borderRadius: radius.row,
    padding: space.gap + 2,
    minHeight: space.tap,
  },
  pressed: { opacity: 0.85 },
  iconSmall: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: type.body, lineHeight: 24, fontFamily: fonts.medium, color: colors.text },
  rowBody: { fontSize: type.small, lineHeight: 20, fontFamily: fonts.regular, color: colors.muted },
});
