import { Redirect, router } from 'expo-router';
import { Text } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { demo } from '@/lib/demo';
import { clearWelcomeSeen, setWelcomeSeen } from '@/lib/storage';
import { text } from '@/theme';

// Demo mode start screen, for presenters. Reached only from the launch gate in demo mode.
export default function Demo() {
  if (!demo.on) return <Redirect href="/" />; // a normal start never shows this screen, even from a link
  const c = content.demo;
  const firstTime = async () => {
    await clearWelcomeSeen().catch(() => {});
    router.push('/welcome');
  };
  const startHome = async () => {
    await setWelcomeSeen().catch(() => {});
    router.push('/home');
  };
  return (
    <Screen showNeedHelp={false}>
      <Text accessibilityRole="header" style={text.heading}>
        {c.title}
      </Text>
      <Text style={text.note}>{c.note}</Text>
      <BigButton label={c.firstTime} onPress={firstTime} />
      <BigButton label={c.startHome} onPress={startHome} />
      <Text accessibilityRole="header" style={text.title}>
        {c.jumpHeading}
      </Text>
      {c.screens.map((s) => (
        <BigButton key={s.route} secondary label={s.label} onPress={() => router.push(s.route)} />
      ))}
    </Screen>
  );
}
