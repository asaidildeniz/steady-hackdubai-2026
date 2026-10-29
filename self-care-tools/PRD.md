# Steady — Self-Care Tools Demo · PRD

_Created 2026-10-27._

## Goal
A small, polished, interactive demo of three self-care tools from the Steady concept,
good enough to show the team and others on a phone or laptop. It proves the idea:
"a practical next step when life feels heavy."

## Audience
- Primary: the Steady team, mentor/counsellor reviewers, and potential partners watching a demo.
- Secondary (future): students facing stress, overthinking, or loneliness.

## Requirements
**General**
- R1. Static site, no backend, no accounts, no AI, no analytics. Nothing a user types leaves the device or is stored.
- R2. A simple menu with three tool cards. Each card names the problem it helps with and the duration.
- R3. Mobile-first and responsive. Works with light and dark mode, the keyboard, and reduced motion.
- R4. A footer disclaimer on every screen: demo, self-help only, not professional care.
- R5. You can leave any tool at any step (Back / Exit).

**Tool 1: Breathe (stress / anxiety)**
- R6. Three patterns: Gentle (NHS-style, in 4 / out 5), Calming sigh (inhale, top-up, long exhale), Box (4-4-4-4).
- R7. Duration choice: 1, 2, or 3 minutes. Pause, resume, and stop.
- R8. An animated circle synced to the phases, with a text cue and remaining time. Optional soft chime and vibration (off by default).
- R9. Reduced-motion users get the text and a progress cue instead of the scaling animation.
- R10. A finish screen with a "How do you feel now?" check (better / same / worse) and a closing message for each answer.

**Tool 2: Untangle (overthinking / negative thoughts)**
- R11. A six-step wizard with a progress bar: thought → defusion ("I'm having the thought that…") → facts vs guesses → friend's view → balanced thought → next step and when.
- R12. Tappable example thoughts so the demo can be run quickly.
- R13. A summary card (original → balanced → next step) with Copy.

**Tool 3: Reach Out (loneliness)**
- R14. An optional 30-second self-compassion moment (three lines), which can be skipped.
- R15. Three needs: someone to listen / reconnect with a friend / talk to someone I trust.
- R16. Two or three editable message templates per need, with a casual or open tone toggle.
- R17. Copy, plus native Share where it's supported.
- R18. A gentle line below: if things feel like too much, talk to someone you trust or a professional.

## Success criteria
- All three tools complete end to end on phone and desktop, with no console errors.
- A first-time viewer can finish any tool in under 3 minutes without instructions.
- Wording feels warm and non-clinical. The counsellor review is still pending (see TODO).

## Non-goals
- No home screen or mood check-in, no Get Support page, no faith toggle, no accounts, no persistence, no chat or AI.
  These were cut by Abel on 2026-10-27: tools only.
- Not clinically validated triage or treatment.
