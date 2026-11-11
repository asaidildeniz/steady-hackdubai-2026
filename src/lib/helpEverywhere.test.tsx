/// <reference types="node" />
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Linking, Text } from 'react-native';
import NeedHelp from '../../app/need-help';
import TalkToSomeone from '../../app/talk-to-someone';
import { Screen } from '@/components/Screen';
import { content } from '@/content/types';
import { demo } from '@/lib/demo';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismissTo: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

beforeEach(() => jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined));
afterEach(() => {
  demo.on = false;
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

const helpLink = () => screen.getByRole('button', { name: content.common.needHelpLink });

// Checklist 04: Need help now one tap away on every screen.
describe('Need help now on every screen', () => {
  test('the shared screen frame shows the link, and it opens Need help now', async () => {
    await render(
      <Screen>
        <Text>Any screen</Text>
      </Screen>,
    );
    await fireEvent.press(helpLink());
    expect(router.push).toHaveBeenCalledWith('/need-help');
  });

  test('it is there with a back button and a title too (Breathe)', async () => {
    await render(
      <Screen back title="Breathe">
        <Text>Any screen</Text>
      </Screen>,
    );
    expect(helpLink()).toBeOnTheScreen();
  });

  test('Need help now itself does not link to itself', async () => {
    await render(<NeedHelp />);
    expect(screen.queryByRole('button', { name: content.common.needHelpLink })).toBeNull();
  });

  test('every screen uses the shared frame, and only Need help now and the presenter screen hide the link', () => {
    const dir = join(__dirname, '../../app');
    const screens = readdirSync(dir).filter((f) => /^[a-z-]+\.tsx$/.test(f) && !['_layout.tsx', 'index.tsx', 'home.tsx'].includes(f));
    for (const file of screens) {
      const source = readFileSync(join(dir, file), 'utf8');
      expect([file, source.includes('<Screen')]).toEqual([file, true]);
      const hides = source.includes('noHelpLink');
      expect([file, hides]).toEqual([file, ['need-help.tsx', 'demo.tsx'].includes(file)]);
    }
  });
});

// Checklist 04: UAE emergency numbers on the help screen.
describe('UAE emergency numbers', () => {
  test('999 police and 998 ambulance are shown and call straight away', async () => {
    await render(<NeedHelp />);
    await fireEvent.press(screen.getByRole('button', { name: 'Call Police, 9 9 9' }));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:999');
    await fireEvent.press(screen.getByRole('button', { name: 'Call Ambulance, 9 9 8' }));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:998');
  });

  test('in demo mode they never dial, so a live demo cannot call the police', async () => {
    demo.on = true;
    await render(<NeedHelp />);
    await fireEvent.press(screen.getByRole('button', { name: 'Call Police, 9 9 9' }));
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(screen.getByText(content.demo.callNote)).toBeOnTheScreen();
  });
});

// Checklist 04: test phone numbers in every demo, never a real person's.
describe('demo test number', () => {
  const tappable = content.demo.contacts.find((c) => c.tappable)!;

  test('the demo contact shows an obviously fake test number', async () => {
    demo.on = true;
    await render(<TalkToSomeone />);
    expect(screen.getByText(content.demo.testNumber.replace('{number}', tappable.phone))).toBeOnTheScreen();
    expect(tappable.phone).toMatch(/^\+971 00 /); // 00 is not a UAE prefix, so it can never reach anyone
  });

  test('Call on it shows a note and never dials', async () => {
    demo.on = true;
    await render(<TalkToSomeone />);
    await fireEvent.press(screen.getByRole('button', { name: `${content.talkToSomeone.call} ${tappable.name}` }));
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(screen.getByText(content.demo.callNote)).toBeOnTheScreen();
  });
});

// Option D (11 Nov): Ambulance first, because a student here is most likely at risk of hurting themselves,
// and each number says when to call it, so nobody has to work out which service they need.
describe('choosing the right emergency number', () => {
  test('Ambulance 998 comes before Police 999', async () => {
    await render(<NeedHelp />);
    const calls = screen.getAllByRole('button', { name: /^Call / }).map((b) => b.props.accessibilityLabel);
    expect(calls.slice(0, 2)).toEqual(['Call Ambulance, 9 9 8', 'Call Police, 9 9 9']);
  });

  test('each emergency number says when to call it', async () => {
    await render(<NeedHelp />);
    for (const e of content.needHelp.emergencyNumbers) {
      expect(e.when).toBeTruthy();
      expect(screen.getByText(e.when!)).toBeOnTheScreen();
    }
  });
});
