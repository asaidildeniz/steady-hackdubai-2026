import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactElement } from 'react';
import Breathing from '../../app/breathing';
import CheckIn from '../../app/check-in';
import CheckInResult from '../../app/check-in-result';
import Finished from '../../app/finished';
import Home from '../../app/home';
import Index from '../../app/index';
import NeedHelp from '../../app/need-help';
import TalkToSomeone from '../../app/talk-to-someone';
import Welcome from '../../app/welcome';
import { content } from '@/content/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
  useLocalSearchParams: jest.fn(),
  useFocusEffect: jest.fn(),
  Redirect: () => null,
}));
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

beforeEach(() => AsyncStorage.clear());
afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

// Opens a screen and taps every button on it, each on a fresh copy, so no first-tap guard hides a press.
async function tapEverything(ui: ReactElement) {
  const first = await render(ui);
  const count = first.queryAllByRole('button').length;
  await first.unmount();
  for (let i = 0; i < count; i++) {
    const view = await render(ui);
    const button = view.queryAllByRole('button')[i];
    if (button) await fireEvent.press(button);
    await view.unmount();
  }
}

// Section 12, check 3: after a full session the only key on the phone is steady.welcomeSeen.
test('a whole session leaves only steady.welcomeSeen in storage', async () => {
  const launch = await render(<Index />);
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/welcome'));
  await launch.unmount();

  const welcome = await render(<Welcome />);
  await fireEvent.press(welcome.getByRole('button', { name: content.welcome.continue }));
  await fireEvent.press(welcome.getByRole('button', { name: content.welcome.adult }));
  await welcome.unmount();

  await tapEverything(<Home />);
  await tapEverything(<CheckIn />);
  for (const group of ['kind', 'gentle']) {
    jest.mocked(useLocalSearchParams).mockReturnValue({ group });
    await tapEverything(<CheckInResult />);
  }

  jest.useFakeTimers();
  const breathing = await render(<Breathing />);
  await act(async () => jest.advanceTimersByTime(60_000));
  await breathing.unmount();
  jest.useRealTimers();

  await tapEverything(<Finished />);
  await tapEverything(<TalkToSomeone />);
  await tapEverything(<NeedHelp />);

  expect(await AsyncStorage.getAllKeys()).toEqual(['steady.welcomeSeen']);
});
