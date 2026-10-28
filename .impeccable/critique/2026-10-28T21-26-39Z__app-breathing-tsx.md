---
target: app/breathing.tsx
total_score: 32
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 0
target_identity: "file:/Users/saidildeniz/Desktop/steady/app/breathing.tsx"
target_fingerprint: "sha256:22353cb5bc7efefcc85bc3722bec359a8cb1d44e379cfe0c9077eb9ea67c9eda"
target_path: /Users/saidildeniz/Desktop/steady/app/breathing.tsx
timestamp: 2026-10-28T21-26-39Z
slug: app-breathing-tsx
---
Method: design review only (detector not applicable, native platform). Second run at d020c90, plus user's phone check.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Restart after unlock not announced |
| 2 | Match System / Real World | 4 | Plain words |
| 3 | User Control and Freedom | 4 | Stop pinned, "Stop any time" |
| 4 | Consistency and Standards | 4 | Circle is documented yellow exception |
| 5 | Error Prevention | 3 | Instant Stop, appropriate |
| 6 | Recognition Rather Than Recall | 4 | All visible |
| 7 | Flexibility and Efficiency | n/a | One guided minute |
| 8 | Aesthetic and Minimalist Design | 3 | Countdown digits change width |
| 9 | Error Recovery | 4 | Pause on lock, phase restarts in step |
| 10 | Help and Documentation | 3 | Intro present, still Draft |
| Total | | 32/36 | Good (89%) |

## Design Specificity Verdict
One centred column, one yellow shape, one large number; reads as Steady's own and the clearest Quiet Room screen.

## Priority Issues
- [P3] Countdown digits shift width. Fix: fontVariant tabular-nums on countdown and round line. Command: polish.
- [P3] Silent restart after unlock for screen readers. Fix: re-announce the current phase on restart. Command: harden.
- [P3] Draft prefix in intro. Reviewer drops it in content.json. Command: clarify (reviewer).

## Persona Red Flags
- Sam: no announcement after unlocking mid-exercise.
- Casey, Riley: none.

## Minor Observations
- Reduce motion collapses the circle space; fine.

## Questions to Consider
- Use this screen as the reference for the others once wording is approved?
