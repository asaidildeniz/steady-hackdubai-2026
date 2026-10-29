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

  test('Talk to someone shows no demo contact', async () => {
    await render(<TalkToSomeone />);
    expect(screen.queryByText(d.contact.name)).toBeNull();
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

  test('the demo contact can be tapped but never dials, and real contacts stay disabled', async () => {
    const open = jest.spyOn(Linking, 'openURL');
    await render(<TalkToSomeone />);
    const call = screen.getByRole('button', { name: `${content.talkToSomeone.call} ${d.contact.name}` });
    expect(call).toBeEnabled();
    await fireEvent.press(call);
    expect(open).not.toHaveBeenCalled();
    expect(screen.getByText(d.callNote)).toBeOnTheScreen();
    for (const contact of content.talkToSomeone.contacts) {
      expect(screen.getByRole('button', { name: `${content.talkToSomeone.call} ${contact.name}` })).toBeDisabled();
    }
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
    expect(copy.finished.message).toBe('The minute is over. Take your time.');
    expect(copy.breathing.phases).toEqual(content.breathing.phases); // nothing else changes
  });
});
