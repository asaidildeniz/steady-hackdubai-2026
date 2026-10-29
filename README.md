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
