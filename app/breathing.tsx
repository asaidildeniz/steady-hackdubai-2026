import { router } from 'expo-router';
import { useEffect } from 'react';

// shortcut: S6 Breathing lands in Phase 4. Until then, return to the existing Home so nothing dead-ends.
export default function Breathing() {
  useEffect(() => router.dismissTo('/home'), []);
  return null;
}
