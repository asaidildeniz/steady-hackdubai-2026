import { Redirect } from 'expo-router';

// shortcut: the real S0 launch gate (welcomeSeen check) lands in Phase 3.
export default function Index() {
  return <Redirect href="/home" />;
}
