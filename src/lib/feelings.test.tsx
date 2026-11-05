import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import CheckIn from '../../app/check-in';
import Results from '../../app/results';
import { content } from '@/content/types';
import { heading } from '@/lib/matching';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
  useLocalSearchParams: jest.fn(),
  Redirect: () => null,
}));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});
// The on-phone model can't run in Jest. By default it is "not available" (as in Expo Go); tests swap in answers.
jest.mock('@/lib/embedder', () => ({
  meaningTags: jest.fn(async () => null),
  startEmbedder: jest.fn(),
  embedderStatus: jest.fn(() => ({ state: 'failed', error: 'no native module' })),
  explain: jest.fn(async () => null),
  goldenReport: jest.fn(async () => null),
}));
const { meaningTags } = jest.requireMock('@/lib/embedder') as { meaningTags: jest.Mock };

const c = content.checkIn;
const m = content.matching;
const button = (name: string) => screen.getByRole('button', { name });
const results = (f = '', t = '', n = '') => ({ pathname: '/results', params: { f, t, n } });

beforeEach(() => AsyncStorage.clear());
afterEach(() => jest.clearAllMocks());

describe("Abel's check-in", () => {
  test.each(c.chips.map((chip) => [chip.label, chip.feeling]))('tapping the "%s" chip opens its results', async (label, id) => {
    await render(<CheckIn />);
    await fireEvent.press(button(label));
    expect(router.push).toHaveBeenCalledWith(results(id));
  });

  test('"I don\'t feel safe right now" always opens Need help now', async () => {
    await render(<CheckIn />);
    await fireEvent.press(button(c.unsafe));
    expect(router.push).toHaveBeenCalledWith('/need-help');
  });

  test('Find is off until something is typed', async () => {
    await render(<CheckIn />);
    expect(button(c.find)).toBeDisabled();
  });

  test('typed words become tags; the text itself never leaves the screen and nothing is saved', async () => {
    const typed = 'I keep panicking about my exams';
    await render(<CheckIn />);
    await fireEvent.changeText(screen.getByLabelText(c.typeLabel), typed);
    await fireEvent.press(button(c.find));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith(results('anxious', 'study')));
    expect(JSON.stringify(jest.mocked(router.push).mock.calls)).not.toContain('panicking');
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test('a crisis phrase skips the search and opens Need help now', async () => {
    await render(<CheckIn />);
    await fireEvent.changeText(screen.getByLabelText(c.typeLabel), "honestly I can't go on");
    await fireEvent.press(button(c.find));
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith('/need-help');
  });

  test('with the model ready, meaning tags are added to the keyword tags', async () => {
    meaningTags.mockResolvedValueOnce({ feelings: ['lonely'], themes: ['comparison'], needs: [] });
    await render(<CheckIn />);
    await fireEvent.changeText(screen.getByLabelText(c.typeLabel), "everyone's moving on without me and I'm stressed");
    await fireEvent.press(button(c.find));
    // keywords: "stressed" and "moving" (change); meaning adds lonely and comparison
    await waitFor(() => expect(router.push).toHaveBeenCalledWith(results('stressed,lonely', 'change,comparison')));
  });

  test('a crisis phrase wins before the model is ever asked', async () => {
    await render(<CheckIn />);
    await fireEvent.changeText(screen.getByLabelText(c.typeLabel), 'I want to die');
    await fireEvent.press(button(c.find));
    expect(router.push).toHaveBeenCalledWith('/need-help');
    expect(meaningTags).not.toHaveBeenCalled();
  });

  test('if the model fails, the keyword tags are still used', async () => {
    meaningTags.mockRejectedValueOnce(new Error('native crash'));
    await render(<CheckIn />);
    await fireEvent.changeText(screen.getByLabelText(c.typeLabel), 'so stressed');
    await fireEvent.press(button(c.find));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith(results('stressed')));
  });

  test('the box is cleared after searching', async () => {
    await render(<CheckIn />);
    await fireEvent.changeText(screen.getByLabelText(c.typeLabel), 'stressed');
    await fireEvent.press(button(c.find));
    expect(screen.getByLabelText(c.typeLabel).props.value).toBe('');
  });
});

describe('results', () => {
  const show = (f = '', t = '', n = '') => jest.mocked(useLocalSearchParams).mockReturnValue({ f, t, n });

  test('shows the heading and the cards, quick tool first for anxious', async () => {
    show('anxious');
    await render(<Results />);
    expect(screen.getByText(heading({ feelings: ['anxious'], themes: [], needs: [] }))).toBeOnTheScreen();
    const cards = screen.getAllByRole('button').map((b) => b.props.accessibilityLabel as string);
    const tool = cards.findIndex((l) => l?.startsWith('Calm moment'));
    const reading = cards.findIndex((l) => l?.startsWith('Anxiety or constant worry'));
    expect(tool).toBeGreaterThanOrEqual(0);
    expect(tool).toBeLessThan(reading);
  });

  test('a tool card opens its screen and a reading card opens its topic', async () => {
    show('anxious');
    await render(<Results />);
    const card = (start: string) =>
      screen.getAllByRole('button').find((b) => (b.props.accessibilityLabel as string)?.startsWith(start))!;
    await fireEvent.press(card('Calm moment'));
    expect(router.push).toHaveBeenCalledWith('/breathing');
    await fireEvent.press(card('Anxiety or constant worry'));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/topic', params: { id: 'anxiety' } });
  });

  test('always says it is not a replacement for professional help', async () => {
    show('anxious');
    await render(<Results />);
    expect(screen.getByText(m.notReplacement)).toBeOnTheScreen();
  });

  test('a good feeling gets a kind reply and Done, never the "nothing found" options', async () => {
    show('grateful');
    await render(<Results />);
    expect(screen.getByText(m.good.message)).toBeOnTheScreen();
    expect(screen.queryByText(m.noMatch)).toBeNull();
    expect(screen.queryByRole('button', { name: m.talk })).toBeNull();
    await fireEvent.press(button(m.good.done));
    expect(router.dismissTo).toHaveBeenCalledWith('/home');
  });

  test('a good feeling mixed with a hard one gets the normal cards', async () => {
    show('grateful,stressed');
    await render(<Results />);
    expect(screen.queryByText(m.good.message)).toBeNull();
    expect(screen.getByText(m.notReplacement)).toBeOnTheScreen();
  });

  test('nothing recognised asks for the closest feeling, with every feeling as a button', async () => {
    show('made-up', 'also-made-up');
    await render(<Results />);
    expect(screen.getByText(m.closest)).toBeOnTheScreen();
    expect(screen.queryByText(m.noMatch)).toBeNull();
    await fireEvent.press(button(content.taxonomy.feelings[0].label));
    expect(router.push).toHaveBeenCalledWith(results(content.taxonomy.feelings[0].id));
    for (const f of content.taxonomy.feelings) expect(button(f.label)).toBeOnTheScreen();
  });

  test('a known feeling with no content offers breathing, a person and all topics', async () => {
    show('angry');
    await render(<Results />);
    expect(screen.getByText(m.noMatch)).toBeOnTheScreen();
    await fireEvent.press(button(m.browse));
    expect(router.push).toHaveBeenCalledWith('/topics');
    await fireEvent.press(button(m.breathe));
    expect(router.push).toHaveBeenCalledWith('/breathing');
    await fireEvent.press(button(m.talk));
    expect(router.push).toHaveBeenCalledWith('/talk-to-someone');
  });
});

describe('demo model check', () => {
  const { ModelCheck } = require('@/components/ModelCheck');
  const mc = content.demo.modelCheck;

  test('shows why the model is not running', async () => {
    await render(<ModelCheck />);
    expect(screen.getByText(mc.states.failed.replace('{error}', 'no native module'))).toBeOnTheScreen();
  });

  test('a test sentence shows its tags and closest scores', async () => {
    const { explain } = jest.requireMock('@/lib/embedder') as { explain: jest.Mock };
    explain.mockResolvedValueOnce({
      tags: { feelings: ['sad'], themes: ['purpose'], needs: [] },
      top: [{ layer: 'feelings', id: 'sad', score: 0.61 }],
    });
    await render(<ModelCheck />);
    await fireEvent.changeText(screen.getByLabelText(mc.tryLabel), "I don't see the point of anything lately");
    await fireEvent.press(button(mc.run));
    await waitFor(() => expect(screen.getByText(mc.tags.replace('{tags}', 'sad, purpose'))).toBeOnTheScreen());
    expect(screen.getByText(mc.top.replace('{top}', 'sad 0.61'))).toBeOnTheScreen();
  });
});
