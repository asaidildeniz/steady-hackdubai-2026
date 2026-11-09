import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Share } from 'react-native';
import ReachOut from '../../app/reach-out';
import Results from '../../app/results';
import { content } from '@/content/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismissTo: jest.fn() },
  useLocalSearchParams: jest.fn(),
  Redirect: () => null,
}));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

const r = content.reachOut;
const button = (name: string) => screen.getByRole('button', { name });
// A message is placed in the box without the reviewer's "Draft:" label, so it can never be sent.
const clean = (s: string) => {
  const t = s.replace(/^Draft:\s*/, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const field = () => screen.getByLabelText(r.message.label);

let share: jest.SpyInstance;
beforeEach(async () => {
  await AsyncStorage.clear();
  share = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction, activityType: undefined });
});
afterEach(() => jest.restoreAllMocks());

async function toMessage(need = 0) {
  await render(<ReachOut />);
  await fireEvent.press(button(r.moment.skip));
  await fireEvent.press(button(r.needs.options[need].label));
}

test('the Reach Out card on a feeling page opens the Reach Out tool', async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ f: 'lonely' });
  await render(<Results />);
  // Feeling low puts Reach Out first.
  await fireEvent.press(button(`${content.feelingPages.start} ${content.tools.reachOut.title}`));
  expect(router.push).toHaveBeenCalledWith('/reach-out');
});

test('the kind moment goes one line at a time, then asks what would help', async () => {
  await render(<ReachOut />);
  expect(screen.getByText(clean(r.moment.lines[0].text))).toBeOnTheScreen();
  for (let i = 0; i < r.moment.lines.length - 1; i++) await fireEvent.press(button(r.moment.next));
  expect(screen.getByText(clean(r.moment.lines[r.moment.lines.length - 1].text))).toBeOnTheScreen();
  await fireEvent.press(button(r.moment.continue));
  expect(screen.getByText(r.needs.heading)).toBeOnTheScreen();
});

test('Skip goes straight to the three needs', async () => {
  await render(<ReachOut />);
  await fireEvent.press(button(r.moment.skip));
  for (const need of r.needs.options) expect(button(need.label)).toBeOnTheScreen();
});

test('a need fills the box with its first casual message, without the Draft label', async () => {
  await toMessage(0);
  expect(field().props.value).toBe(clean(r.needs.options[0].casual[0]));
  expect(field().props.value).not.toMatch(/Draft/);
});

test('tone and "another wording" change the message', async () => {
  await toMessage(1);
  await fireEvent.press(button(r.message.open));
  expect(field().props.value).toBe(clean(r.needs.options[1].open[0]));
  await fireEvent.press(button(r.message.another));
  expect(field().props.value).toBe(clean(r.needs.options[1].open[1]));
});

test('Send shares exactly what the student wrote, through the phone', async () => {
  await toMessage(2);
  await fireEvent.changeText(field(), 'Hi Sam, could we talk this week?');
  await fireEvent.press(button(r.message.send));
  expect(share).toHaveBeenCalledWith({ message: 'Hi Sam, could we talk this week?' });
});

test('an empty message cannot be sent', async () => {
  await toMessage(0);
  await fireEvent.changeText(field(), '   ');
  expect(button(r.message.send)).toBeDisabled();
});

test('nothing from Reach Out is ever saved', async () => {
  const setItem = jest.spyOn(AsyncStorage, 'setItem');
  await toMessage(0);
  await fireEvent.changeText(field(), 'something private');
  await fireEvent.press(button(r.message.send));
  expect(setItem).not.toHaveBeenCalled();
});

test('Arrange a time to talk is one tap away', async () => {
  await toMessage(0);
  await fireEvent.press(button(r.message.talk));
  expect(router.push).toHaveBeenCalledWith('/talk-to-someone');
});
