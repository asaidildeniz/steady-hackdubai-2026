# Architecture — Steady self-care tools demo

## What it is
A static, client-only web app with three self-care tools (Breathe, Untangle, Reach Out)
and a simple menu. There's no backend, no build step, no dependencies, no storage, and no analytics.

## Stack
- Plain HTML, CSS, and vanilla JS (classic scripts, not ES modules, so it also opens via `file://`).
- Google Fonts (Space Grotesk). It falls back to Helvetica/Arial when offline.

## Files
| Path | Role |
|---|---|
| `index.html` | The shell: header, `<main id="app">`, footer disclaimer, toast, and script tags |
| `css/styles.css` | Design tokens (light and dark), layout, components, and per-tool accents via `body[data-tool]` |
| `js/app.js` | `window.Steady`: hash router, Swiss index menu, tool frame (numbered side column and doodle), SVG doodles, and helpers (`esc`, `copy`, `toast`, `prefersReducedMotion`) |
| `js/breathe.js` | Breathe tool: patterns, orb animation timer, pause/resume, and finish check |
| `js/untangle.js` | Untangle: a six-step wizard state machine and summary card |
| `js/reachout.js` | Reach Out: the self-compassion moment, needs, message templates, and copy/share |
| `js/start.js` | Calls `Steady.start()` after all tools register. It's a separate file so the CSP needs no inline script |
| `_headers` | Netlify security headers (CSP and others) |
| `build.sh` | Copies the public files into `dist/` for deploy, so the docs never ship |

## How it fits together
- Routes: `#/` (menu), `#/breathe`, `#/untangle`, `#/reach-out`.
- Each tool calls `Steady.register(route, { theme, mount(el), unmount() })`.
  - The router calls `unmount()` on the previous tool, which clears timers.
  - It then renders the tool frame (side column and `#tool-main`) and calls `mount(#tool-main)`.
  - `theme` sets `body[data-tool]`, which swaps the `--accent` colour.
- All state lives in memory inside each tool's closure and is lost on navigation or reload, which is intentional for privacy.
- User text is always escaped with `Steady.esc` before it's inserted into HTML.
- Breathe drives the orb with a CSS `transform` transition whose duration equals each phase's length.
  A 1-second interval counts down, and a session only ends at the end of a full breath cycle.

## Running locally
- `npx http-server C:\Hack\steady`, or double-click `index.html`.
- `.claude/launch.json` in `C:\Hack` holds the preview config.

## Hosting
- Netlify static hosting at https://steady-self-care.netlify.app, deployed manually from `dist/`. See DEPLOYMENT.md.

## Constraints and notes
- `navigator.clipboard` needs a secure context (https or localhost). There's an `execCommand` fallback for `file://`.
- The Share button only appears where `navigator.share` exists, mostly on phones.
- Vibration only works on Android Chrome; the option is hidden where it isn't supported.
