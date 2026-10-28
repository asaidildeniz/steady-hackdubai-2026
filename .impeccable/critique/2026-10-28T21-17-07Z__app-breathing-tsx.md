---
target: app/breathing.tsx
total_score: 26
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 1
target_identity: "file:/Users/saidildeniz/Desktop/steady/app/breathing.tsx"
target_fingerprint: "sha256:89d94fe1bab0f95a37c59e32c0f1a05a84f24b645c8ed99d9fa024bbed252baf"
target_path: /Users/saidildeniz/Desktop/steady/app/breathing.tsx
timestamp: 2026-10-28T21-17-07Z
slug: app-breathing-tsx
---
Method: design review only (detector not applicable, native platform). Source review plus user's Phase 4 phone check.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | No overall progress through the minute |
| 2 | Match System / Real World | 4 | Plain phase words |
| 3 | User Control and Freedom | 2 | Stop can scroll off at large text (guide: always visible) |
| 4 | Consistency and Standards | 3 | Yellow circle contradicts "button fills only" rule |
| 5 | Error Prevention | 3 | Instant Stop, appropriate |
| 6 | Recognition Rather Than Recall | 4 | All on screen |
| 7 | Flexibility and Efficiency | n/a | One guided minute |
| 8 | Aesthetic and Minimalist Design | 3 | Left heading over centred exercise; countdown as loud as title |
| 9 | Error Recovery | 3 | Background/lock drift between circle and countdown |
| 10 | Help and Documentation | 2 | Instant start, no length or "stop any time" |
| Total | | 26/36 | Good (72%) |

## Design Specificity Verdict
Most Steady-specific screen (one shape, one word, one number). The template frame around it (left heading) is the generic part.

## Priority Issues
- [P1] Stop can scroll off at large text. Fix: pinned actions on Screen for S6; circle scales to screen and font size. Command: harden.
- [P2] Lock/background drifts circle vs countdown. Fix: pause on background, restart current phase on return. Command: harden.
- [P2] No sense of length; sudden start. Fix: DRAFT "About one minute. Stop any time." and "2 of 4". Command: clarify.
- [P2] Frame competes with the exercise. Fix: centre title at title size; countdown the only large figure. Command: distill, polish.
- [P3] DESIGN.md One Accent Rule contradicts the yellow circle. Fix: name the circle as the one exception. Command: polish.

## Persona Red Flags
- Sam: no length or stop reassurance.
- Casey: drift after lock; Stop below fold at largest text.
- Riley: max text hides Stop; app switch drifts circle.
- Student in a hard moment: instant start, no idea it is short.

## Minor Observations
- Screen may dim (keep-awake needs a new dependency).

## Questions to Consider
- Give the minute a start, middle and end?
- Circle as the only yellow on the screen?
