---
target: app/welcome.tsx
total_score: 25
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 1
target_identity: "file:/Users/saidildeniz/Desktop/steady/app/welcome.tsx"
target_fingerprint: "sha256:6ee52fe1cd74d5d34626a5ea3cbb8339c19bd1af49542432cf1741d33104123d"
target_path: /Users/saidildeniz/Desktop/steady/app/welcome.tsx
timestamp: 2026-10-28T20-35-18Z
slug: app-welcome-tsx
---
Method: design review only (detector not applicable, native platform). Source review plus user's Phase 3 phone check.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Step change not announced; screen-reader focus lost |
| 2 | Match System / Real World | 3 | Plain language; generic "Welcome to Steady" |
| 3 | User Control and Freedom | 2 | No way back to step 1; Android back exits |
| 4 | Consistency and Standards | 3 | Deliberate outlined pair |
| 5 | Error Prevention | 3 | One tap commits; wrong answer recoverable by relaunch, unexplained |
| 6 | Recognition Rather Than Recall | 4 | All visible |
| 7 | Flexibility and Efficiency | n/a | One-time gate |
| 8 | Aesthetic and Minimalist Design | 3 | Top-heavy, buttons mid-screen |
| 9 | Error Recovery | 3 | Recovery by relaunch, not explained |
| 10 | Help and Documentation | 2 | "Not emergency care" points nowhere |
| Total | | 25/36 | Acceptable (69%) |

## Design Specificity Verdict
Behaviour is product-specific (no DOB, equal answers, nothing stored under 18, no swipe past). Surface is a generic "Welcome to [App]" template; the promise is buried in body text.

## Priority Issues
- [P1] Screen reader loses place when step 2 replaces step 1. Fix: setAccessibilityFocus on the age question heading (announce fallback). Command: harden.
- [P2] "Not emergency care" points nowhere. Fix: DRAFT danger guidance, no number. Command: clarify.
- [P2] Age question silent about what happens to the answer. Fix: DRAFT "Your answer stays on this phone." Command: clarify.
- [P2] Top-heavy layout, buttons mid-screen. Fix: anchor actions to bottom via a Screen actions slot, still scrollable. Command: distill, polish.
- [P3] Generic headline. Fix: DRAFT promise-led headline for reviewer. Command: clarify.

## Persona Red Flags
- Sam: focus stays on vanished Continue button.
- Jordan: no why/what-happens at the age question; S2 does not mention relaunch.
- Casey: buttons above thumb zone, empty bottom half.
- Student in a hard moment: first safety line has nowhere to turn.

## Minor Observations
- Two-sentence question at 32pt runs ~6 lines at largest text.
- S2 could mention reopening asks again (out of scope).

## Questions to Consider
- Lead with the promise instead of the name?
- Keep "not emergency care" visible on step 2?
- One screen instead of two steps (team lead's call)?
