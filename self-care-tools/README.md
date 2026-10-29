# Steady: self-care tools (web demo)

A separate, self-contained web demo of three short self-care tools for students. It sits next to the Expo app in this repo and shares no code, config or dependencies with it, so nothing outside this folder is affected.

- **Live demo:** https://steady-self-care.netlify.app
- **What each tool does and the research behind it:** [BRIEF.md](BRIEF.md)

| Tool | For | What it does |
|---|---|---|
| 01 Breathe | Stress and anxiety | Guided breathing with an animated circle: Gentle, Calming sigh or Box rhythm, 1–3 minutes |
| 02 Untangle | Overthinking | Six steps: step back from the thought, sort facts from guesses, see a friend's view, write a balanced thought, then pick one next step |
| 03 Reach Out | Loneliness | A 30-second self-compassion moment, then a ready-written message to someone that you can edit, copy or share |

## Run it

It's plain HTML, CSS and JavaScript, with no install and no build step.

```bash
npx http-server self-care-tools
```

You can also just open `index.html` in a browser.

## Privacy

There are no accounts, storage, analytics or network calls (only the Space Grotesk web font loads). Nothing anyone types is saved or sent anywhere.

## Differences from the Expo app's rules

This demo was built separately, so in two places it doesn't follow the main app's guide (`docs/STEADY_BUILD_GUIDE.md`):

- It uses **Google Fonts** (Space Grotesk) and its own Swiss-style palette.
- It is **not age-gated**.

If these tools are ever merged into the Expo app, its guide and hard rules take precedence.

## More docs in this folder

- `PRD.md`: requirements.
- `ARCHITECTURE.md`: how it's built.
- `DESIGN.md`: the design system.
- `TEST.md`: tests.
- `TODO.md` and `PLAN.md`: what's next.
- `DEPLOYMENT.md`: the Netlify deploy.
