import { Linking } from 'react-native';
import { callableNumber, openPhone } from './phone';

afterEach(() => jest.clearAllMocks()); // jest-expo already mocks Linking.openURL, shared across tests

test.each([
  ['empty', { number: '', verified: true }],
  ['whitespace only', { number: '   ', verified: true }],
  ['unverified', { number: 'TEST-2', verified: false }],
  ['empty and unverified', { number: '', verified: false }],
])('%s number is never callable', (_, entry) => {
  expect(callableNumber(entry)).toBeNull();
});

test('a verified, non-empty number is callable', () => {
  expect(callableNumber({ number: ' TEST-1 ', verified: true })).toBe('TEST-1');
});

test('openPhone reports failure instead of throwing', async () => {
  jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no dialler'));
  await expect(openPhone('tel', 'TEST-1')).resolves.toBe(false);
});

test('openPhone opens tel: and sms: links', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  await expect(openPhone('tel', 'TEST-1')).resolves.toBe(true);
  await openPhone('sms', 'TEST-1');
  expect(open.mock.calls).toEqual([['tel:TEST-1'], ['sms:TEST-1']]);
});
