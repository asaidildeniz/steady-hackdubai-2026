# Deployment — Steady demo

- **Live:** https://steady-self-care.netlify.app
- **Host:** Netlify, project `steady-self-care` (site ID `cff45845-c208-4906-9fa2-2ae53288ca7a`), on Abel's Netlify account (itmerc26@gmail.com, team "MIddle East Revival Church Website", which is the account's only team).
- **Dashboard:** https://app.netlify.com/projects/steady-self-care
- This is a manual CLI deploy with no Git continuous deployment, so committing does **not** update the live site.

## Deploy steps
1. Run the regression checklist in TEST.md, plus the pre-deploy checklist in the global standards.
2. Build the public folder. This copies only `index.html`, `_headers`, `css/` and `js/` into `dist/`, so no `.md` docs ship:
   ```bash
   sh build.sh
   ```
3. Deploy (the folder is already linked through `.netlify/state.json`, which is gitignored):
   ```bash
   netlify deploy --prod --dir dist --no-build --message "what changed"
   ```
4. Open the live URL and check all three tools. Then confirm a doc URL such as `/PRD.md` returns 404.

## Security headers
`_headers` is copied into `dist/` and applied by Netlify:
- **Content-Security-Policy:**
  - Scripts: own origin only, with no inline scripts. This is why `Steady.start()` lives in `js/start.js`.
  - Styles: own origin plus Google Fonts.
  - `connect-src 'none'`: the page cannot send data anywhere.
  - `frame-ancestors 'none'`.
- **Other headers:** `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (camera, microphone and geolocation off), and HSTS.

If you add a new external resource, update the CSP or it will be blocked.
