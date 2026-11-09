# Steady (HACK2026 Dubai)
Expo + TypeScript + Expo Router prototype for a gentle student well-being app. Full brief: docs/STEADY_BUILD_GUIDE.md.

Hard rules: adults only (18+), no accounts, no network calls, no analytics, nothing leaves the phone.
Only persisted value is the AsyncStorage key steady.welcomeSeen. Never store mood, age answer or any text.
All wording, moods, contacts and helplines live in src/content/content.json (reviewer edits it, not code).
Never show an unverified or empty phone number as tappable, and never invent realistic numbers.
No Need help now pill (developer's v3 design decision, 2026-11-05); the Need help now screen stays reachable from typed crisis phrases, "I don't feel safe right now" on Home and the Reach Out emergency line. Breathing must work offline.
No streaks, points, badges, push notifications or pop-ups. Tone: honest, gentle, never preachy.
Do not add dependencies beyond the guide without asking.
Exception: test devDependencies jest, jest-expo, @types/jest, @testing-library/react-native.
Approved by the developer (2026-10-29): expo-keep-awake, used only on the Breathing screen.
Approved by the developer (2026-11): react-native-executorch, react-native-blob-util, react-native-worklets, expo-asset, expo-dev-client, expo-build-properties (on-phone matching model); react-native-svg and expo-font with bundled DM Sans (v3 design); @shopify/react-native-skia and react-native-reanimated for the water-orb shader (Steady's own SkSL, no third-party shader code).
No real student stories or personal data in any file (PRODUCT.md, specs and plans included).

## Tools (the guide and hard rules always win; flag any plugin conflict, then follow the guide)
- Superpowers: the guide is the approved design, no open-ended brainstorming. Check each phase against sections 9-10, write a short plan, execute, stop for review after every phase. Plain git branch per phase, no worktrees, no visual companion.
- Ponytail (default): reuse React Native/Expo first, small components. Never remove content.json, the verified-number gate, accessibility labels or offline behaviour.
- Tests: write them first (red, then green) only where a mistake hurts: mood-group routing, age gate, storage writes only steady.welcomeSeen, empty/unverified numbers never tappable. No layout or styling tests.
- UI UX Pro Max: design-system/steady/MASTER.md is for spacing, touch targets, accessibility and anti-patterns only. Palette and type come from the developer's v3 screens (src/theme.ts): DM Sans bundled in assets/fonts, never downloaded at runtime; tone from guide section 7.
- Impeccable: review only. Allowed: critique, audit, clarify, harden, distill, quieter, polish. Never bolder, delight, colorize, animate or overdrive.
- Impeccable product facts come only from guide sections 2, 3 and 7. DM Sans is bundled on purpose (offline). Its detector targets web CSS, so its findings here are advice only.
