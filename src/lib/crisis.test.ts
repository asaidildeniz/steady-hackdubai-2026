import { isCrisis } from './matching';

// Checklist 04: crisis detection tested with varied phrasing, typos and Arabic.
// A miss here sends someone in danger to a breathing exercise, so these lean towards catching.

describe('varied English phrasing', () => {
  test.each([
    "I'm done.",
    'honestly im done',
    'I am done. I can’t keep going like this',
    "There's no point anymore",
    'no point in living',
    "I can't do this anymore",
    'i cant do this any more',
    'I just want to end it all',
    "I don't want to wake up tomorrow",
    'everyone would be better off without me',
  ])('catches "%s"', (text) => {
    expect(isCrisis(text)).toBe(true);
  });
});

describe('small typos in crisis words', () => {
  // Only words of 5+ letters allow a typo; short words like "die" or "kill" stay exact, so "will myself" stays calm.
  test.each(['suicde', 'having suicidl thoughts', 'I want to kill mysef', 'I keep hurtng myself', 'thinking about sucide'])(
    'catches "%s"',
    (text) => {
      expect(isCrisis(text)).toBe(true);
    },
  );
});

describe('Arabic', () => {
  test.each([
    'أريد أن أموت',
    'اريد ان اموت', // typed without hamza
    'أفكر في الانتحار',
    'أريد أن أنهي حياتي',
    'لا أريد أن أعيش',
    'أبي أموت', // Gulf
    'بقتل نفسي',
  ])('catches "%s"', (text) => {
    expect(isCrisis(text)).toBe(true);
  });
});

describe('everyday sentences stay calm', () => {
  test.each([
    "I'm done with my exam!",
    'im done with the reading, what next',
    'this assignment is killing me',
    "I'm dying to see you",
    'no point arguing with my tutor',
    'I smashed my exam, killing it',
    'I died laughing',
    'I will myself to keep studying',
    'my exam is tomorrow, I am so tired',
    'so stressed about my deadline',
    'أنا متعب من الامتحان', // "I'm tired of the exam"
    '',
  ])('does not flag "%s"', (text) => {
    expect(isCrisis(text)).toBe(false);
  });
});
