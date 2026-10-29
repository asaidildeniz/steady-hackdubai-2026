import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '@/lib/demo'; // runs first, so demo mode is set up before any screen reads content
import { colors } from '@/theme';

export default function RootLayout() {
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
