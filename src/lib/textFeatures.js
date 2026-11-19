// Turns a sentence into the words and word pairs the feeling classifier scores. Plain JavaScript (CommonJS) so the
// app and the training script (scripts/train-classifier.js) share exactly the same rules. Pure: no state, no I/O.

// Same clean-up as matching.ts: lower case, apostrophes dropped, Arabic typed the common ways, the rest to spaces.
function normalise(s) {
  return String(s)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[ً-ٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

// A light, predictable stemmer so "worrying", "worried" and "worries" count as one word.
// Short words are left alone ("sad" stays "sad", "less" stays "less").
function stem(w) {
  if (w.length <= 4 || !/^[a-z]+$/.test(w) || w.endsWith('thing')) return w;
  if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.endsWith('ied')) return w.slice(0, -3) + 'y';
  if (w.endsWith('ing') && w.length > 5) return undouble(w.slice(0, -3));
  if (w.endsWith('ed') && w.length > 5) return undouble(w.slice(0, -2));
  if (w.endsWith('ness')) return w.slice(0, -4);
  if (w.endsWith('es') && /(ss|sh|ch|x)es$/.test(w)) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us')) return w.slice(0, -1);
  return w;
}
const undouble = (w) => (/([b-df-hj-np-tv-z])\1$/.test(w) && !/(ll|ss|ff|zz)$/.test(w) ? w.slice(0, -1) : w);

// "don't feel God" is not "feel God": the two words after a negation are marked, so the model can tell them apart.
const NEGATIONS = new Set(['not', 'no', 'never', 'dont', 'doesnt', 'didnt', 'isnt', 'arent', 'wasnt', 'werent', 'wont', 'nothing', 'nobody']);
const NEGATED_WORDS = 2;

function tokens(text) {
  const words = normalise(text).split(' ').filter(Boolean);
  const out = [];
  let negate = 0;
  for (const w of words) {
    const s = stem(w);
    out.push(negate > 0 ? `not_${s}` : s);
    negate = NEGATIONS.has(w) ? NEGATED_WORDS : Math.max(0, negate - 1);
  }
  return out;
}

// Little words that say nothing about a feeling on their own ("I", "feel", "my"). They are dropped as single
// words, which stops "I feel ..." from deciding the answer, but kept inside word pairs ("make fun of me").
const STOP = new Set(
  ('i im ive id ill me my mine myself you your we us our it its a an the and or but so to of in on at for with from ' +
    'is am are was were be been being do doe did have ha had this that these those there here just really very feel ' +
    'feeling felt get got gett keep kept go going goe make made thing some any all lot like about up out').split(' '),
);

// The features of a sentence: each meaningful word (stemmed, negation marked) and each pair of neighbouring words.
function features(text) {
  const t = tokens(text);
  const plain = t.map((w) => w.replace(/^not_/, ''));
  const set = new Set(t.filter((w) => !STOP.has(w.replace(/^not_/, ''))));
  for (let i = 0; i + 1 < plain.length; i++) set.add(`${plain[i]} ${plain[i + 1]}`);
  return [...set];
}

module.exports = { normalise, stem, tokens, features };
