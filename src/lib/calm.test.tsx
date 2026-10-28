import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AccessibilityInfo } from 'react-native';
import Breathing from '../../app/breathing';
import Finished from '../../app/finished';
import { type Content, content } from '@/content/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
}));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});
// A private copy of the real content that each test can edit.
jest.mock('@/content/types', () => ({
  content: JSON.parse(JSON.stringify(jest.requireActual('@/content/types').content)),
}));

const shipped: Content = JSON.parse(JSON.stringify(jest.requireActual('@/content/types').content));
const seconds = (n: number) => act(async () => jest.advanceTimersByTime(n * 1000));

beforeEach(() => {
  Object.assign(content, JSON.parse(JSON.stringify(shipped)));
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  return AsyncStorage.clear();
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('S6 Breathing', () => {
  beforeEach(() => jest.useFakeTimers());

  test('finishing all cycles goes to Finished exactly once', async () => {
    await render(<Breathing />);
    expect(screen.getByText(shipped.breathing.phases[0].label)).toBeOnTheScreen();
    await seconds(55);
    expect(router.replace).not.toHaveBeenCalled();
    await seconds(10);
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/finished');
  });

  test('Stop goes back to the existing Home', async () => {
    await render(<Breathing />);
    await fireEvent.press(screen.getByRole('button', { name: shipped.breathing.stop }));
    expect(router.dismissTo).toHaveBeenCalledWith('/home');
  });

  test('leaving early cancels everything, so nothing navigates later', async () => {
    const started = jest.spyOn(globalThis, 'setInterval');
    const cleared = jest.spyOn(globalThis, 'clearInterval');
    const { unmount } = await render(<Breathing />);
    const tick = started.mock.results[started.mock.calls.findIndex((args) => args[1] === 1000)]?.value;
    expect(tick).toBeDefined();
    await seconds(10);
    await act(async () => unmount());
    expect(cleared).toHaveBeenCalledWith(tick); // the one-second timer stops with the screen
    await seconds(120);
    expect(router.replace).not.toHaveBeenCalled();
  });

  test('with reduce motion on there is no circle, only the label and countdown', async () => {
    jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
    await render(<Breathing />);
    await seconds(0);
    expect(screen.queryByTestId('breathing-circle', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByText(shipped.breathing.phases[0].label)).toBeOnTheScreen();
    expect(screen.getByText('4')).toBeOnTheScreen();
  });

  test('with reduce motion off the circle is shown', async () => {
    await render(<Breathing />);
    await seconds(0);
    expect(screen.getByTestId('breathing-circle', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  test('timings with nothing valid go straight to Finished instead of hanging', async () => {
    content.breathing.cycles = 0;
    await render(<Breathing />);
    await seconds(0);
    expect(router.replace).toHaveBeenCalledWith('/finished');
  });
});

describe('S7 Finished', () => {
  test('Better returns Home and Still hard opens Talk to someone; nothing is saved', async () => {
    await render(<Finished />);
    await fireEvent.press(screen.getByRole('button', { name: 'Better' }));
    expect(router.dismissTo).toHaveBeenCalledWith('/home');
    await fireEvent.press(screen.getByRole('button', { name: 'Still hard' }));
    expect(router.push).toHaveBeenCalledWith('/talk-to-someone');
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test('routing follows each option\'s next, not its position', async () => {
    content.finished.options = [...shipped.finished.options].reverse();
    await render(<Finished />);
    await fireEvent.press(screen.getByRole('button', { name: 'Still hard' }));
    expect(router.push).toHaveBeenCalledWith('/talk-to-someone');
    expect(router.dismissTo).not.toHaveBeenCalled();
  });
});
