import { Linking } from 'react-native';

// The verified-number gate: only a reviewer-verified, non-empty number may ever be tappable.
export function callableNumber(entry: { number: string; verified: boolean }): string | null {
  const number = entry.number.trim();
  return entry.verified && number ? number : null;
}

// No canOpenURL: it needs extra iOS config. Returns false so the screen can show the number as text.
export async function openPhone(kind: 'tel' | 'sms', number: string): Promise<boolean> {
  try {
    await Linking.openURL(`${kind}:${number}`);
    return true;
  } catch {
    return false;
  }
}
