// Builds the browser demo as one self-contained page: dist-web-demo/steady.html
// Run: npm run web:demo
//
// The page holds the whole app (code, DM Sans and images inlined), so it can be opened from any static
// host or shared as a single file, and it never loads anything from another site.
// The on-phone model does not run in a browser, so the page leaves it out and typed text uses keywords only.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'dist-web-demo');
const exportDir = path.join(out, 'export');

// The model files are bundled by name, so the build needs them to exist. If they haven't been fetched,
// use empty stand-ins for the build only and remove them again afterwards.
const models = ['all-minilm-l6-v2.pte', 'all-minilm-l6-v2-tokenizer.tok'].map((f) => path.join(root, 'assets/models', f));
const standIns = models.filter((f) => !fs.existsSync(f));
fs.mkdirSync(path.join(root, 'assets/models'), { recursive: true });
standIns.forEach((f) => fs.writeFileSync(f, ''));

try {
  fs.rmSync(out, { recursive: true, force: true });
  execSync(`npx expo export --platform web --output-dir "${exportDir}"`, { cwd: root, stdio: 'inherit', env: { ...process.env, CI: '1' } });
} finally {
  standIns.forEach((f) => fs.rmSync(f, { force: true }));
}

const jsDir = path.join(exportDir, '_expo/static/js/web');
const bundles = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'));
if (bundles.length !== 1) throw new Error(`Expected one web bundle, found ${bundles.length}. Is asyncRoutes off in app.json?`);
let js = fs.readFileSync(path.join(jsDir, bundles[0]), 'utf8');

// Inline every asset the bundle points to. The model is never inlined: it isn't used on the web, and the real one is 90 MB.
const types = { ttf: 'font/ttf', otf: 'font/otf', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml' };
for (const ref of new Set(js.match(/"\/assets\/[^"]+"/g) || [])) {
  const url = ref.slice(1, -1);
  const ext = url.split('.').pop();
  const file = path.join(exportDir, url);
  const data = types[ext] && fs.existsSync(file) ? `data:${types[ext]};base64,${fs.readFileSync(file).toString('base64')}` : 'data:,';
  js = js.split(ref).join(`"${data}"`);
}
js = js.replace(/<\/script/gi, '<\\/script');

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Steady</title>
<style>
html, body { height: 100%; margin: 0; }
body { overflow: hidden; background: #F8F4EE; }
#root { display: flex; height: 100%; flex: 1; }
</style>
</head>
<body>
<noscript>Steady needs JavaScript to run.</noscript>
<div id="root"></div>
<script>
// Start at the app's first screen whatever address the page is served from.
try { history.replaceState(null, '', '/'); } catch (e) {}
</script>
<script>
${js}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(out, 'steady.html'), page);
fs.rmSync(exportDir, { recursive: true, force: true });
console.log(`\nBuilt dist-web-demo/steady.html (${Math.round(page.length / 1024)} KB)`);
