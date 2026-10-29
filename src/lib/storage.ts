import AsyncStorage from '@react-native-async-storage/async-storage';

// The only value Steady ever saves on the device. Add nothing else here.
const KEY = 'steady.welcomeSeen';

export async function getWelcomeSeen(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === 'true';
}

export async function setWelcomeSeen(): Promise<void> {
  await AsyncStorage.setItem(KEY, 'true');
}

// Demo mode only: lets a presenter show the age question again. Removes the one key and nothing else.
export async function clearWelcomeSeen(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
