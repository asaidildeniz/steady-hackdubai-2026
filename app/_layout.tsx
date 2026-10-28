import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
