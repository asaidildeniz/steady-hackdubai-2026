import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
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
