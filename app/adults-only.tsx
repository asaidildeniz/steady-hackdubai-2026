import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Droplet } from '@/components/Droplet';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { colors, radius, space, text } from '@/theme';

// S2. Stores nothing. Go back returns to the start of Welcome (replace, so the history never loops).
// If the reviewer adds numbers here, they must go through callableNumber like S9.
export default function AdultsOnly() {
  const c = content.adultsOnly;
  const goBack = () => router.replace('/welcome');
  return (
    <Screen calm back={goBack} actions={<BigButton secondary label={c.goBack} onPress={goBack} />}>
      <View style={styles.hero}>
        <Droplet size={110} />
      </View>
      <Text accessibilityRole="header" style={[text.heading, styles.center]}>
        {c.message}
      </Text>
      <Text style={[text.body, styles.center, styles.soft]}>{c.whereToGetHelp}</Text>
      {!!c.inDanger?.trim() && (
        <View style={styles.card}>
          <Text style={text.title}>{c.cardTitle}</Text>
          <Text style={text.body}>{c.inDanger}</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: space.gap },
  center: { textAlign: 'center' },
  soft: { color: colors.muted },
  card: { backgroundColor: colors.reachOut, borderRadius: radius.card, padding: space.screen, gap: space.gap / 2 },
});
