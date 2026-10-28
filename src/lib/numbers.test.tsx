import { fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Linking } from 'react-native';
import TalkToSomeone from '../../app/talk-to-someone';
import NeedHelp from '../../app/need-help';
import { type Content, content } from '@/content/types';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});
// A private copy of the real content that each test can edit.
jest.mock('@/content/types', () => ({
  content: JSON.parse(JSON.stringify(jest.requireActual('@/content/types').content)),
}));

const shipped: Content = JSON.parse(JSON.stringify(jest.requireActual('@/content/types').content));

beforeEach(() => Object.assign(content, JSON.parse(JSON.stringify(shipped))));
afterEach(() => jest.clearAllMocks());

// Obviously fake test values, never realistic numbers.
const VERIFIED = 'TEST-VERIFIED';
const UNVERIFIED = 'TEST-UNVERIFIED';

function useMixedContacts() {
  const base = shipped.talkToSomeone.contacts[0];
  content.talkToSomeone.contacts = [
    { ...base, id: 'v', name: 'Verified Person', phone: VERIFIED, verified: true },
    { ...base, id: 'u', name: 'Unverified Person', phone: UNVERIFIED, verified: false },
    { ...base, id: 'e', name: 'Empty Person', phone: '', verified: true },
  ];
  content.needHelp.emergencyNumbers = [{ label: 'Unverified line', number: UNVERIFIED, verified: false }];
  content.needHelp.helplines = [{ label: 'Verified line', number: VERIFIED, verified: true }];
}

describe('S8 Talk to someone', () => {
  test('with the shipped content every Call and Message button is disabled', async () => {
    await render(<TalkToSomeone />);
    const buttons = screen.getAllByRole('button', { name: /^(Call|Message) / });
    expect(buttons.length).toBe(shipped.talkToSomeone.contacts.length * 2);
    buttons.forEach((b) => expect(b).toBeDisabled());
    expect(screen.getAllByText(shipped.talkToSomeone.pending).length).toBe(shipped.talkToSomeone.contacts.length);
  });

  test('a screen reader hears why a button is disabled, and each name is a heading', async () => {
    useMixedContacts();
    await render(<TalkToSomeone />);
    const call = screen.getByRole('button', { name: 'Call Unverified Person' });
    expect(call.props.accessibilityHint).toBe(shipped.talkToSomeone.pending);
    expect(screen.getByRole('header', { name: 'Verified Person' })).toBeOnTheScreen();
  });

  test('only a verified, non-empty contact is tappable', async () => {
    useMixedContacts();
    await render(<TalkToSomeone />);
    expect(screen.getByRole('button', { name: 'Call Verified Person' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Message Verified Person' })).toBeEnabled();
    for (const name of ['Unverified Person', 'Empty Person']) {
      expect(screen.getByRole('button', { name: `Call ${name}` })).toBeDisabled();
      expect(screen.getByRole('button', { name: `Message ${name}` })).toBeDisabled();
    }
    expect(screen.queryByText(new RegExp(UNVERIFIED))).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Call Unverified Person' }));
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});

describe('S9 Need help now', () => {
  test('with the shipped content no number is tappable and the pending message shows', async () => {
    await render(<NeedHelp />);
    expect(screen.getByText(shipped.needHelp.pendingMessage)).toBeOnTheScreen();
    const labels = screen.getAllByRole('button').map((b) => b.props.accessibilityLabel);
    expect(labels.sort()).toEqual([shipped.needHelp.home, shipped.needHelp.talk].sort());
  });

  test('only verified numbers appear, and unverified ones never show at all', async () => {
    useMixedContacts();
    await render(<NeedHelp />);
    await fireEvent.press(screen.getByRole('button', { name: /^Call Verified line, / }));
    expect(Linking.openURL).toHaveBeenCalledWith(`tel:${VERIFIED}`);
    expect(screen.getByRole('button', { name: /^Call Verified Person, / })).toBeEnabled();
    expect(screen.getByText(`Verified line: ${VERIFIED}`)).toBeOnTheScreen();
    expect(screen.queryByText(new RegExp(UNVERIFIED))).toBeNull();
    expect(screen.queryByText(/Unverified|Empty Person/)).toBeNull();
    expect(screen.queryByText(shipped.needHelp.pendingMessage)).toBeNull();
  });

  test('a failed call shows the number and tells the screen reader', async () => {
    useMixedContacts();
    jest.mocked(Linking.openURL).mockRejectedValueOnce(new Error('no dialler'));
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await render(<NeedHelp />);
    await fireEvent.press(screen.getByRole('button', { name: /^Call Verified line, / }));
    const message = shipped.talkToSomeone.openFailed.replace('{number}', VERIFIED);
    expect(message).toContain(VERIFIED); // the template must keep {number}
    expect(await screen.findByText(message)).toBeOnTheScreen();
    expect(announce).toHaveBeenCalledWith(message);
  });
});
