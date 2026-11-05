import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import CheckIn from '../../app/check-in';
import Results from '../../app/results';
import { content } from '@/content/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
  useLocalSearchParams: jest.fn(),
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text>{`redirect:${href}`}</Text>;
  },
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

  test('typed words with no feeling in them open Breathe', async () => {
    await render(<CheckIn />);
    await fireEvent.changeText(screen.getByLabelText(c.typeLabel), 'qwerty asdf');
    await fireEvent.press(button(c.find));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/breathing'));
  });

  test('the box is cleared after searching', async () => {
    await render(<CheckIn />);
    await fireEvent.changeText(screen.getByLabelText(c.typeLabel), 'stressed');
    await fireEvent.press(button(c.find));
    expect(screen.getByLabelText(c.typeLabel).props.value).toBe('');
  });
});

describe('feeling pages', () => {
  const fp = content.feelingPages;
  const tools = content.tools;
  const show = (f = '', t = '', n = '') => jest.mocked(useLocalSearchParams).mockReturnValue({ f, t, n });
  const group = (id: string) => fp.groups.find((g) => g.id === id)!;

  test('every one of Abel\'s feelings opens exactly one page', () => {
    for (const f of content.taxonomy.feelings) {
      expect(fp.groups.filter((g) => g.feelings.includes(f.id))).toHaveLength(1);
    }
  });

  test('each page offers all three tools once, first tool as in the design', () => {
    for (const g of fp.groups) expect([...g.tools].sort()).toEqual(['breathe', 'reachOut', 'untangle']);
    expect(group('anxious').tools[0]).toBe('breathe');
    expect(group('overwhelmed').tools[0]).toBe('untangle');
    expect(group('low').tools[0]).toBe('reachOut');
    expect(group('okay').tools[0]).toBe('breathe');
  });

  test.each([
    ['anxious', 'anxious'],
    ['afraid', 'anxious'],
    ['stressed', 'overwhelmed'],
    ['lonely', 'low'],
    ['distant-from-god', 'low'],
    ['grateful', 'okay'],
  ])('%s opens the %s page', async (feeling, id) => {
    show(feeling);
    await render(<Results />);
    expect(screen.getByText(group(id).tag)).toBeOnTheScreen();
    expect(screen.getByText(group(id).heading)).toBeOnTheScreen();
  });

  test('a good feeling mixed with a hard one opens the hard one\'s page', async () => {
    show('stressed,grateful');
    await render(<Results />);
    expect(screen.getByText(group('overwhelmed').heading)).toBeOnTheScreen();
  });

  test('Try this first starts its tool; Or try opens the other two', async () => {
    show('anxious');
    await render(<Results />);
    expect(screen.getByText(fp.tryFirst)).toBeOnTheScreen();
    await fireEvent.press(button(`${fp.start} ${tools.breathe.title}`));
    expect(router.push).toHaveBeenCalledWith('/breathing');
    await fireEvent.press(button(tools.untangle.title));
    expect(router.push).toHaveBeenCalledWith('/untangle');
    await fireEvent.press(button(tools.reachOut.title));
    expect(router.push).toHaveBeenCalledWith('/talk-to-someone');
  });

  test('the overwhelmed page starts with Untangle', async () => {
    show('stressed');
    await render(<Results />);
    await fireEvent.press(button(`${fp.start} ${tools.untangle.title}`));
    expect(router.push).toHaveBeenCalledWith('/untangle');
  });

  test('matching readings follow under Or try and open their topic', async () => {
    show('anxious');
    await render(<Results />);
    const reading = screen
      .getAllByRole('button')
      .find((b) => (b.props.accessibilityLabel as string)?.startsWith('Anxiety or constant worry'))!;
    await fireEvent.press(reading);
    expect(router.push).toHaveBeenCalledWith({ pathname: '/topic', params: { id: 'anxiety' } });
  });

  test('always says it is not a replacement for professional help', async () => {
    show('sad');
    await render(<Results />);
    expect(screen.getByText(m.notReplacement)).toBeOnTheScreen();
  });

  test('no recognisable feeling opens Breathe, a calm place to start', async () => {
    show('made-up', 'study');
    await render(<Results />);
    expect(screen.getByText('redirect:/breathing')).toBeOnTheScreen();
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
