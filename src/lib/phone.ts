import { Linking } from 'react-native';

// The verified-number gate: only a reviewer-verified, non-empty number may ever be tappable.
// content.json is hand-edited, so accept exactly `true` and a text number; anything else stays pending.
export function callableNumber(entry: { number: string; verified: boolean }): string | null {
  if (entry.verified !== true || typeof entry.number !== 'string') return null;
  const number = entry.number.trim();
  return number || null;
}

// No canOpenURL: it needs extra iOS config. Returns false so the screen can show the number as text.
export async function openPhone(kind: 'tel' | 'sms', number: string): Promise<boolean> {
  try {
    // Drop the separators people type ("+971 4 123-4567"); some dialers reject them in a URL.
    await Linking.openURL(`${kind}:${number.replace(/[\s().-]/g, '')}`);
    return true;
  } catch {
    return false;
  }
}
