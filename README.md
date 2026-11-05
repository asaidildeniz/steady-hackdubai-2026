# Steady

A gentle support app for adult students (18 and over), built for HACK2026 Dubai. It has a daily check-in, a one-minute breathing exercise, a list of trusted people (pastors and counsellors), and a "Need help now" screen.

This is a prototype. All wording is a draft until the content reviewer approves it.

## Run it on your phone

1. Install **Expo Go** from the App Store or Google Play. The project uses Expo SDK 58, so Expo Go must support SDK 58.
2. On your computer, in this folder:

   ```bash
   npm install
   npx expo start
   ```

3. Scan the QR code. On iPhone use the Camera app; on Android use Expo Go.

The phone and the computer must be on the same Wi-Fi. If that is not possible, use `npx expo start --tunnel`.

To see the first-launch age question again, clear Expo Go's storage (Android: Settings → Apps → Expo Go → Storage → Clear storage) or reinstall Expo Go (iPhone).

## Demo mode (for presenting)

```bash
npm run demo
```

This opens a **Demo** screen first, with:

- **Start as a first-time visitor:** shows the age question again in one tap (it removes only `steady.welcomeSeen`).
- **Start at Home:** skips the age question.
- **Jump to a screen:** straight to Check-in, Calm moment, Finished, Arrange a time to talk, Need help now or the under-18 screen.

In demo mode, wording shows without its `Draft:` label (content.json and a normal start keep the labels), breathing is one short round (about 6 seconds), and Arrange a time to talk shows two example contacts instead of the placeholders: **Example pastor**, whose Call and Message buttons show a note instead of dialling, and **Example counsellor**, still waiting for verification. Neither has a phone number. A normal start shows content.json exactly as it is. Nothing else is saved.

**To make Example pastor's Call open the real dialer**, put a number whose owner has agreed (for example your own) in a file called `.env.local` in this folder, then restart with `npm run demo`:

```
EXPO_PUBLIC_DEMO_PHONE=your number, with country code
```

Git ignores `.env.local`, so the number never reaches GitHub. Only demo mode uses it; a normal start never does. An APK built in demo mode with this file present contains the number, so share such an APK only with people who may see it. An iPad cannot make calls, so present the dialer from a phone.

On Windows (PowerShell): `$env:EXPO_PUBLIC_DEMO="1"; npx expo start --clear`

To leave demo mode, stop it and run `npx expo start --clear` (the `--clear` makes sure the demo switch is forgotten). The demo story to follow is in [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md).

## Typed feelings and the on-phone model

On the check-in, a student can type (or speak with the keyboard microphone) how they feel. Typed text is first checked against `safety.crisisPhrases` (any match opens Need help now), then turned into feeling and theme tags on the phone, then cleared. It is never saved or sent.

- **Expo Go:** tags come from keywords (the taxonomy's example phrases) with small-typo tolerance.
- **A built app (APK or development build):** a small sentence model, all-MiniLM-L6-v2 through React Native ExecuTorch, also adds tags by meaning, so "everyone's moving on without me" finds Lonely. The model is bundled in the app and runs offline.

The model files (about 90 MB) are not in git. After cloning, run once:

```bash
npm run fetch-model
```

It downloads them from Software Mansion's Hugging Face page and checks their hashes.

**Working on the smart version without rebuilding:** install the development build once (`cd android && ./gradlew assembleDebug`, then install `android/app/build/outputs/apk/debug/app-debug.apk`), then run `npm run demo:dev` and open the project from the development build. Code and content changes then appear live. `npm run demo` still opens in Expo Go (keywords only). Because the project has a development client, a plain `npx expo start` opens in development-build mode; use `npx expo start --go` for Expo Go. `npm install` holds back the library's own install step; if a native build complains about missing ExecuTorch libraries, run `RNET_NO_X86_64=1 node node_modules/react-native-executorch/scripts/download-libs.js` (it downloads the engine from the library's GitHub releases and checks each file's hash). The Android build needs `minSdkVersion` 26.

## Change wording, contacts or helplines

Everything people read lives in one file: [`src/content/content.json`](src/content/content.json). Screens never contain wording, so editing this file is enough. Save it and the app reloads.

- **Drafts:** new wording starts with `Draft:` and gets a line in `reviewNotes` at the top of the file. When the reviewer approves it, remove the `Draft:` prefix.
- **Phone numbers:** a number is only tappable when it is filled in **and** `"verified": true` (true without quotes). Until then its buttons are disabled and the app says the number is still being checked. Never put in a number that has not been checked.
- **Breathing:** change `breathing.phases` (seconds per step) and `breathing.cycles`. Bad values are skipped safely.
- **Finished screen:** each option's `next` must be `"home"` or `"talkToSomeone"`.

## Rules the app keeps

- Adults only (18+). No account, no login, no network calls, no analytics. Nothing leaves the phone.
- The only thing saved on the phone is `steady.welcomeSeen` (so the age question is not asked twice). Moods, the age answer and any text are never saved.
- No streaks, points, badges, notifications or pop-ups.

The full brief is [`docs/STEADY_BUILD_GUIDE.md`](docs/STEADY_BUILD_GUIDE.md).

## Tests

```bash
npm test
```

The tests guard the things that would hurt if they broke: mood routing, the age gate, that storage only ever holds `steady.welcomeSeen`, that unverified numbers are never tappable, and that the code has no network calls or logging.

Before a demo, walk [`docs/PHONE_CHECKLIST.md`](docs/PHONE_CHECKLIST.md) on a real phone.

## Where things are

```
app/                 one file per screen (S0 to S9)
src/content/         content.json and its types
src/components/      Screen, BigButton, NeedHelpButton, BreathingCircle
src/lib/             storage, phone links, breathing timing, and the tests
```
