import { fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import CheckInResult from '../../app/check-in-result';
import NeedHelp from '../../app/need-help';
import { content } from '@/content/types';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
  useLocalSearchParams: jest.fn(),
  Redirect: () => null,
}));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

afterEach(() => jest.clearAllMocks());

// Going home must return to the Home already in the history, never stack a new one on top.
test('S9 Home button returns to the existing Home', async () => {
  await render(<NeedHelp />);
  await fireEvent.press(screen.getByRole('button', { name: content.needHelp.home }));
  expect(router.dismissTo).toHaveBeenCalledWith('/home');
  expect(router.replace).not.toHaveBeenCalled();
});

test('S9 Talk to someone goes back to S8 instead of stacking S8 and S9 forever', async () => {
  await render(<NeedHelp />);
  await fireEvent.press(screen.getByRole('button', { name: content.needHelp.talk }));
  expect(router.dismissTo).toHaveBeenCalledWith('/talk-to-someone');
  expect(router.push).not.toHaveBeenCalled();
});

test('S5a Done returns to the existing Home', async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ group: 'kind' });
  await render(<CheckInResult />);
  await fireEvent.press(screen.getByRole('button', { name: content.results.kind.primary }));
  expect(router.dismissTo).toHaveBeenCalledWith('/home');
  expect(router.replace).not.toHaveBeenCalled();
});
