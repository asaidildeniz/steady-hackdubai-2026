import AsyncStorage from '@react-native-async-storage/async-storage';

// The only value Steady ever saves on the device. Add nothing else here.
const KEY = 'steady.welcomeSeen';

export async function getWelcomeSeen(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === 'true';
}

export async function setWelcomeSeen(): Promise<void> {
  await AsyncStorage.setItem(KEY, 'true');
}
