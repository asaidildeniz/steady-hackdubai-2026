# Steady: prototype build guide

HACK2026 Dubai · Team 04 · For the developer and for Claude Code · Working draft, 28 Oct 2026

## 1. How to use this file

This guide turns the team deck, the two check-in cards, the userflow PDF and the WhatsApp chat into one build brief for the Steady prototype. Save it in the repo as `docs/STEADY_BUILD_GUIDE.md`, copy the block in section 13 into `CLAUDE.md` at the repo root, and give Claude Code one phase from section 11 at a time. Where this guide and the userflow PDF disagree, follow the PDF and flag the difference to the team lead.

## 2. Where the project stands

Steady is a gentle support app for adult students (18 and over) who feel stressed or lonely. The prototype offers a daily check-in, a one-minute breathing exercise, a list of trusted people (pastors and counsellors from churches) and a "Need help now" screen. Short Christian readings, a private journal and an AI helper are part of the longer vision but are not in this build.

The team lead coordinates the project. You are the developer. A mental wellness and relationship counsellor was introduced on 22 Oct as the content reviewer, so all wording is a draft until the reviewer approves it. A mentor with an HR and counselling background was introduced on 19 Oct. The team's guiding question, from the FaithTech playbook, is "Whose pain have we listened to directly?", and the tone is honest, gentle, never preachy.

Check-in 1 was Thu 22 Oct (planning). Check-in 2 is Thu 29 Oct and its headline is "the first tool working on the phone, and your reviewer on board". Two of its checklist items are yours: build the daily check-in (no account, nothing leaves the phone) and build the "talk to a trusted person" screen with what to show if someone is in danger. The team also has to pick the one thing to build first based on what students said, so expect the check-in to be that, but stay ready to change mood words or priorities. The final presentation is in late November (the deck says 22 Nov, the check-in cards say Thu 26 Nov, and the team has confirmed both are fine). Every day at 8 PM the team posts done, next, stuck in the private #HACK group, so keep a short screen recording or screenshot ready as evidence of completion.

## 3. Rules that must never be broken

1. Adults only. Show the age question on first launch. Under 18 sees a kind message and where to get help, then the flow ends. Do not store the answer.
2. No accounts, no login, no backend, no network calls of any kind.
3. Nothing leaves the phone. No analytics, no crash-reporting SDK, no remote fonts or images, no logging of user choices.
4. Never store mood choices, the "how do you feel now" answer, the age answer or any journal text. The only value saved on the device is one flag: `steady.welcomeSeen`.
5. No phone numbers, emergency numbers or helplines until the reviewer verifies them. Ship placeholders that are visibly empty, never realistic fake numbers.
6. All wording lives in one editable content file, so the reviewer's changes never need code changes.
7. A visible "Need help now" button on every screen after Home, always in the same place.
8. No dead ends: every screen has a way forward or back, and the under-18 screen explains where to get help.
9. Leave out streaks, points, badges, push notifications, pop-ups and anything that creates pressure.
10. No treatment-style advice, no diagnosis words, no AI in this build.
11. Breathing must work offline.

## 4. Open decisions and the defaults to build with

Build with the default and tell the team what you assumed. None of these should block you.

| Decision | Default to build with | Who confirms |
|---|---|---|
| Platform | Expo (React Native) with TypeScript, tested in Expo Go on iOS and Android | Team lead |
| AI helper | Out of scope. No AI code, no chat screen. The note on S9 about AI directing users is treated as "Later". | Team lead, reviewer |
| Calming tool | One-minute breathing with placeholder timings (4 in, 4 hold, 6 out). Replace when the sample arrives; the reviewer must confirm it. | Team lead sends sample, reviewer confirms |
| Contacts and helplines | Empty and marked unverified. Screens show a "pending verification" message. | Reviewer |
| "Need help now" on Home | The spec says "after Home"; also show it on Home because it is the safest place for it. Not on S1, S2 or S9. | Team lead |
| Under-18 relaunch | The answer is not stored, so relaunching asks again. Accepted as the privacy trade-off. | Team lead, reviewer |
| Language | English only in v1 | Team lead |
| S7 options | "Better" and "Still hard" | Reviewer |

## 5. Direction and tech stack

Use Expo with TypeScript and Expo Router. One codebase covers iOS and Android, the team and the reviewer can open the app by scanning a QR code in Expo Go with no store steps, and Expo Router's file-based routes map one-to-one onto the screens S1 to S9. State is plain React state plus navigation params, because nothing is persisted except the single welcome flag.

Dependencies allowed: `expo-router`, `@react-native-async-storage/async-storage` for the one flag, and React Native's built-in `Animated` and `Linking`. Do not add analytics, crash reporting, auth, state-management libraries, networking libraries or UI kits; the four components in section 6 are small enough to write by hand.

```bash
npx create-expo-app@latest steady
cd steady
npm run reset-project        # if the template offers it; removes the demo screens
npx expo install @react-native-async-storage/async-storage
npx expo start               # scan the QR code with Expo Go
```

Expo changes often, so before installing, Claude Code should check the current setup in the Expo docs (docs.expo.dev) and use `npx expo install` so package versions match the SDK.

## 6. Project structure

```
steady/
  CLAUDE.md
  docs/STEADY_BUILD_GUIDE.md
  app/
    _layout.tsx              Stack navigator, no headers, off-white background
    index.tsx                S0 launch gate: decides Welcome or Home
    welcome.tsx              S1 Welcome and age check (the landing page)
    adults-only.tsx          S2
    home.tsx                 S3
    check-in.tsx             S4
    check-in-result.tsx      S5a and S5b, param group = kind | gentle
    breathing.tsx            S6
    finished.tsx             S7
    talk-to-someone.tsx      S8
    need-help.tsx            S9
  src/
    content/content.json     ALL wording, moods, contacts, helplines
    content/types.ts         TypeScript types for the content file
    components/Screen.tsx    page wrapper: padding, background, Need help button
    components/BigButton.tsx large tap target
    components/NeedHelpButton.tsx
    components/BreathingCircle.tsx
    lib/storage.ts           only get/set for steady.welcomeSeen
    lib/phone.ts             open tel: and sms: links
    theme.ts                 colours, type sizes, spacing
```

## 7. Design system

The feel is warm, quiet, honest and gentle. Use one main thing per screen, plenty of space, large text and large buttons. Simple and calm matters more than fancy. These colours are eyeballed from the team cards, so adjust to the team's real palette if there is one.

| Token | Value | Use |
|---|---|---|
| background | `#F5F2ED` | every screen |
| text | `#121212` | all text |
| muted | `#6B6B6B` | small notes |
| accent | `#EFE56F` | button fills only, always with dark text |
| need-help | `#121212` fill, off-white text | the persistent Need help now pill |

Body text 20, headings 32, button labels 20 bold, minimum tap target 56, screen padding 24. Never put yellow text on the off-white background, because the contrast is too low. Respect the system font size setting (do not disable font scaling), give every button an `accessibilityRole` and `accessibilityLabel`, and honour the reduce-motion setting in the breathing screen. Use the system font so nothing needs downloading.

## 8. The content file

Everything the user reads, plus mood words, contacts and helplines, lives in `src/content/content.json`. Screens read from it and never hard-code wording. A shortened example of the shape:

```json
{
  "reviewStatus": "DRAFT: not yet approved by the reviewer",
  "welcome": {
    "title": "Welcome to Steady",
    "body": "Support for adult students. No account. Everything stays on your phone.",
    "notEmergency": "Steady is not emergency care."
  },
  "adultsOnly": {
    "message": "Steady is for people aged 18 and over.",
    "whereToGetHelp": "If you need support, please talk to a trusted adult."
  },
  "checkIn": {
    "prompt": "How are you today?",
    "moods": [
      { "id": "good", "label": "Good", "group": "kind" },
      { "id": "okay", "label": "Okay", "group": "kind" },
      { "id": "stressed", "label": "Stressed", "group": "gentle" },
      { "id": "lonely", "label": "Lonely", "group": "gentle" },
      { "id": "low", "label": "Low", "group": "gentle" },
      { "id": "struggling", "label": "Struggling", "group": "urgent" }
    ]
  },
  "results": {
    "kind": { "message": "Draft: glad you checked in." },
    "gentle": { "message": "Draft: that sounds heavy. Would you like to breathe, or talk to someone?" }
  },
  "breathing": {
    "phases": [
      { "label": "Breathe in", "seconds": 4 },
      { "label": "Hold", "seconds": 4 },
      { "label": "Breathe out", "seconds": 6 }
    ],
    "cycles": 4
  },
  "finished": { "prompt": "How do you feel now?", "options": ["Better", "Still hard"] },
  "talkToSomeone": {
    "note": "Draft: these people can listen and pray with you. They are not emergency services.",
    "contacts": [
      {
        "id": "c1",
        "name": "Contact name (placeholder)",
        "role": "pastor",
        "church": "Church name",
        "canHelpWith": "Listening, encouragement",
        "cannotHelpWith": "Emergencies",
        "phone": "",
        "verified": false
      }
    ]
  },
  "needHelp": {
    "message": "Draft: you are not alone. Here is who to reach right now.",
    "emergencyNumbers": [{ "label": "Emergency services", "number": "", "verified": false }],
    "helplines": [{ "label": "Helpline name", "number": "", "verified": false }],
    "pendingMessage": "Verified numbers will appear here once our reviewer has checked them."
  }
}
```

The routing of each mood is stored as `group` in the content file, so the reviewer can rename or reorder mood words without touching code. A contact or number with an empty `phone` or `verified: false` is never shown as tappable.

## 9. Navigation and flow table

This is the transition table from the userflow PDF with the Expo routes added. Use `router.replace` for the launch gate, S1 to S3 and S9 Back, so the age gate cannot be bypassed with the back gesture.

| From | When or button pressed | Goes to |
|---|---|---|
| Open the app | First time | S1 Welcome and age check (`/welcome`) |
| Open the app | Returning user | S3 Home (`/home`) |
| S1 Welcome | Confirms 18 or older | S3 Home |
| S1 Welcome | Under 18 | S2 Adults only (`/adults-only`), flow ends |
| S3 Home | Daily check-in | S4 (`/check-in`) |
| S3 Home | Calm moment | S6 (`/breathing`) |
| S3 Home | Talk to someone | S8 (`/talk-to-someone`) |
| S4 Daily check-in | Good or Okay | S5a (`/check-in-result?group=kind`) |
| S4 Daily check-in | Stressed, Lonely or Low | S5b (`/check-in-result?group=gentle`) |
| S4 Daily check-in | Struggling | S9 Need help now (`/need-help`) |
| S5a | Done / Calm moment | S3 Home / S6 Breathing |
| S5b | Breathe / Talk to someone | S6 Breathing / S8 Talk to someone |
| S6 Breathing | Finish / Stop | S7 Finished (`/finished`) / S3 Home |
| S7 Finished | Better / Still hard | S3 Home / S8 Talk to someone |
| S8 Talk to someone | Tap a contact | The phone's own call or message app |
| S8 Talk to someone | I need help now | S9 Need help now |
| Any screen after Home | Need help now button | S9 Need help now |
| S9 Need help now | Talk to someone / Back | S8 Talk to someone / S3 Home |

## 10. Screen-by-screen build steps

Build every screen from the content file, using the `Screen` wrapper, with a "Done when" check at the end of each.

**S0, launch gate (`app/index.tsx`).** On mount, read `steady.welcomeSeen` through `lib/storage.ts`. While reading, render only the background colour so there is no flash. If the flag is `true`, `router.replace('/home')`; otherwise `router.replace('/welcome')`. Done when a fresh install opens S1, and after confirming 18 or older, force-quitting and reopening lands on Home.

**S1, Welcome and age check, the landing page (`app/welcome.tsx`).** This screen has two steps on one route. Step one shows the title and short intro from the content file: support for adult students, no account, stays on your phone, not emergency care, with one large "Continue" button. Step two asks the age question with two large buttons, "I am 18 or older" and "I am under 18", not a date-of-birth field, so no more data is collected than necessary. On 18 or older, write `steady.welcomeSeen = true` and `router.replace('/home')`. On under 18, `router.replace('/adults-only')` and write nothing. Hide the Need help button here. Done when both paths work and nothing is stored on the under-18 path.

**S2, Adults only (`app/adults-only.tsx`).** Show the kind message and where to get help from the content file. There are no navigation buttons, as the spec says, but the screen must not feel like a dead end, so the help text is the content. Disable the back gesture. Do not store anything. Any numbers shown here follow the same verified-only rule as S9.

**S3, Home (`app/home.tsx`).** Three large buttons: Daily check-in, Calm moment, Talk to someone, plus the Need help now pill. Keep it very simple, with no name, date, streak or greeting that depends on past use. Done when each button reaches the right screen.

**S4, Daily check-in (`app/check-in.tsx`).** Show the prompt "How are you today?" and the six mood buttons from `checkIn.moods`, in order. Tapping a mood navigates immediately by its `group`: `kind` and `gentle` go to `/check-in-result` with that group as a param, and `urgent` goes to `/need-help`. There is no submit step, nothing is saved and nothing is logged. Done when all six moods route correctly and no storage key is created.

**S5a and S5b, Check-in result (`app/check-in-result.tsx`).** One route renders both screens based on the `group` param. For `kind` it shows a short kind message with "Done" (to Home) and an optional "Calm moment" (to Breathing). For `gentle` it shows a gentle message with two choices, "Breathe" (to Breathing) and "Talk to someone" (to S8). Keep the wording gentle and never preachy, with no treatment-style advice. Done when each button lands where the table says.

**S6, Breathing (`app/breathing.tsx` and `components/BreathingCircle.tsx`).** About one minute of guided breathing: a circle that grows on "Breathe in", holds, and shrinks on "Breathe out", with the phase label and a seconds countdown. Read phases and cycles from `breathing` in the content file, so the reviewer or the real calming-tool sample can change them. Build it with React Native's `Animated` and a timer, stop everything on unmount, and show text and countdown only when reduce motion is on. No sound and no haptics in v1. A "Stop" button is always visible and goes to Home; finishing all cycles goes to S7. Done when it runs fully in airplane mode and leaving the screen cancels the animation.

**S7, Finished (`app/finished.tsx`).** Ask "How do you feel now?" with the options from the content file. "Better" goes to Home and "Still hard" goes to S8. The answer is not saved. Done when no state survives leaving the screen.

**S8, Talk to someone (`app/talk-to-someone.tsx`).** Show the plain note at the top about what these people can and cannot help with, then one card per contact: name, role (pastor or counsellor), church, and a short can-help-with and cannot-help-with line. Each card has Call and Message buttons that use `Linking.openURL('tel:' + phone)` and `sms:` inside a try/catch (do not use `canOpenURL`, which needs extra iOS configuration). If `phone` is empty or `verified` is false, show the buttons disabled with "Number pending verification". If opening fails, show the number as text. Add the "I need help now" button to S9. Contacts live in the one content file. Done when an empty contact is safely disabled and a test number opens the dialler on a real phone.

**S9, Need help now (`app/need-help.tsx`).** Show the calm message, then three groups: emergency numbers, verified helplines, and names of real people (reuse the contacts). Only entries with `verified: true` and a non-empty number are shown as tappable `tel:` links. If nothing is verified, show `needHelp.pendingMessage` instead, and say clearly in the demo that the numbers are pending the reviewer. Buttons: "Talk to someone" (to S8) and "Back" (to Home using `router.replace('/home')`). Do not show the Need help pill here. Done when it works offline and no unverified number can ever appear as tappable.

**Shared Need help button.** `Screen` renders `NeedHelpButton` by default, in the same corner on every screen, reserving space so it never covers content. It is turned off with a prop on S1, S2 and S9. It goes to `/need-help`. Done when a quick walk through every screen shows it in the same place on all but those three.

## 11. Build order

Work in these phases, one Claude Code session per phase, and commit after each. Phases 0 to 2 cover what check-in 2 asks of you, so protect them.

**Phase 0, setup.** Create the project, run it in Expo Go on your own phone, add `CLAUDE.md` and this guide.

**Phase 1, foundations.** `theme.ts`, `Screen`, `BigButton`, `NeedHelpButton`, `content.json` with `types.ts`, and `lib/storage.ts` with the single flag.

**Phase 2, check-in 2 core.** S3 Home (simple version), S4, S5a and S5b, S8, S9, with the Need help button on every screen. Placeholder content is fine.

**Phase 3, entry flow.** S0 launch gate, S1 Welcome and age check, S2.

**Phase 4, calm.** S6 Breathing and S7 Finished.

**Phase 5, hardening.** Run the tests in section 12, fix the accessibility basics, write a short `README.md` (how to run, where to edit content), and record a screen capture of the full flow for the team.

## 12. Testing

Walk every row of the section 9 table on a real phone, then check the following:

1. Fresh install shows S1; confirming 18 or older then force-quit and reopen lands on Home.
2. The under-18 path shows S2 and creates no storage key at all.
3. After a full session, the only key in storage is `steady.welcomeSeen`.
4. Airplane mode: Home, check-in, breathing, talk to someone and Need help now all work.
5. Set system text to the largest size and check that nothing is cut off or hidden behind the Need help pill.
6. Empty contacts and unverified numbers are disabled or hidden and never tappable.
7. Search the codebase for `fetch`, `axios`, `XMLHttpRequest`, `analytics` and `console.log` of user choices. There should be none.
8. Back gesture and Android back button cannot bypass the age gate or loop on S2.

## 13. Running this with Claude Code

Copy this block into `CLAUDE.md` at the repo root so every session starts with the rules:

```markdown
# Steady (HACK2026 Dubai)
Expo + TypeScript + Expo Router prototype for a gentle student well-being app. Full brief: docs/STEADY_BUILD_GUIDE.md.

Hard rules: adults only (18+), no accounts, no network calls, no analytics, nothing leaves the phone.
Only persisted value is the AsyncStorage key steady.welcomeSeen. Never store mood, age answer or any text.
All wording, moods, contacts and helplines live in src/content/content.json (reviewer edits it, not code).
Never show an unverified or empty phone number as tappable, and never invent realistic numbers.
Need help now button on every screen after Home except S9. Breathing must work offline.
No streaks, points, badges, push notifications or pop-ups. Tone: honest, gentle, never preachy.
Do not add dependencies beyond the guide without asking.
```

Start each session in plan mode and ask for the plan before code. Starter prompt for the first session:

> Read CLAUDE.md and docs/STEADY_BUILD_GUIDE.md fully. Do Phase 0 and Phase 1 only. First check the current Expo docs for the correct create-expo-app and Expo Router setup, then show me your plan before writing any code. Do not add any dependency not listed in section 5 without asking.

For later sessions, name the phase and the screens, for example: "Do Phase 2: S3, S4, S5a/S5b, S8 and S9, following sections 9 and 10, using placeholder content."

## 14. Later, not in this prototype

Fifteen to twenty short readings on stress, loneliness and identity (planned for weeks 4 and 5, reviewed by the counsellor before use), a private journal stored only on the device, and an AI helper that is still undecided and test-only. If the AI helper is ever built, it must never pose as a counsellor, must hand off to a real person, and must not be presented as a substitute for human care.
