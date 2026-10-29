# Phone checklist

Walk this once on an iPhone and once on an Android phone before a demo. It follows sections 9 and 12 of the build guide. Tick each box; note the phone and date at the top.

Phone: ____________  Date: ____________

## Start fresh

To open as a fresh install, clear Expo Go's storage (Android: Settings → Apps → Expo Go → Storage → Clear storage) or reinstall Expo Go (iPhone).

## Navigation (section 9)

- [ ] Fresh launch opens S1 Welcome, with no Need help button.
- [ ] S1 Continue shows the age question; Back returns to the intro.
- [ ] "I am under 18" opens S2. It shows the kind message, where to get help and the danger line, with no buttons.
- [ ] On S2, the back gesture and Android back do not return to the age question (Android back closes the app).
- [ ] Relaunch after the under-18 path: S1 asks again (the answer was not kept).
- [ ] "I am 18 or older" opens Home.
- [ ] Force-quit and reopen: Home opens directly.
- [ ] Home: Daily check-in opens S4.
- [ ] S4: Good or Okay opens S5a; Stressed, Lonely or Low opens S5b; Struggling opens Need help now.
- [ ] S5a: Done returns to Home; Calm moment opens Breathing.
- [ ] S5b: Breathe opens Breathing; Talk to someone opens S8.
- [ ] Breathing: Stop returns to Home at any point.
- [ ] Breathing: finishing all rounds opens Finished.
- [ ] Finished: Better returns to Home; Still hard opens Talk to someone.
- [ ] Finished: Still hard, then Back, then Better still works.
- [ ] S8: every Call and Message button is disabled, with "We are still checking this number".
- [ ] S8: the "Need help now" button at the bottom opens S9.
- [ ] S9: Talk to someone returns to S8; Home returns to Home.
- [ ] The Need help now button appears on every screen after Home except S9, and opens S9.

## Section 12 checks

- [ ] **Airplane mode:** turn it on after the app has loaded. Home, check-in, breathing, Talk to someone and Need help now all work.
- [ ] **Largest text:** set the system text size to the largest (iOS: Settings → Accessibility → Display & Text Size → Larger Text; Android: Settings → Display → Font size). On every screen, nothing is cut off or hidden behind the Need help button, and Breathing's Stop stays visible.
- [ ] **Screen reader:** with VoiceOver or TalkBack on, every button says what it is, and Finished starts on the question.
- [ ] **Reduce motion:** with it on, Breathing shows the words and countdown without the circle.
- [ ] **Lock during breathing:** lock the phone mid-exercise and unlock. The current step restarts and the countdown matches.

## Screen recording for the team

Use the phone's own recorder (iOS: Control Centre → Screen Recording; Android: Quick Settings → Screen record). Start from a fresh install, keep it under two minutes, and use no real names or messages.

1. Welcome → Continue → "I am 18 or older".
2. Home → Daily check-in → Stressed → Breathe.
3. Let one round of breathing run, then wait for Finished (or record the whole minute).
4. Finished → Still hard → Talk to someone (show the disabled buttons and the "still checking" line).
5. Need help now → S9 → Home.

Share the recording in the team's daily done / next / stuck post.
