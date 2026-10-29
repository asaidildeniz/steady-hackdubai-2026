# TODO — Steady demo

## 🔴 Your Action Required
1. Run the `[User]` tests in TEST.md on your own phone (about 5 minutes).
2. Share the live link: https://steady-self-care.netlify.app (BRIEF.md has the one-page explainer of the tools and research).
3. Have the mentor/counsellor review all tool wording before showing it to students.

## 🐞 Errors / Bugs
_None open._

## 🟡 Next Up
- Redeploy after any change: commits do not update the live site (see DEPLOYMENT.md).

## 🔵 Nice-to-Have / Later
- Optional voice guidance or audio for Breathe.
- Add a 5-4-3-2-1 grounding tool.
- Offline support via a service worker (PWA).
- Self-host the fonts so it doesn't depend on Google Fonts.

## ✅ Completed
- 2026-10-27: Deployed to Netlify at https://steady-self-care.netlify.app with security headers (strict CSP, no outbound connections). Only the public files ship; the docs stay private. Added BRIEF.md, a one-page explainer of each tool and its research basis.
- 2026-10-27: Restyled to a Swiss grid layout using the brand reference: Space Grotesk, blue/cream, sky/neon/orange accents per tool, numbered index menu, and hand-drawn SVG doodles.
- 2026-10-27: Fixed the focus outline showing on headings that receive programmatic focus. Fixed the menu time column wrapping under the number on mobile.
- 2026-10-27: Wrote the PRD, built the menu and all three tools, and set up light/dark, mobile, and reduced-motion support.
- 2026-10-27: Fixed the "All tools" link showing on the menu (the `hidden` attribute was overridden by `.btn` display).
- 2026-10-27: Fixed low contrast on the orb label in dark mode (it now uses dark text on the light orb).
