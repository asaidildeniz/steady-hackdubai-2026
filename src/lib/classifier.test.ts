import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import holdout from '@/content/classifier/holdout.json';
import model from '@/content/classifier/model.json';
import train from '@/content/classifier/train.json';
import golden from '@/content/golden.json';
import { content } from '@/content/types';
import { classify, understand } from './classifier';

// The feeling classifier's gate. Held-out sentences are never trained on; golden.json is the team's earlier,
// independent test set. Safety first: every suicidal sentence must reach Need help now.

const cfg = content.classifier;
const held = Object.entries(holdout.sentences).flatMap(([cat, list]) => list.map((text) => ({ cat, text })));

// golden.json uses taxonomy feelings; a sentence passes when the category chosen shares any expected feeling's page.
const pageOf = (feeling: string) => content.feelingPages.groups.find((g) => g.feelings.includes(feeling))?.id;
const categoryPages = (id: string) => (cfg.categories.find((c) => c.id === id)?.feelings ?? []).map(pageOf);

describe('feeling classifier', () => {
  test('model.json was trained on the current train.json (run npm run train-classifier)', () => {
    const raw = readFileSync(join(__dirname, '../content/classifier/train.json'), 'utf8');
    expect(model.trainedOn).toBe(createHash('sha256').update(raw.replace(/\r\n/g, '\n')).digest('hex').slice(0, 16));
  });

  test('no held-out sentence is also a training sentence', () => {
    const trained = new Set(Object.values(train.sentences).flat().map((s) => s.toLowerCase()));
    expect(held.filter((h) => trained.has(h.text.toLowerCase()))).toEqual([]);
  });

  test('every category the app can show exists in the model, and every model category is known', () => {
    const shown = cfg.categories.map((c) => c.id);
    expect([...shown, 'suicidal', 'none'].sort()).toEqual([...model.classes].sort());
  });

  test('the same sentence always gets the same answer', () => {
    const s = 'I keep worrying about my exams and I cannot sleep';
    expect(classify(s)).toEqual(classify(s));
  });

  test('small typos still count ("anxiuos", "lonley")', () => {
    expect(classify("I'm so anxiuos").category).toBe('anxious');
    expect(classify('I feel so lonley here').category).toBe('lonely');
  });

  test('every held-out suicidal sentence opens Need help now', () => {
    const missed = held.filter((h) => h.cat === 'suicidal' && understand(h.text).kind !== 'crisis');
    expect(missed.map((m) => m.text)).toEqual([]);
  });

  test('held-out: at least 85% go to the right category, and at most 2% are sent to the wrong one', () => {
    const shown = held.filter((h) => h.cat !== 'suicidal' && h.cat !== 'none');
    const results = shown.map((h) => ({ ...h, u: understand(h.text) }));
    const right = results.filter((r) => r.u.kind === 'category' && r.u.category.id === r.cat).length;
    const wrong = results.filter((r) => r.u.kind === 'category' && r.u.category.id !== r.cat);
    expect(right / shown.length).toBeGreaterThanOrEqual(0.85);
    expect(wrong.length / shown.length).toBeLessThanOrEqual(0.02);
  });

  test('held-out: everyday sentences never open Need help now, and at most 1 in 20 opens a feeling page', () => {
    const neutral = [...held.filter((h) => h.cat === 'none').map((h) => h.text), ...golden.neutral];
    expect(neutral.filter((t) => understand(t).kind === 'crisis')).toEqual([]);
    expect(neutral.filter((t) => understand(t).kind === 'category').length).toBeLessThanOrEqual(neutral.length / 20);
  });

  test("golden.json (the team's independent set): at least 70% land on the right page, none on a wrong one", () => {
    const results = golden.sentences.map((g) => ({ g, u: understand(g.text) }));
    const page = (r: (typeof results)[number]) => (r.u.kind === 'category' ? categoryPages(r.u.category.id) : []);
    const right = results.filter((r) => page(r).some((p) => r.g.feelings.map(pageOf).includes(p)));
    const wrong = results.filter((r) => r.u.kind === 'category' && !page(r).some((p) => r.g.feelings.map(pageOf).includes(p)));
    expect(right.length / results.length).toBeGreaterThanOrEqual(0.7);
    expect(wrong.map((w) => w.g.text)).toEqual([]);
  });

  test('every answer says which words it was based on', () => {
    const u = understand("I'm so lonely, I have no friends here");
    expect(u.kind).toBe('category');
    if (u.kind === 'category') expect(u.because.length).toBeGreaterThan(0);
  });
});

// Not a test: prints the numbers behind the thresholds. Run with REPORT=1 npx jest classifier
(process.env.REPORT ? test : test.skip)('report', () => {
  const lines: string[] = [];
  for (const t of [0.2, 0.25, 0.3, 0.35, 0.4, 0.5]) {
    const shown = held.filter((h) => h.cat !== 'suicidal' && h.cat !== 'none');
    let right = 0;
    let wrong = 0;
    for (const h of shown) {
      const r = classify(h.text);
      if (r.confidence < t) continue;
      if (r.category === h.cat) right++;
      else wrong++;
    }
    lines.push(`confidence ${t}: right ${right}/${shown.length}, wrong ${wrong}, asked ${shown.length - right - wrong}`);
  }
  for (const net of [0.2, 0.25, 0.3, 0.35, 0.4]) {
    const risk = (s: string) => classify(s).scores.find((x) => x.category === 'suicidal')!.p;
    const others = [...held.filter((h) => h.cat !== 'suicidal').map((h) => h.text), ...golden.sentences.map((g) => g.text)];
    const caught = held.filter((h) => h.cat === 'suicidal' && risk(h.text) >= net).length;
    lines.push(`suicide net ${net}: model alone catches ${caught}/12, false alarms ${others.filter((s) => risk(s) >= net).length}/${others.length}`);
  }
  for (const g of golden.sentences) {
    const u = understand(g.text);
    const r = classify(g.text);
    lines.push(`${u.kind === 'category' ? u.category.id : u.kind} (${r.category} ${r.confidence.toFixed(2)}) expected ${g.feelings.join('/')} | ${g.text}`);
  }
  console.log(lines.join('\n'));
});
