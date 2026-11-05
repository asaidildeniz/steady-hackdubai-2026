import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import Untangle from '../../app/untangle';
import { content } from '@/content/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismissTo: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

const u = content.untangle;
const button = (name: string) => screen.getByRole('button', { name });
const thought = 'I failed this exam, so my whole future is ruined.';
// "Use example" fills the box without the reviewer's "Draft:" label.
const filled = (s: string) => {
  const t = s.replace(/^Draft:\s*/, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

beforeEach(() => AsyncStorage.clear());
afterEach(() => jest.clearAllMocks());

async function toStep(n: 1 | 2 | 3 | 4 | 5 | 6) {
  await render(<Untangle />);
  await fireEvent.press(button(u.begin));
  if (n === 1) return;
  await fireEvent.press(button(u.name.examples[0]));
  await fireEvent.press(button(u.next));
  if (n === 2) return;
  await fireEvent.press(button(u.stepBack.button));
  if (n === 3) return;
  await fireEvent.press(button(u.next));
  if (n === 4) return;
  await fireEvent.press(button(u.useExample));
  await fireEvent.press(button(u.next));
  if (n === 5) return;
  await fireEvent.press(button(u.useExample));
  await fireEvent.press(button(u.next));
}

test('the intro shows your three stages', async () => {
  await render(<Untangle />);
  for (const step of u.steps) expect(screen.getByText(step.title)).toBeOnTheScreen();
});

test('1 Name it: Next waits for a thought; an example fills it in', async () => {
  await toStep(1);
  expect(button(u.next)).toBeDisabled();
  await fireEvent.press(button(u.name.examples[0]));
  expect(screen.getByLabelText(u.name.label).props.value).toBe(thought);
  expect(button(u.next)).toBeEnabled();
});

test('2 Step back: the thought is shown after "I\'m having the thought that"', async () => {
  await toStep(2);
  expect(screen.getByText(u.stepBack.title)).toBeOnTheScreen();
  expect(screen.getByText(`${u.stepBack.prefix} I failed this exam, so my whole future is ruined.`)).toBeOnTheScreen();
  expect(screen.getByText(`${u.stepBack.prefix2} I failed this exam, so my whole future is ruined.`)).toBeOnTheScreen();
});

test('3 Know or guess: each part is marked, and the reply follows the marks', async () => {
  await toStep(3);
  await fireEvent.press(button(`${u.knowGuess.know}: I failed this exam`));
  expect(screen.getByText(u.knowGuess.allKnown)).toBeOnTheScreen();
  await fireEvent.press(button(`${u.knowGuess.guess}: My whole future is ruined`));
  expect(screen.getByText(u.knowGuess.guessOne)).toBeOnTheScreen();
});

test('4 Tell a friend: Next waits for an answer; Use example fills it in', async () => {
  await toStep(4);
  expect(screen.getByText(`“${thought}”`)).toBeOnTheScreen();
  expect(button(u.next)).toBeDisabled();
  await fireEvent.press(button(u.useExample));
  expect(screen.getByLabelText(u.friend.label).props.value).toBe(filled(u.friend.example));
});

test('the whole way through: summary, then How do you feel now; nothing saved or sent', async () => {
  await toStep(6);
  await fireEvent.changeText(screen.getByLabelText(u.nextStep.label), 'Email my tutor');
  await fireEvent.press(button(u.nextStep.when[2]));
  await fireEvent.press(button(u.nextStep.see));
  expect(screen.getByText(u.summary.heading)).toBeOnTheScreen();
  expect(screen.getByText(thought)).toBeOnTheScreen();
  expect(screen.getByText(filled(u.balanced.example))).toBeOnTheScreen();
  expect(screen.getByText('Email my tutor')).toBeOnTheScreen();
  expect(screen.getByText(`${u.summary.step} · ${u.nextStep.when[2]}`)).toBeOnTheScreen();
  await fireEvent.press(button(u.done));
  expect(router.replace).toHaveBeenCalledWith('/finished');
  expect(await AsyncStorage.getAllKeys()).toEqual([]);
  expect(JSON.stringify(jest.mocked(router.replace).mock.calls)).not.toContain('tutor');
});

test('Untangle another starts again with an empty page', async () => {
  await toStep(6);
  await fireEvent.press(button(u.useExample));
  await fireEvent.press(button(u.nextStep.see));
  await fireEvent.press(button(u.another));
  expect(screen.getByText(u.name.title)).toBeOnTheScreen();
  expect(screen.getByLabelText(u.name.label).props.value).toBe('');
});
