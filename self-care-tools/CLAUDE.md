# Steady — self-care tools demo

- Working directory: `C:\Hack\steady` (git repo, branch `main`, no remote yet).
- Static site with no build step. Preview with `npx http-server C:\Hack\steady` (config is in `C:\Hack\.claude\launch.json`).
- Scope: four tools. Breathe, Untangle and Reach Out (Abel cut everything else on 2026-10-27, see PRD non-goals), plus Walk through it, added at the developer's request on 2026-11-19. It walks through three team readings (worry, feeling down, faith or doubt) and its faith steps are optional questions.
- Never add storage, analytics, or network calls without a privacy review (PRD R1).
- Live at https://steady-self-care.netlify.app (Netlify, manual CLI deploy). Deploy with `sh build.sh` and then `netlify deploy --prod --dir dist --no-build`. See DEPLOYMENT.md. Committing does not deploy.
- `_headers` sets a strict CSP (no inline scripts, `connect-src 'none'`). New external resources must be added to it.

| File | What |
|---|---|
| `js/app.js` | Router, menu, and shared helpers |
| `js/breathe.js`, `js/untangle.js`, `js/reachout.js` | The first three tools; their content is in arrays at the top of each file |
| `js/stories.js`, `js/stories-content.js` | Walk through it; all its wording and paths are in `stories-content.js` (keep the crisis list in step with `src/content/content.json`) |
| `walkthroughs/` | Team review page for the same paths, with a live path map (`/walkthroughs/`) |
| `css/styles.css` | All styles and tokens (see DESIGN.md) |
