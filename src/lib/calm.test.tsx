import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AccessibilityInfo, AppState } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import Breathing from '../../app/breathing';
import Finished from '../../app/finished';
import { type Content, content } from '@/content/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
// Finished resets its answer guard on focus; tests call mockOnFocus to act out "coming back".
let mockOnFocus: (() => void) | undefined;
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
  useFocusEffect: (cb: () => void) => {
    mockOnFocus = cb;
  },
}));
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
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
const b = shipped.breathing;
const opt = (n: number) => b.lengthOption.replace('{n}', String(n));
const left = (time: string) => b.timeLeft.replace('{time}', time);
const secs = (n: number) => b.seconds.replace('{n}', String(n));

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

  test('with reduce motion on there is no moving droplet, only the words and the seconds', async () => {
    jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
    await render(<Breathing />);
    await seconds(0);
    expect(screen.queryByTestId('breathing-circle', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByText(shipped.breathing.phases[0].label)).toBeOnTheScreen();
    expect(screen.getAllByText(secs(4)).length).toBeGreaterThan(0);
  });

  test('shows the seconds of breathing in, holding and breathing out; the current step counts down', async () => {
    await render(<Breathing />);
    for (const p of b.phases) expect(screen.getByText(p.short!)).toBeOnTheScreen();
    expect(screen.getAllByText(secs(4))).toHaveLength(2); // In 4s (now), Hold 4s
    expect(screen.getByText(secs(6))).toBeOnTheScreen(); // Out 6s
    await seconds(3);
    expect(screen.getByText(secs(1))).toBeOnTheScreen(); // In counts down
    expect(screen.getByText(secs(4))).toBeOnTheScreen(); // Hold still shows its full length
    expect(
      screen.getByLabelText(b.phases.map((p) => b.patternLabel.replace('{label}', p.label.replace(/…$/, '')).replace('{n}', String(p.seconds))).join(', ')),
    ).toBeOnTheScreen(); // read out once, as a whole
  });

  test('with reduce motion off the circle is shown', async () => {
    await render(<Breathing />);
    await seconds(0);
    expect(screen.getByTestId('breathing-circle', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  test('locking the phone pauses the exercise; coming back restarts the current phase', async () => {
    const listen = jest.spyOn(AppState, 'addEventListener');
    await render(<Breathing />);
    const onChange = listen.mock.calls.find(([event]) => event === 'change')?.[1] as (s: string) => void;
    expect(onChange).toBeDefined();
    await seconds(2); // Breathe in, 2 seconds left
    await act(async () => onChange('background'));
    await seconds(120);
    expect(router.replace).not.toHaveBeenCalled(); // nothing ran while away
    await act(async () => onChange('active'));
    expect(screen.getByText(shipped.breathing.phases[0].label)).toBeOnTheScreen();
    expect(screen.getByText(left('0:56'))).toBeOnTheScreen(); // the phase starts again from the top
  });

  test('coming back after a lock announces the restarted phase to screen readers', async () => {
    const listen = jest.spyOn(AppState, 'addEventListener');
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await render(<Breathing />);
    const onChange = listen.mock.calls.find(([event]) => event === 'change')?.[1] as (s: string) => void;
    await seconds(2);
    const label = shipped.breathing.phases[0].label;
    const before = announce.mock.calls.filter(([m]) => m === label).length;
    await act(async () => onChange('background'));
    await act(async () => onChange('active'));
    expect(announce.mock.calls.filter(([m]) => m === label).length).toBe(before + 1);
  });

  test('Stop is pinned outside the scrolling area, so it is always visible', async () => {
    await render(<Breathing />);
    let node = screen.getByRole('button', { name: shipped.breathing.stop }).parent;
    while (node) {
      expect(String(node.type)).not.toMatch(/ScrollView/);
      node = node.parent;
    }
  });

  test('keeps the screen awake while open', async () => {
    await render(<Breathing />);
    expect(useKeepAwake).toHaveBeenCalled();
  });

  test('shows the time left, counting down', async () => {
    await render(<Breathing />);
    expect(screen.getByText(left('0:56'))).toBeOnTheScreen();
    await seconds(14);
    expect(screen.getByText(left('0:42'))).toBeOnTheScreen();
  });

  test('choosing 2 minutes repeats the same breath for longer instead of stretching it', async () => {
    await render(<Breathing />);
    await fireEvent.press(screen.getByRole('button', { name: `${b.length}: ${opt(1)}` }));
    await fireEvent.press(screen.getByRole('button', { name: opt(2) }));
    expect(screen.getByText(left('2:06'))).toBeOnTheScreen(); // 9 breaths of 14 s
    await seconds(14);
    expect(screen.getByText(shipped.breathing.phases[0].label)).toBeOnTheScreen(); // breath 2 starts after 14 s, as before
    await seconds(56);
    expect(router.replace).not.toHaveBeenCalled(); // the 1-minute end has passed
    await seconds(60);
    expect(router.replace).toHaveBeenCalledWith('/finished');
  });

  test('a shorter length chosen mid-session never cuts the current breath short', async () => {
    await render(<Breathing />);
    await fireEvent.press(screen.getByRole('button', { name: `${b.length}: ${opt(1)}` }));
    await fireEvent.press(screen.getByRole('button', { name: opt(3) }));
    await seconds(60); // into breath 5 of 13
    await fireEvent.press(screen.getByRole('button', { name: `${b.length}: ${opt(3)}` }));
    await fireEvent.press(screen.getByRole('button', { name: opt(1) }));
    expect(router.replace).not.toHaveBeenCalled();
    expect(screen.getByText(left('0:10'))).toBeOnTheScreen(); // finishes breath 5 (70 s), then stops
    await seconds(10);
    expect(router.replace).toHaveBeenCalledWith('/finished');
  });

  test('Pause stops the clock; Resume starts the phase again from the top', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await render(<Breathing />);
    await seconds(2);
    await fireEvent.press(screen.getByRole('button', { name: b.pause }));
    await seconds(120);
    expect(router.replace).not.toHaveBeenCalled();
    expect(screen.getByText(left('0:54'))).toBeOnTheScreen();
    const before = announce.mock.calls.length;
    await fireEvent.press(screen.getByRole('button', { name: b.resume }));
    expect(screen.getByText(left('0:56'))).toBeOnTheScreen();
    expect(announce.mock.calls.length).toBe(before + 1); // the phase is announced again
  });

  test('timings with nothing valid go straight to Finished instead of hanging', async () => {
    content.breathing.phases = [];
    await render(<Breathing />);
    await seconds(0);
    expect(router.replace).toHaveBeenCalledWith('/finished');
  });
});

describe('S7 Finished', () => {
  test('Better returns Home and nothing is saved', async () => {
    await render(<Finished />);
    await fireEvent.press(screen.getByRole('button', { name: shipped.finished.options[0].label }));
    expect(router.dismissTo).toHaveBeenCalledWith('/home');
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test('Still hard opens Talk to someone and nothing is saved', async () => {
    await render(<Finished />);
    await fireEvent.press(screen.getByRole('button', { name: shipped.finished.options[1].label }));
    expect(router.push).toHaveBeenCalledWith('/talk-to-someone');
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test('coming back from Talk to someone, the answers work again', async () => {
    await render(<Finished />);
    await fireEvent.press(screen.getByRole('button', { name: shipped.finished.options[1].label }));
    await act(async () => mockOnFocus?.());
    await fireEvent.press(screen.getByRole('button', { name: shipped.finished.options[0].label }));
    expect(router.dismissTo).toHaveBeenCalledWith('/home');
  });

  test('routing follows each option\'s next, not its position', async () => {
    content.finished.options = [...shipped.finished.options].reverse();
    await render(<Finished />);
    await fireEvent.press(screen.getByRole('button', { name: shipped.finished.options[1].label }));
    expect(router.push).toHaveBeenCalledWith('/talk-to-someone');
    expect(router.dismissTo).not.toHaveBeenCalled();
  });

  test('a fast second tap does nothing: Talk to someone opens once', async () => {
    await render(<Finished />);
    const stillHard = screen.getByRole('button', { name: shipped.finished.options[1].label });
    await fireEvent.press(stillHard);
    await fireEvent.press(stillHard);
    await fireEvent.press(screen.getByRole('button', { name: shipped.finished.options[0].label }));
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.dismissTo).not.toHaveBeenCalled();
  });

  test('screen-reader focus moves to the question when the screen opens', async () => {
    jest.useFakeTimers();
    const focus = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus');
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await render(<Finished />);
    await seconds(1);
    expect(
      focus.mock.calls.length + announce.mock.calls.filter(([m]) => m === content.finished.prompt).length,
    ).toBe(1);
  });

  test('options with a blank label are skipped', async () => {
    content.finished.options = [{ label: '  ', next: 'home' }, ...shipped.finished.options];
    await render(<Finished />);
    expect(screen.getAllByRole('button').map((b) => b.props.accessibilityLabel)).not.toContain('  ');
    expect(screen.getByRole('button', { name: shipped.finished.options[0].label })).toBeOnTheScreen();
  });

  test('the shipped content has at least one answer with a label and a known destination', () => {
    const ok = shipped.finished.options.filter(
      (o) => o.label?.trim() && (o.next === 'home' || o.next === 'talkToSomeone'),
    );
    expect(ok.length).toBeGreaterThan(0);
  });
});
