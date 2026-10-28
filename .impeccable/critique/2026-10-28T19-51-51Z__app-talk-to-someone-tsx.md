---
target: app/talk-to-someone.tsx
total_score: 26
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 2
target_identity: "file:/Users/saidildeniz/Desktop/steady/app/talk-to-someone.tsx"
target_fingerprint: "sha256:4f6907e15ca4e95b7daa761a2ed3eb7eaf81abd3a8189b66ba0abab8ca03ea6b"
target_path: /Users/saidildeniz/Desktop/steady/app/talk-to-someone.tsx
timestamp: 2026-10-28T19-51-51Z
slug: app-talk-to-someone-tsx
---
Method: design review only (detector not applicable, native platform). Visual pass: simulator stalled; source review plus user's Phase 2 phone check.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Pending note comes after the disabled buttons |
| 2 | Match System / Real World | 3 | Draft prefix and placeholder names in demo |
| 3 | User Control and Freedom | 3 | No dead ends |
| 4 | Consistency and Standards | 2 | Pill "Need help now" vs yellow "I need help now"; Call and Message both primary |
| 5 | Error Prevention | 4 | Verified-number gate enforced and tested |
| 6 | Recognition Rather Than Recall | 3 | Can/cannot help visible per card |
| 7 | Flexibility and Efficiency | n/a | Single-purpose support screen |
| 8 | Aesthetic and Minimalist Design | 2 | Flat card hierarchy, disabled buttons plus note per card |
| 9 | Error Recovery | 3 | Number shown on dialler failure, not announced |
| 10 | Help and Documentation | 3 | Note explains who and what they cannot help with |
| Total | | 26/36 | Good (72%) |

## Design Specificity Verdict
Behaviour is product-specific (can/cannot help, honest pending, verified gate). Visual is a generic, uniform contact list: quiet but unauthored.

## Priority Issues
- [P1] Two crisis controls; the bottom yellow "I need help now" is the dominant action while contacts are pending. Fix: keep both (spec), make bottom one outlined and match the pill's wording. Command: quieter, clarify.
- [P1] Pending state reads broken; screen reader hears two dimmed buttons before the reason. Fix: pending note above buttons, accessibilityHint on disabled buttons. Command: clarify, harden.
- [P2] Card has no hierarchy; name not a header, all lines 20pt. Fix: name as header, group can/cannot help, more space between cards than within. Command: distill, polish.
- [P2] Two primary yellow actions per card once verified. Fix: Call primary, Message secondary (or reviewer picks Message first). Command: quieter.

## Persona Red Flags
- Sam: dimmed buttons announced before reason; middle dot may be read aloud; failure text not announced.
- Casey: pill out of thumb reach, bottom button is the reachable route; long scroll past 6 buttons with 3 contacts.
- Student in a hard moment: arrives after "Still hard", meets placeholders and dead buttons, screen ends on the crisis button.
- Riley: empty contacts list has no empty-state message.

## Minor Observations
- Failure line joins label and number with a space; awkward at large text.
- Card divider is full-strength muted grey; spacing alone would be quieter.
- Draft prefix stays in content.json; reviewer decides for the demo.

## Questions to Consider
- What does a student do while numbers are pending?
- Should Message be the primary action?
- Does S8 need the bottom crisis button given the pill (team lead's call)?
