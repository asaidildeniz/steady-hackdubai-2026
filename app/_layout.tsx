import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import '@/lib/demo'; // runs first, so demo mode is set up before any screen reads content
import { startEmbedder } from '@/lib/embedder';
import { colors } from '@/theme';

export default function RootLayout() {
  useEffect(startEmbedder, []); // warms the on-phone model in the background; a no-op where it can't run
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
