---
name: Steady
description: A gentle support app for adult students. Calm, quiet, nothing leaves the phone.
colors:
  warm-off-white: "#F5F2ED"
  ink: "#121212"
  quiet-grey: "#6B6B6B"
  soft-yellow: "#EFE56F"
typography:
  headline:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "32"
    fontWeight: 700
  title:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "24"
    fontWeight: 600
  body:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "20"
    fontWeight: 400
  label:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "20"
    fontWeight: 700
rounded:
  button: "16"
  pill: "28"
spacing:
  gap: "16"
  screen: "24"
components:
  button-primary:
    backgroundColor: "{colors.soft-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    height: "56"
  button-secondary:
    backgroundColor: "{colors.warm-off-white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    height: "56"
  button-disabled:
    backgroundColor: "{colors.warm-off-white}"
    textColor: "{colors.quiet-grey}"
    rounded: "{rounded.button}"
    height: "56"
  need-help-pill:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.warm-off-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "56"
---

# Design System: Steady

Source of truth in code: `src/theme.ts` (tokens) and `src/components/` (Screen, BigButton, NeedHelpButton). Values are React Native points, not CSS pixels. Palette and type come from docs/STEADY_BUILD_GUIDE.md section 7.

## Overview

**Creative North Star: "The Quiet Room"**

Steady is a calm, uncluttered space a stressed student can step into. Each screen does one main thing, with plenty of space, large text and large buttons. Nothing moves, counts, rewards or asks for attention unless it helps the person in that moment. Simple and calm matters more than fancy.

The tone is warm, quiet, honest and gentle. The only loud element is the dark "Need help now" pill, and it is loud on purpose: always in the same place, never hidden.

**Key Characteristics:**
- Off-white page, dark text, one soft yellow accent.
- One main thing per screen.
- Large type and 56pt minimum tap targets.
- System font, flat surfaces, no decoration.

## Colors

One warm neutral page, one ink, one accent. No other colours.

### Primary
- **Soft Yellow** (#EFE56F): button fills only, always with Ink text on top.

### Neutral
- **Warm Off-White** (#F5F2ED): the background of every screen, and the text colour on the Need help pill.
- **Ink** (#121212): all text, and the fill of the Need help pill.
- **Quiet Grey** (#6B6B6B): small notes and disabled states.

### Named Rules
**The One Accent Rule.** Soft Yellow is the only accent, and it is used as a button fill only. Do not add more colours, tints or gradients. Each screen or card has at most one yellow button; other actions use the secondary style.

**The No Yellow Text Rule.** Never put Soft Yellow text on Warm Off-White; the contrast is too low.

**The Light Only Rule.** The app is locked to light appearance (`userInterfaceStyle: "light"`) because the guide defines a single palette. A dark theme is out of scope for this build.

## Typography

**Font:** the system font (SF Pro on iOS, Roboto on Android). No custom or downloaded fonts.

**Why the system font is deliberate:** Steady must work fully offline and load nothing from the network, so there is nothing to download. Generic "avoid system fonts" advice from Impeccable does not apply here. Keep the system font.

### Hierarchy
- **Headline** (700, 32): one per screen, marked `accessibilityRole="header"`.
- **Title** (600, 24): the heading of a card, such as a contact's name, also marked as a header. One step lighter than the Headline so a list of cards never outweighs the page title.
- **Body** (400, 20): messages and prompts.
- **Label** (700, 20): button text.

### Named Rules
**The Scaling Rule.** Respect the system text size. Never set `allowFontScaling={false}` or cap font scaling. Layouts must grow and scroll rather than clip.

## Layout

- Screen padding 24, gap between items 16.
- `Screen` wraps every page: safe-area insets, off-white background, and a scrolling content area so very large text never clips.
- The Need help pill sits in its own row at the top right, outside the scrolling area. It reserves its own space, so it never covers content and stays in the same place on every screen after Home. It is off on Welcome, Adults only and Need help now.
- Buttons are full width and stack vertically.

## Elevation & Depth

Flat. No shadows, blurs or layered cards. Hierarchy comes from size, weight and the single accent.

## Shapes

Buttons have 16-point rounded corners. The Need help pill is fully rounded. Secondary buttons drop the fill and show a 1.5-point Ink outline. Disabled buttons drop the fill and show a thin Quiet Grey outline.

## Components

- **BigButton:** Soft Yellow fill, Ink label, at least 56 high, full width. Pressed state is a slight opacity change only. `secondary` is outlined in Ink with no fill. Disabled is outlined with Quiet Grey text and carries an `accessibilityHint` saying why. Every instance has `accessibilityRole="button"` and an `accessibilityLabel`.
- **Contact card (S8):** name as a Title header, role and church as a note, can-help and cannot-help in one block, then Call (primary) and Message (secondary). Cards are separated by space (48), not dividers.
- **NeedHelpButton:** Ink pill with Warm Off-White label, at least 56 high, goes to `/need-help`. Label and hint come from `content.json`.
- **Screen:** the page wrapper described under Layout, with a `showNeedHelp` prop.

All wording comes from `src/content/content.json`. Components never hard-code text.

## Do's and Don'ts

**Do**
- Keep one main thing per screen.
- Show unverified or empty phone numbers as visibly pending and never tappable.
- Honour reduce motion: the breathing screen falls back to text and a countdown.

**Don't**
- No streaks, points, badges, push notifications, pop-ups or modals.
- No icons as decoration, no emojis, no images loaded from the network.
- No motion beyond the breathing circle.
- No Google Fonts or other remote fonts.

## Notes for Impeccable

- Allowed review commands: critique, audit, clarify, harden, distill, quieter, polish. Never bolder, delight, colorize, animate or overdrive.
- The Impeccable detector is written for web CSS. On these React Native screens its findings are advice only, never binding.
- `design-system/steady/MASTER.md` (UI UX Pro Max) is advisory for spacing, touch targets and accessibility only. This file and the build guide win.
