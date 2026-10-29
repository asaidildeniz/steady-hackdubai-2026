import AsyncStorage from '@react-native-async-storage/async-storage';
import * as storage from './storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(() => AsyncStorage.clear());

test('welcomeSeen is false on a fresh install', async () => {
  expect(await storage.getWelcomeSeen()).toBe(false);
});

test('setWelcomeSeen writes only the steady.welcomeSeen key', async () => {
  await storage.setWelcomeSeen();
  expect(await AsyncStorage.getAllKeys()).toEqual(['steady.welcomeSeen']);
  expect(await storage.getWelcomeSeen()).toBe(true);
});

test('storage exposes nothing that could save other values', () => {
  expect(Object.keys(storage).sort()).toEqual(['clearWelcomeSeen', 'getWelcomeSeen', 'setWelcomeSeen']);
});

test('clearWelcomeSeen removes only steady.welcomeSeen', async () => {
  await storage.setWelcomeSeen();
  await AsyncStorage.setItem('other', 'x'); // stands in for anything else on the device
  await storage.clearWelcomeSeen();
  expect(await AsyncStorage.getAllKeys()).toEqual(['other']);
});
