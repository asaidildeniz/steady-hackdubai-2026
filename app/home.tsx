import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { colors, type } from '@/theme';

// Blank S3 placeholder. The three Home buttons come in Phase 2.
export default function Home() {
  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>
        {content.home.title}
      </Text>
      <Text style={styles.note}>{content.reviewStatus}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: type.heading, fontWeight: '700', color: colors.text },
  note: { fontSize: type.body, color: colors.muted },
});
