import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AccessibilityInfo, BackHandler } from 'react-native';
import AdultsOnly from '../../app/adults-only';
import Index from '../../app/index';
import Welcome from '../../app/welcome';
import { content } from '@/content/types';

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

beforeEach(() => AsyncStorage.clear());
afterEach(() => jest.clearAllMocks());

const w = content.welcome;

describe('S0 launch gate', () => {
  test('a fresh install goes to Welcome, and shows no text while reading', async () => {
    await render(<Index />);
    expect(screen.queryAllByText(/./)).toHaveLength(0);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/welcome'));
    expect(router.push).not.toHaveBeenCalled();
  });

  test('a returning adult goes straight to Home', async () => {
    await AsyncStorage.setItem('steady.welcomeSeen', 'true');
    await render(<Index />);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/home'));
  });
});

describe('S1 age gate', () => {
  async function reachAgeQuestion() {
    await render(<Welcome />);
    expect(screen.queryByRole('button', { name: content.needHelpButton.label })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: w.continue }));
    expect(screen.getByText(w.ageQuestion)).toBeOnTheScreen();
  }

  test('step 1 says where to turn in danger', async () => {
    await render(<Welcome />);
    expect(screen.getByText(w.inDanger)).toBeOnTheScreen();
  });

  test('the age question takes screen-reader focus and says the answer stays on the phone', async () => {
    const focus = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus');
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await reachAgeQuestion();
    expect(screen.getByText(w.answerStays)).toBeOnTheScreen();
    await waitFor(() =>
      expect(focus.mock.calls.length + announce.mock.calls.filter(([m]) => m === w.ageQuestion).length).toBe(1),
    );
  });

  test('Android back on the age question returns to the intro, stores nothing and never passes the gate', async () => {
    const listen = jest.spyOn(BackHandler, 'addEventListener');
    await reachAgeQuestion();
    const onBack = listen.mock.calls.findLast(([event]) => event === 'hardwareBackPress')?.[1];
    expect(onBack).toBeDefined();
    let handled: boolean | null | undefined;
    await act(async () => {
      handled = (onBack as () => boolean)();
    });
    expect(handled).toBe(true);
    expect(screen.getByRole('button', { name: w.continue })).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalled();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test('the visible Back on the age question returns to the intro and stores nothing', async () => {
    await reachAgeQuestion();
    await fireEvent.press(screen.getByRole('button', { name: w.back }));
    expect(screen.getByRole('button', { name: w.continue })).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalled();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test('a fast second tap is ignored: under 18 first still stores nothing', async () => {
    await reachAgeQuestion();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: w.underAge }));
      fireEvent.press(screen.getByRole('button', { name: w.adult }));
    });
    await waitFor(() => expect(router.replace).toHaveBeenCalled());
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/adults-only');
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test('a fast second tap is ignored: 18 or older first goes Home once', async () => {
    await reachAgeQuestion();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: w.adult }));
      fireEvent.press(screen.getByRole('button', { name: w.underAge }));
    });
    await waitFor(() => expect(router.replace).toHaveBeenCalled());
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/home');
  });

  test('under 18 stores nothing at all and replaces to Adults only', async () => {
    await reachAgeQuestion();
    await fireEvent.press(screen.getByRole('button', { name: w.underAge }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/adults-only'));
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
    expect(router.push).not.toHaveBeenCalled();
  });

  test('18 or older stores only steady.welcomeSeen and replaces to Home', async () => {
    await reachAgeQuestion();
    await fireEvent.press(screen.getByRole('button', { name: w.adult }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/home'));
    expect(await AsyncStorage.getAllKeys()).toEqual(['steady.welcomeSeen']);
    expect(router.push).not.toHaveBeenCalled();
  });
});

describe('S2 adults only', () => {
  test('shows the kind message and where to get help, with no buttons and no storage', async () => {
    await render(<AdultsOnly />);
    expect(screen.getByText(content.adultsOnly.message)).toBeOnTheScreen();
    expect(screen.getByText(content.adultsOnly.whereToGetHelp)).toBeOnTheScreen();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });
});
