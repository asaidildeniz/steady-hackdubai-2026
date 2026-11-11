import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AccessibilityInfo, Linking } from 'react-native';
import Breathing from '../../app/breathing';
import Demo from '../../app/demo';
import Index from '../../app/index';
import TalkToSomeone from '../../app/talk-to-someone';
import { content } from '@/content/types';
import { demo, dropDraftLabels } from '@/lib/demo';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  return {
    router: { push: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
    Redirect: ({ href }: { href: string }) => <Text>{`redirect:${href}`}</Text>,
  };
});
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

const d = content.demo;

beforeEach(() => AsyncStorage.clear());
afterEach(() => {
  demo.on = false;
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('a normal start', () => {
  test('demo mode is off unless started with npm run demo', () => {
    expect(process.env.EXPO_PUBLIC_DEMO).toBeUndefined();
    expect(demo.on).toBe(false);
  });

  test('the launch gate never opens the demo screen', async () => {
    await render(<Index />);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/welcome'));
    expect(router.replace).not.toHaveBeenCalledWith('/demo');
  });

  test('the demo screen, opened by a link, sends you back to the normal start', async () => {
    await render(<Demo />);
    expect(screen.getByText('redirect:/')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: d.firstTime })).toBeNull();
  });

  test('Talk to someone shows no example contacts', async () => {
    await render(<TalkToSomeone />);
    for (const example of d.contacts) expect(screen.queryByText(example.name)).toBeNull();
  });
});

describe('demo mode', () => {
  beforeEach(() => {
    demo.on = true;
  });

  test('the launch gate opens the demo screen', async () => {
    await render(<Index />);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/demo'));
  });

  test('"first-time visitor" removes only the welcome flag and opens Welcome', async () => {
    await AsyncStorage.setItem('steady.welcomeSeen', 'true');
    await render(<Demo />);
    await fireEvent.press(screen.getByRole('button', { name: d.firstTime }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/welcome'));
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test('"Start at Home" passes the age gate the normal way', async () => {
    await render(<Demo />);
    await fireEvent.press(screen.getByRole('button', { name: d.startHome }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/home'));
    expect(await AsyncStorage.getAllKeys()).toEqual(['steady.welcomeSeen']);
  });

  test('breathing reaches Finished in under 10 seconds', async () => {
    jest.useFakeTimers();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await render(<Breathing />);
    await act(async () => jest.advanceTimersByTime(9_000));
    expect(router.replace).toHaveBeenCalledWith('/finished');
  });

  test('example contacts replace the placeholders; the tappable one never dials', async () => {
    const open = jest.spyOn(Linking, 'openURL');
    await render(<TalkToSomeone />);
    for (const placeholder of content.talkToSomeone.contacts) {
      expect(screen.queryByText(placeholder.name)).toBeNull();
    }
    const callOf = (name: string) => screen.getByRole('button', { name: `${content.talkToSomeone.call} ${name}` });
    const [tappable, pending] = d.contacts;
    expect(tappable.tappable).toBe(true);
    expect(pending.tappable).toBeFalsy();
    expect(callOf(pending.name)).toBeDisabled();
    expect(callOf(tappable.name)).toBeEnabled();
    await fireEvent.press(callOf(tappable.name));
    expect(open).not.toHaveBeenCalled();
    expect(screen.getByText(d.callNote)).toBeOnTheScreen();
  });

  // Checklist 04: test numbers only, never a real person's. 00 is not a UAE prefix, so it reaches no one.
  test('example contacts carry no number or only the obviously fake test number', () => {
    for (const example of d.contacts) expect(['', '+971 00 000 0000']).toContain(example.phone);
  });
});

describe('a private demo number (EXPO_PUBLIC_DEMO_PHONE in .env.local)', () => {
  const callOf = (name: string) => screen.getByRole('button', { name: `${content.talkToSomeone.call} ${name}` });
  const [tappable, pending] = d.contacts;
  beforeEach(() => {
    process.env.EXPO_PUBLIC_DEMO_PHONE = ' +000 111 ';
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });
  afterEach(() => delete process.env.EXPO_PUBLIC_DEMO_PHONE);

  test('in demo mode, Call on the tappable example opens the dialer with it', async () => {
    demo.on = true;
    await render(<TalkToSomeone />);
    await fireEvent.press(callOf(tappable.name));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:+000111');
    expect(screen.queryByText(d.callNote)).toBeNull();
  });

  test('the example still waiting for verification stays off', async () => {
    demo.on = true;
    await render(<TalkToSomeone />);
    expect(callOf(pending.name)).toBeDisabled();
  });

  test('a normal start ignores it', async () => {
    await render(<TalkToSomeone />);
    for (const button of screen.queryAllByRole('button', { name: new RegExp(`^${content.talkToSomeone.call} `) })) {
      expect(button).toBeDisabled();
    }
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  test('an empty number keeps the note instead of dialling', async () => {
    demo.on = true;
    process.env.EXPO_PUBLIC_DEMO_PHONE = '  ';
    await render(<TalkToSomeone />);
    await fireEvent.press(callOf(tappable.name));
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(screen.getByText(d.callNote)).toBeOnTheScreen();
  });
});

describe('Draft labels', () => {
  const strings = (value: unknown): string[] =>
    typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];

  test('a normal start keeps every Draft: label for the reviewer', () => {
    expect(strings(content).filter((s) => s.startsWith('Draft:')).length).toBeGreaterThan(5);
  });

  test('demo mode shows the wording without Draft:, starting with a capital', () => {
    const copy = JSON.parse(JSON.stringify(content));
    dropDraftLabels(copy);
    const { reviewStatus, reviewNotes, ...shown } = copy; // reviewer-only fields, never on screen
    expect(strings(shown).filter((s) => /^draft:/i.test(s))).toEqual([]);
    expect(copy.finished.message).toBe('Whatever the answer is, it’s okay.');
    expect(copy.breathing.phases).toEqual(content.breathing.phases); // nothing else changes
  });
});
