# Steady — self-care tools demo

- Working directory: `C:\Hack\steady` (git repo, branch `main`, no remote yet).
- Static site with no build step. Preview with `npx http-server C:\Hack\steady` (config is in `C:\Hack\.claude\launch.json`).
- Scope is locked to three tools (Breathe, Untangle, Reach Out). Abel cut everything else on 2026-10-27. See PRD non-goals.
- Never add storage, analytics, or network calls without a privacy review (PRD R1).
- Live at https://steady-self-care.netlify.app (Netlify, manual CLI deploy). Deploy with `sh build.sh` and then `netlify deploy --prod --dir dist --no-build`. See DEPLOYMENT.md. Committing does not deploy.
- `_headers` sets a strict CSP (no inline scripts, `connect-src 'none'`). New external resources must be added to it.

| File | What |
|---|---|
| `js/app.js` | Router, menu, and shared helpers |
| `js/breathe.js`, `js/untangle.js`, `js/reachout.js` | The three tools; their content is in arrays at the top of each file |
| `css/styles.css` | All styles and tokens (see DESIGN.md) |
