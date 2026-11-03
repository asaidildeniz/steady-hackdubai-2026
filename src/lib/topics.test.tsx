import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import CheckInResult from '../../app/check-in-result';
import Topic from '../../app/topic';
import Topics from '../../app/topics';
import { content } from '@/content/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  return {
    router: { push: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
    useLocalSearchParams: jest.fn(),
    Redirect: ({ href }: { href: string }) => <Text>{`redirect:${href}`}</Text>,
  };
});
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

const t = content.topics;
const button = (name: string) => screen.getByRole('button', { name });

beforeEach(() => AsyncStorage.clear());
afterEach(() => jest.clearAllMocks());

describe('reaching the topics', () => {
  test('a gentle check-in offers the topics', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ group: 'gentle' });
    await render(<CheckInResult />);
    await fireEvent.press(button(content.results.gentle.topics));
    expect(router.push).toHaveBeenCalledWith('/topics');
  });

  test('a kind check-in does not', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ group: 'kind' });
    await render(<CheckInResult />);
    expect(screen.queryByRole('button', { name: content.results.gentle.topics })).toBeNull();
  });
});

describe('the topic list', () => {
  test('content has five topics with unique ids and something to read', () => {
    expect(t.list).toHaveLength(5);
    expect(new Set(t.list.map((x) => x.id)).size).toBe(5);
    for (const x of t.list) {
      expect(x.label.trim()).not.toBe('');
      expect(x.opening.trim()).not.toBe('');
      expect(x.tips.length).toBeGreaterThan(0);
    }
  });

  test.each(t.list.map((x) => [x.label, x.id]))('"%s" opens its own topic', async (label, id) => {
    await render(<Topics />);
    await fireEvent.press(button(label));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/topic', params: { id } });
  });

  test('"Something else" goes to Talk to someone', async () => {
    await render(<Topics />);
    await fireEvent.press(button(t.other));
    expect(router.push).toHaveBeenCalledWith('/talk-to-someone');
  });
});

describe('a topic', () => {
  const [first] = t.list;
  beforeEach(() => jest.mocked(useLocalSearchParams).mockReturnValue({ id: first.id }));

  test('shows its opening and every tip', async () => {
    await render(<Topic />);
    expect(screen.getByText(first.opening)).toBeOnTheScreen();
    for (const tip of first.tips) expect(screen.getByText(tip, { exact: false })).toBeOnTheScreen();
  });

  test('an unknown topic goes back to the list', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: 'nope' });
    await render(<Topic />);
    expect(screen.getByText('redirect:/topics')).toBeOnTheScreen();
  });

  test('the faith part starts closed, opens on request, and is never saved', async () => {
    const view = await render(<Topic />);
    expect(screen.queryByText(first.faith)).toBeNull();
    await fireEvent.press(button(t.faithShow));
    expect(screen.getByText(first.faith)).toBeOnTheScreen();
    await view.unmount();

    await render(<Topic />);
    expect(screen.queryByText(first.faith)).toBeNull();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test('Breathe opens the calm moment', async () => {
    await render(<Topic />);
    await fireEvent.press(button(t.breathe));
    expect(router.push).toHaveBeenCalledWith('/breathing');
  });

  test('Talk to someone opens the list of people', async () => {
    await render(<Topic />);
    await fireEvent.press(button(t.talk));
    expect(router.push).toHaveBeenCalledWith('/talk-to-someone');
  });
});
