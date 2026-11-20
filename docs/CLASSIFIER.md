# Feeling classifier

**Status:** draft for review (Abel, 2026-11-19; grief, guilt and anger added 2026-11-20). Branch `matching-classifier`.

When a student types how they feel on Home, Steady chooses one of 14 categories and opens that category's feeling page. If it isn't sure, it asks which category is closest instead of guessing.

It runs entirely on the device, on the phone and in the browser alike:
- no model download and no network;
- no new dependencies;
- the same sentence always gets the same answer.

## The categories

Eleven categories come from the 15 pieces in *STEADY-Content #1*. Grief, guilt and anger were added at Abel's request on 2026-11-20 and have no content piece yet. Two more categories, `suicidal` and `none`, are never shown to students.

| Category | Content pieces it covers | Opens the page for |
|---|---|---|
| Anxious | When Worries Keep Returning; When You're Anxious About the Future | anxious |
| Under pressure | When an Exam Feels Close; When Your Grades Are Not Going Well | anxious (Breathe first) |
| Overwhelmed | When "Adulting" Feels Like a Lot; When You're Used to Achieving, but You're Tired | overwhelmed |
| Down | When You're Feeling Down (approved); When You Wonder Whether Your Life Matters | low |
| Grieving | none yet (the loss of someone or a pet) | low |
| Guilty or ashamed | none yet | low |
| Angry or resentful | none yet | overwhelmed (Untangle first) |
| Lonely | When You Feel Isolated | low |
| Rejected or heartbroken | When a Relationship Ends; When Someone You Like Doesn't Feel the Same | low |
| Insecure | When You Feel Insecure at University | low |
| Bullied | When You're Experiencing Bullying | anxious |
| Unsure what's next | When You're Unsure What Comes Next | anxious |
| Questioning faith | When You Have Questions About Faith | low |
| Okay | none (gets a kind reply) | okay |
| *suicidal* | never shown | **opens Need help now** |
| *none* | never shown | asks which category is closest |

The labels, the "it sounds like" wording, the thresholds and each category's link to the taxonomy all live in `content.json` → `classifier`.

## How a typed sentence is handled

`understand()` in `src/lib/classifier.ts` runs these steps in order:

1. **Exact crisis phrases** (`isCrisis`, unchanged). If one matches, Steady opens Need help now. This check never depends on the model.
2. **The model's safety net.** If the model's `suicidal` score is at least `suicideNet` (0.2), Steady opens Need help now. The bar is low on purpose: when in doubt, Steady offers help.
3. **A confident category.** If the most likely category scores at least `confidence` (0.25), Steady opens its page. The page says "It sounds like you're feeling lonely" and offers **Not quite? Choose another**.
4. **Otherwise,** Steady tries the existing keywords, plus the on-phone meaning model where it runs. If those find nothing, Home asks **"Which of these is closest?"** and shows all 14 categories.

The typed text is never stored or sent. Only category and tag ids go to the results screen.

## How the model works

The model is **multinomial logistic regression** over words and word pairs. `src/lib/textFeatures.js` turns a sentence into those words and pairs; the app and the training script both use it.

The text goes through these steps:
1. **Clean-up:** the same as the keyword matcher (lower case, no apostrophes, Arabic normalised).
2. **Word endings:** a light stemmer, so worrying, worried and worries count as one word.
3. **Negation:** the two words after "not", "don't", "never" and similar are marked, so "I don't feel God" is different from "feel God".
4. **Little words:** words like "I", "my" and "feel" are dropped as single words, but kept inside word pairs.
5. **Typos:** a word of 5+ letters is corrected to the nearest word in the training sentences, if it's 1 letter off (2 letters for words of 8+).

The model itself is the weights in `src/content/classifier/model.json` (about 400 KB). `scripts/train-classifier.js` generates it from `train.json`.

Training is deterministic: the weights start at zero and every pass goes through the sentences in the same order. Every answer also lists the words it was based on (`because`).

## Training data

- **`src/content/classifier/train.json`:** 794 made-up sentences, about 50 per category. They're written to sound like students typing: short and long, slang, Gulf student life. **None are real**, as the repo rules require.
- **`src/content/classifier/holdout.json`:** 191 different made-up sentences, 12 per category. **The model never trains on these.** A test fails if any held-out sentence appears in `train.json`.

To improve it, add sentences to `train.json` and run:

```bash
npm run train-classifier
```

Then run the tests. One test fails if `model.json` wasn't retrained after `train.json` changed.

## Results (2026-11-20, 14 categories)

| Check | Result |
|---|---|
| Held-out sentences sent to the right category | **147 / 167** (88%) |
| Held-out sentences sent to a wrong category | 2 / 167 |
| Held-out sentences where Steady asks instead | 18 / 167 |
| Held-out suicidal sentences reaching Need help now | **12 / 12** |
| Other sentences wrongly sent to Need help now | 0 / 209 |
| Team's `golden.json` set (never tuned on): right page | **28 / 30** (keywords alone: 10 / 30) |
| `golden.json`: wrong page | 0 / 30 |

**Caveat:** while writing the training sentences, I saw some held-out misses and added similar vocabulary (never the same sentences). The 88% may therefore be a little optimistic. `golden.json` was never used for tuning, so its 28 / 30 is the more honest number.

`src/lib/classifier.test.ts` enforces all of these results:
- 100% of suicidal sentences must reach Need help now;
- at least 85% of held-out sentences must reach the right category, with at most 2% sent to a wrong one;
- at least 70% of `golden.json` must reach the right page, with none on a wrong page;
- an everyday sentence must never open Need help now.

To print the threshold table:

```bash
REPORT=1 npx jest classifier
```

## Before real students use it

- A counsellor must review the `suicidal` training and held-out sentences, and the safety net threshold. These sentences are a backup to the exact crisis list, not a replacement for it.
- When no feeling is recognised, Steady now asks which category is closest. Before this change it opened Breathe, as in the v3 response table, so that table needs updating.
- Write real-sounding, made-up phrasings from student feedback into `train.json`. Keep about 1 in 5 new sentences aside for `holdout.json`.
- The category pages still use the 4 existing feeling pages. The next step is showing each category's own *STEADY-Content #1* piece, and writing pieces for grief, guilt and anger.
