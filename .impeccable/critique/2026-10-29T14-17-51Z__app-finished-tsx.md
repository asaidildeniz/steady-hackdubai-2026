---
target: app/finished.tsx
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/Users/saidildeniz/Desktop/steady/app/finished.tsx"
target_fingerprint: "sha256:bb5e3ca05ad5085b0084744e060562f7f56b562f54eec3b6f5d989de89015077"
target_path: /Users/saidildeniz/Desktop/steady/app/finished.tsx
timestamp: 2026-10-29T14-17-51Z
slug: app-finished-tsx
---
Method: design review only (detector not applicable, native platform)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Nothing says the minute is over; screen reader starts on the Need help pill, not the question |
| 2 | Match System / Real World | 4 | Plain human words |
| 3 | User Control and Freedom | 3 | Back goes Home, Need help always there; double tap stacks Talk twice |
| 4 | Consistency and Standards | 2 | S4 asks a feeling question with equal answers; S7 highlights one in yellow |
| 5 | Error Prevention | 3 | Unknown next goes to a person; blank label or empty list not guarded |
| 6 | Recognition Rather Than Recall | 4 | One question, two answers |
| 7 | Flexibility and Efficiency | 3 | One tap; no "another minute" (guide's choice) |
| 8 | Aesthetic and Minimalist Design | 3 | Calm, bare; question and answers far apart on tall phones |
| 9 | Error Recovery | 3 | Empty options leaves a question with no answer |
| 10 | Help and Documentation | 3 | Answers do not say where they lead |
| **Total** | | **30/40** | **Good** |

## Design Specificity Verdict
Right in spirit (honest question, nothing saved, points to people) but rendered as a generic two-button prompt; its one distinct choice, the yellow "Better", works against the product by highlighting the hopeful answer. Deterministic scan: not applicable (native platform).

## Priority Issues
- [P1] Yellow "Better" leads the answer. Fix: give both answers equal weight (S4 mood pattern or both outlined); keep order and wording. Command: polish.
- [P2] No landing after the exercise; screen-reader focus lands on Need help first. Fix: optional DRAFT finished.message line; focus the question on arrival. Command: clarify, harden.
- [P2] Answers do not say where they go. Fix: optional per-option hint in content, passed to BigButton hint. Command: clarify.
- [P2] Double tap pushes Talk to someone twice. Fix: first tap wins (ref guard), test first. Command: harden.
- [P3] Blank or empty options leave a question with no answer. Fix: skip blank labels; content test for at least one valid option. Command: harden.

## Persona Red Flags
- Student still shaky: bright "Better" they do not feel; "Still hard" looks secondary; double tap shows the list twice.
- Screen-reader user: first hears "Need help now, button"; "Still hard, button" gives no clue it opens people.
- Content reviewer: a cleared label gives an empty yellow button; empty options give no answers, no warning.

## Minor Observations
- Big gap between question (top) and answers (bottom) on tall phones.
- Voice shift from Breathing's centred 24 title to S7's left 32 heading (matches S4).
- No "another minute" option: reviewer's decision, not counted.

## Questions to Consider
- If "Still hard" is the answer we most want easy to give, why is it the quieter button?
- Should the end of the minute say anything, or is silence the gentler landing?
- With every contact pending, is Talk to someone the right destination?
