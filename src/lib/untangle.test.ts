import { afterThat, thoughtParts } from './untangle';

describe('splitting a thought into parts to mark as known or guessed', () => {
  test('splits at "so", "but" and sentence ends', () => {
    expect(thoughtParts('I failed this exam, so my whole future is ruined.')).toEqual([
      'I failed this exam',
      'My whole future is ruined',
    ]);
    expect(thoughtParts('I have too much to do and I will never get it all done. Everyone else copes')).toEqual([
      'I have too much to do',
      'I will never get it all done',
      'Everyone else copes',
    ]);
  });

  test('a single thought stays one part, without its full stop', () => {
    expect(thoughtParts('Nobody in my class actually likes me.')).toEqual(['Nobody in my class actually likes me']);
  });

  test('never more than four parts, and nothing empty', () => {
    expect(thoughtParts('a. b. c. d. e. f.')).toHaveLength(4);
    expect(thoughtParts('   ')).toEqual([]);
  });
});

describe('"I\'m having the thought that …"', () => {
  test('continues the sentence in lower case and ends it with a full stop', () => {
    expect(afterThat('Nobody in my class actually likes me')).toBe('nobody in my class actually likes me.');
  });

  test('keeps "I" capitalised and keeps a question mark', () => {
    expect(afterThat('I will fail?')).toBe('I will fail?');
    expect(afterThat('I’m not good enough')).toBe('I’m not good enough.');
  });
});
