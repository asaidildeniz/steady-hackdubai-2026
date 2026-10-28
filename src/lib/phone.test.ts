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

// A reviewer hand-edits content.json, so the gate must survive near-miss values.
test.each([
  ['verified written as the text "true"', { number: 'TEST1', verified: 'true' }],
  ['verified written as the text "false"', { number: 'TEST1', verified: 'false' }],
  ['number written without quotes', { number: 501234567, verified: true }],
  ['number missing', { verified: true }],
])('%s is never callable and never crashes', (_, entry) => {
  expect(callableNumber(entry as never)).toBeNull();
});

test('a verified, non-empty number is callable', () => {
  expect(callableNumber({ number: ' TEST1 ', verified: true })).toBe('TEST1');
});

test('openPhone reports failure instead of throwing', async () => {
  jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no dialler'));
  await expect(openPhone('tel', 'TEST1')).resolves.toBe(false);
});

test('openPhone opens tel: and sms: links', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  await expect(openPhone('tel', 'TEST1')).resolves.toBe(true);
  await openPhone('sms', 'TEST1');
  expect(open.mock.calls).toEqual([['tel:TEST1'], ['sms:TEST1']]);
});

test('spaces, dashes, dots and brackets are dropped from the dialled number', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  await openPhone('tel', '+00 (1) 23-45.6');
  expect(open).toHaveBeenCalledWith('tel:+00123456');
});
