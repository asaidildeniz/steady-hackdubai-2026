import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { demo } from '@/lib/demo';
import { getWelcomeSeen } from '@/lib/storage';
import { colors } from '@/theme';

// S0 launch gate. Shows only the background while reading, so nothing flashes.
export default function Index() {
  useEffect(() => {
    if (demo.on) return router.replace('/demo');
    getWelcomeSeen()
      .catch(() => false) // if storage cannot be read, ask the age question again
      .then((seen) => router.replace(seen ? '/home' : '/welcome'));
  }, []);
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
