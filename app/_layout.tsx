import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import '@/lib/demo'; // runs first, so demo mode is set up before any screen reads content
import { startEmbedder } from '@/lib/embedder';
import { colors, fonts } from '@/theme';

export default function RootLayout() {
  useEffect(startEmbedder, []); // warms the on-phone model in the background; a no-op where it can't run
  // DM Sans ships inside the app; this only reads the bundled files, nothing is downloaded.
  const [fontsReady, fontError] = useFonts({
    [fonts.regular]: require('../assets/fonts/DMSans-Regular.ttf'),
    [fonts.medium]: require('../assets/fonts/DMSans-Medium.ttf'),
    [fonts.bold]: require('../assets/fonts/DMSans-Bold.ttf'),
  });
  // A plain background while the fonts load (a moment); if they fail, the system font takes over.
  if (!fontsReady && !fontError) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {/* The age gate cannot be swiped away. */}
        <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
        <Stack.Screen name="adults-only" options={{ gestureEnabled: false }} />
      </Stack>
    </>
  );
}
