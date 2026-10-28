# Product

<!-- impeccable:product-schema 1 -->

Source: docs/STEADY_BUILD_GUIDE.md sections 2, 3 and 7 only. No real people's names, student stories or personal data belong in this file.

## Platform

adaptive

## Users

Adult students (18 and over) who feel stressed or lonely. They open Steady in a hard moment, alone with their phone, and need something gentle that asks little of them.

The prototype is also opened by the team lead, a content reviewer (a mental wellness and relationship counsellor) and a mentor, by scanning a QR code in Expo Go.

## Product Purpose

Steady is a gentle support app for adult students. The prototype offers four things: a daily check-in, a one-minute breathing exercise, a list of trusted people (pastors and counsellors from churches), and a "Need help now" screen.

It is built for HACK2026 Dubai. Check-in 2 (Thu 29 Oct) needs the first tool working on a phone and the reviewer on board. The final presentation is in late November.

## Positioning

Support that stays on the phone and points to real people. No account, nothing leaves the device, and the trusted people are pastors and counsellors from local churches, not an app or a bot.

## Operating Context

- Opened in Expo Go on iOS and Android; no store release.
- All wording is a draft until the content reviewer approves it, and it lives in one editable content file (`src/content/content.json`) so the reviewer's changes never need code changes.
- The team's guiding question is "Whose pain have we listened to directly?"
- The team posts done, next and stuck daily, so a screen recording or screenshot of the working flow is the usual evidence.

## Capabilities and Constraints

1. Adults only. The age question appears on first launch. Under 18 sees a kind message and where to get help, then the flow ends. The answer is not stored.
2. No accounts, no login, no backend, no network calls of any kind.
3. Nothing leaves the phone: no analytics, no crash-reporting SDK, no remote fonts or images, no logging of user choices.
4. Never store mood choices, the "how do you feel now" answer, the age answer or any journal text. The only value saved on the device is `steady.welcomeSeen`.
5. No phone numbers, emergency numbers or helplines until the reviewer verifies them. Placeholders are visibly empty, never realistic fake numbers.
6. All wording lives in one editable content file.
7. A visible "Need help now" button on every screen after Home, always in the same place.
8. No dead ends: every screen has a way forward or back, and the under-18 screen explains where to get help.
9. No streaks, points, badges, push notifications, pop-ups or anything that creates pressure.
10. No treatment-style advice, no diagnosis words, no AI in this build.
11. Breathing works offline.

Out of scope for this build: short Christian readings, a private journal and an AI helper (longer vision only).

## Brand Commitments

- Name: Steady.
- Voice: honest, gentle, never preachy.
- Feel: warm, quiet, honest and gentle. Simple and calm matters more than fancy.

## Evidence on Hand

Nothing yet. There are no approved quotes, testimonials, student stories, verified contacts or verified numbers. Future work must not invent any of them.

## Product Principles

1. Ask for as little as possible: one main thing per screen, and no data collected beyond what the moment needs.
2. Privacy is the product: if a feature needs the network or stores a choice, it does not belong in this build.
3. Real people over features: the app's job is to steady someone and point them to a trusted person or real help.
4. Never pressure: no counting, rewarding or reminding.
5. Safe by default: anything unverified stays visibly pending and is never tappable.

## Accessibility & Inclusion

- Large text and large buttons; minimum tap target 56.
- Respect the system font size setting; never disable font scaling.
- Every button has an accessibility role and label.
- Honour the reduce-motion setting in the breathing screen.
- Never put the yellow accent as text on the off-white background (contrast too low).
- English only in v1.
