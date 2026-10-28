import { Redirect } from 'expo-router';

// shortcut: S6 Breathing lands in Phase 4. Until then, go back to Home so nothing dead-ends.
export default function Breathing() {
  return <Redirect href="/home" />;
}
