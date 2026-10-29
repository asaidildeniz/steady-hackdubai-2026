# Tests — Steady demo

## ⏳ To Test
- [User] **Live link on your phone.** Open https://steady-self-care.netlify.app on your phone, go through each tool once, and send the link to one friend to confirm it opens for them.
- [User] **Swiss restyle look and feel.** Open the menu on laptop and phone. Does it read as calm rather than stark? Are the neon-yellow Untangle accents too loud for someone who's stressed?
- [User] **Feel check on a real phone.** Open the site on your phone and go through each tool once. Does the pacing of Breathe feel calm (not rushed or too slow)? Does the wording in Untangle and Reach Out feel warm and not preachy?
- [User] **Share sheet.** On your phone in Reach Out, tap Share…. Expected: the native share sheet opens with the message (WhatsApp, iMessage, and so on).
- [User] **Chime and vibrate.** In Breathe, turn on Soft chime (and Vibrate on Android). Expected: a soft tone or buzz at each phase change, nothing harsh.

## ✅ Tested & Working
- [Claude] 2026-10-27 **Live deploy check (https://steady-self-care.netlify.app).**
  - All three tools load, Breathe cycles cues, and Space Grotesk loads.
  - No console errors from the site.
  - The CSP is active: it blocked a test fetch, as intended.
  - `/PRD.md` returns 404, so the docs don't ship.
  - Resources come only from the site itself and Google Fonts. Storage is empty.
  - Mobile layout holds at 375px in dark mode.
- [Claude] 2026-10-27 **Pre-deploy regression (local).** Menu shows 3 rows. Breathe sigh runs, and pause/resume works. Untangle and Reach Out mount. No localStorage or cookies. Network goes only to fonts. No console errors.
- [Claude] 2026-10-27 **Swiss restyle.** Checked at 1280×860 light and 375×812 dark. Menu index rows: the hover wipe works, and time and arrow are right-aligned (both right edges at 1161px).
  - Breathe setup and session, Untangle sort and summary, and Reach Out message all render in the new style.
  - No focus box appears on headings. No console errors.
_All verified 2026-10-27 by Claude in the in-app browser at localhost, in both 800×600 dark and 375×812 light._
- [Claude] **Menu:** three cards are shown and each opens its tool. "All tools" is hidden on the menu and visible inside tools.
- [Claude] **Breathe, Calming sigh:** after a 3-second lead-in, the cues cycle (in → top-up → long out) while the orb scales and the time left counts down.
- [Claude] **Breathe, Pause/Resume:** the orb and bar freeze, the cue shows "Paused", and Resume continues.
- [Claude] **Breathe, finish early:** shows the finish screen. Choosing "Not better" shows the matching gentle message.
- [Claude] **Breathe, natural end:** a 1-minute Gentle session ends on its own and shows the finish screen.
- [Claude] **Untangle full flow:** the example chip fills in the thought and the step-2 defusion text reads correctly.
  - The thought splits into "I failed this exam" and "my whole future is ruined", and marking them shows the right hint.
  - Next stays disabled until you've typed something, and "Use example" fills it in.
  - The summary shows thought → balanced → step with "Tomorrow", and Copy shows a "Copied" toast.
- [Claude] **Reach Out:** the three compassion lines step through, then the needs screen appears. "Someone to listen" shows the message screen.
  - Switching to More open and then "Try another wording" shows option 2 of 3 of the open set.
- [Claude] **Console:** no errors on any route.

## 🔁 Regression checklist (before every deploy)
1. Each of the three tools completes end to end.
2. Breathe Pause/Resume works, and leaving mid-session (All tools) stops the timers with no console errors.
3. Copy works in Untangle and Reach Out.
4. Check mobile 375px width and dark mode for layout breaks.
5. Nothing is written to localStorage or cookies, and there are no network requests besides the fonts.
