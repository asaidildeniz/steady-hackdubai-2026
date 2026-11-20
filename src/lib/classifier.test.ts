import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import holdout from '@/content/classifier/holdout.json';
import model from '@/content/classifier/model.json';
import train from '@/content/classifier/train.json';
import golden from '@/content/golden.json';
import { content } from '@/content/types';
import submodel from '@/content/classifier/submodel.json';
import subtopics from '@/content/classifier/subtopics.json';
import { alsoClose, classify, subtopicsFor, understand, writingFor } from './classifier';

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

  // Abel's own examples (2026-11-20) and their neighbours: each must keep working after any retraining.
  test.each([
    "I don't know if I could do this anymore",
    "I can't keep doing this anymore",
    "I don't think I can carry on much longer",
  ])('"%s" opens Need help now', (s) => {
    expect(understand(s).kind).toBe('crisis');
  });

  test.each([
    ['I am unprepared for my test', 'anxious'],
    ["I'm not ready for my exam tomorrow", 'anxious'],
    ['my grades are so low this term', 'stressed'],
    ["I don't think God loves me", 'faith'],
    ["I can't fit in", 'rejected'],
    ['Is everyone mad at me?', 'insecure'],
    ['nobody understands me', 'lonely'],
    ['God feels so far away from me', 'faith'],
    ['I feel like God has given up on me', 'faith'],
  ])('"%s" is %s first', (s, id) => {
    const u = understand(s);
    expect(u.kind).toBe('category');
    if (u.kind === 'category') expect(u.category.id).toBe(id);
  });

  test.each(['Nobody likes me', 'no one likes me here', 'everyone hates me'])(
    '"%s" is lonely, insecure or rejected, and never offers Okay',
    (s) => {
      const u = understand(s);
      if (u.kind !== 'category') throw new Error(`expected a category, got ${u.kind}`);
      expect(['lonely', 'insecure', 'rejected']).toContain(u.category.id);
      expect(alsoClose(u).map((x) => x.category.id)).not.toContain('okay');
    },
  );

  test('"I can\'t fit in" offers Lonely close behind, and shows the isolation writing, not a breakup one', () => {
    const u = understand("I can't fit in");
    if (u.kind !== 'category') throw new Error('expected a category');
    expect(alsoClose(u)[0].category.id).toBe('lonely');
    expect(writingFor("I can't fit in", u.category)).toBe('When You Feel Isolated');
  });

  test('lonely, rejected and insecure carry a "God loves you" writing slot', () => {
    for (const id of ['lonely', 'rejected', 'insecure']) expect(cfg.categories.find((c) => c.id === id)).toHaveProperty('faithWriting');
  });

  test('a happy sentence that mentions God stays Okay', () => {
    const u = understand('thank God I passed my exam, I feel so relieved');
    expect(u.kind === 'category' && u.category.id).toBe('okay');
  });

  test('exam nerves that are not sure show Under pressure and Overwhelmed close behind', () => {
    const u = understand('I am unprepared for my test');
    if (u.kind !== 'category') throw new Error('expected a category');
    expect(u.sure).toBe(false);
    const next = u.ranked.slice(1, 6).map((x) => x.category.id);
    expect(next).toContain('stressed');
  });

  test('ranked lists every shown category once, most likely first', () => {
    const u = understand('nobody here really knows me');
    expect(u.ranked.map((x) => x.category.id).sort()).toEqual(content.classifier.categories.map((c) => c.id).sort());
    const ps = u.ranked.map((x) => x.p);
    expect([...ps].sort((a, b) => b - a)).toEqual(ps);
  });

  describe('sub-topics: the closest writing within a feeling', () => {
    const cat = (id: string) => cfg.categories.find((c) => c.id === id)!;
    const parentOf = (subId: string) => cfg.categories.find((c) => c.subtopics.some((s) => s.id === subId))!;

    test('submodel.json was trained on the current subtopics.json', () => {
      expect(submodel.trainedOn).toBe(
        createHash('sha256').update(JSON.stringify(subtopics.train).replace(/\r\n/g, '\n')).digest('hex').slice(0, 16),
      );
    });

    test('every sub-topic in content.json is trained, and every trained one is in content.json', () => {
      const listed = cfg.categories.flatMap((c) => c.subtopics.map((s) => s.id)).sort();
      expect(listed).toEqual(Object.keys(subtopics.train).sort());
      expect(Object.keys(subtopics.holdout).sort()).toEqual(listed);
    });

    test('no held-out sub-topic sentence is a training one', () => {
      const trained = new Set(Object.values(subtopics.train).flat().map((s) => s.toLowerCase()));
      expect(Object.values(subtopics.holdout).flat().filter((s) => trained.has(s.toLowerCase()))).toEqual([]);
    });

    test('held-out: at least 80% pick the right sub-topic within their feeling', () => {
      const cases = Object.entries(subtopics.holdout).flatMap(([id, list]) => list.map((text) => ({ id, text })));
      const right = cases.filter((c) => subtopicsFor(c.text, parentOf(c.id))[0].subtopic.id === c.id);
      expect(right.length / cases.length).toBeGreaterThanOrEqual(0.8);
    });

    test.each([
      ['I am unprepared for my test', 'anxious', 'When an Exam Feels Close'],
      ['I keep worrying about everything', 'anxious', 'When Worries Keep Returning'],
      ['I failed my exam and my grades are awful', 'stressed', 'When Your Grades Are Not Going Well'],
      ['my girlfriend broke up with me', 'rejected', 'When a Relationship Ends'],
      ['she said she only likes me as a friend', 'rejected', 'When Someone You Like Doesn’t Feel the Same'],
    ])('"%s" in %s shows "%s"', (s, id, writing) => {
      expect(writingFor(s, cat(id))).toBe(writing);
    });

    test('a faith sub-topic without its own writing yet shows the faith writing', () => {
      expect(subtopicsFor("I don't think God loves me", cat('faith'))[0].subtopic.id).toBe('faith.unloved');
      expect(writingFor("I don't think God loves me", cat('faith'))).toBe('When You Have Questions About Faith');
    });

    test('a feeling with one writing always shows it', () => {
      expect(writingFor('I feel so lonely', cat('lonely'))).toBe('When You Feel Isolated');
    });
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
    lines.push(`suicide net ${net}: model alone catches ${caught}/${held.filter((h) => h.cat === 'suicidal').length}, false alarms ${others.filter((s) => risk(s) >= net).length}/${others.length}`);
  }
  for (const g of golden.sentences) {
    const u = understand(g.text);
    const r = classify(g.text);
    lines.push(`${u.kind === 'category' ? u.category.id : u.kind} (${r.category} ${r.confidence.toFixed(2)}) expected ${g.feelings.join('/')} | ${g.text}`);
  }
  console.log(lines.join('\n'));
});
