/* Steady — shell: router, menu, shared helpers. No data leaves the page. */
(function () {
  "use strict";

  const tools = {};
  let current = null;

  // Hand-drawn line doodles (stroke = currentColor, ".fill" = tool accent).
  const S = 'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
  const doodles = {
    breathe: `<svg viewBox="0 0 160 200" ${S}>
      <circle class="fill" cx="80" cy="62" r="17" stroke="none"/>
      <path d="M80 45c-10-22 6-34 13-24 6 9-4 20-13 24z"/>
      <path d="M95 55c18-14 34-2 27 9-6 9-19 4-27-9z"/>
      <path d="M94 74c22 3 24 22 12 25-10 2-15-11-12-25z"/>
      <path d="M76 79c-6 21-25 23-26 11-1-10 13-14 26-11z"/>
      <path d="M64 61c-21-6-22-25-10-26 10-1 15 13 10 26z"/>
      <circle cx="80" cy="62" r="7"/>
      <path d="M81 80c-3 30 4 62-2 110"/>
      <path d="M80 128c-16-14-34-10-38-2 12 6 26 8 38 2z"/>
      <path d="M81 150c14-14 32-12 36-4-12 6-25 8-36 4z"/>
      <path d="M30 30l-8-8M136 24l9-9M142 92l12 2M18 92l-10 3"/>
    </svg>`,
    untangle: `<svg viewBox="0 0 160 200" ${S}>
      <path class="fill" stroke="none" d="M30 40c30-18 70-10 82 10s-8 44-38 46-58-22-44-56z"/>
      <path d="M24 70c6-34 50-44 70-26 18 16-4 40-24 34-22-6-6-40 22-38 30 2 40 30 22 44-20 15-48-2-36-20 10-14 34-6 30 10"/>
      <path d="M88 82c6 18 4 34-6 52"/>
      <path d="M82 134c-4 12-2 26 4 40"/>
      <path d="M72 162l14 14 14-16"/>
      <path d="M128 112l10-4M128 126h12M30 120l-10-2"/>
    </svg>`,
    reach: `<svg viewBox="0 0 160 200" ${S}>
      <path class="fill" stroke="none" d="M20 34h74c6 0 10 4 10 10v38c0 6-4 10-10 10H50l-18 16 2-16H20c-6 0-10-4-10-10V44c0-6 4-10 10-10z"/>
      <path d="M18 32c22-2 52 0 76 1 8 0 12 5 12 12l-1 36c0 7-5 11-12 11H52l-20 17 3-17H19c-7 0-11-5-11-12l1-36c0-7 3-11 9-12z"/>
      <path d="M34 56c10-2 30-2 48-1M34 70c10 0 22 0 32-1"/>
      <path d="M96 118c16-2 36-1 50 1 6 1 8 5 8 10l-1 26c0 5-4 8-9 8h-6l2 14-16-14h-28c-6 0-9-4-9-9l1-27c0-5 3-8 8-9z"/>
      <path d="M116 138c3-5 10-4 10 2 0-6 8-7 10-2 2 7-10 13-10 16 0-3-12-9-10-16z"/>
      <path d="M58 132l-10 8M50 120l-14-2M64 150l-6 12"/>
    </svg>`,
    hero: `<svg viewBox="0 0 220 240" ${S}>
      <circle class="fill" cx="150" cy="70" r="40" stroke="none"/>
      <circle cx="150" cy="70" r="22"/>
      <path d="M150 34v-14M150 120v-14M114 70h-14M200 70h-14M124 44l-10-10M176 96l10 10M124 96l-10 10M176 44l10-10"/>
      <path d="M60 120c-12-24 6-38 16-28 8 8-2 22-16 28z"/>
      <path d="M62 122c18-12 34 2 26 12-7 8-20 2-26-12z"/>
      <path d="M58 124c-6 18-24 20-26 8-1-9 12-14 26-8z"/>
      <path d="M60 128c4 34-2 60 6 100"/>
      <path d="M64 180c14-12 30-8 32 0-10 6-22 6-32 0z"/>
      <path d="M20 60l14 6M30 34l10 12M150 160c10 2 20 10 22 22M176 150c10 6 16 16 16 28"/>
    </svg>`
  };

  const cards = [
    { id: "breathe", route: "breathe", num: "01", title: "Breathe", for: "Stress & anxiety", time: "1–3 min",
      desc: "Follow a calm, guided breathing rhythm." },
    { id: "untangle", route: "untangle", num: "02", title: "Untangle", for: "Overthinking", time: "2–3 min",
      desc: "Step back from a heavy thought and find one next step." },
    { id: "reach", route: "reach-out", num: "03", title: "Reach Out", for: "Loneliness", time: "1–2 min",
      desc: "A moment of kindness, then a message you can send." }
  ];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  let toastTimer;
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // Fallback for file:// or older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (_) { toast("Couldn't copy, so please select the text instead"); ta.remove(); return false; }
      ta.remove();
    }
    toast("Copied");
    return true;
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function renderMenu(root) {
    document.body.dataset.tool = "menu";
    root.innerHTML = `
      <div class="wrap view">
        <section class="hero">
          <span class="label">Steady — Self-care tools</span>
          <h1>A little space to breathe.</h1>
          <p class="muted">Three short tools for three different moments. Pick the one that fits right now.</p>
          <div class="doodle" aria-hidden="true">${doodles.hero}</div>
        </section>
        <div class="index-head label" aria-hidden="true">
          <span>No.</span><span>Tool</span><span class="h-for">For</span><span style="text-align:right">Time</span>
        </div>
        <nav class="tool-list" aria-label="Tools">
          ${cards.map(c => `
            <a class="tool-row row-${c.id}" href="#/${c.route}">
              <span class="num">${c.num}</span>
              <h2>${c.title}</h2>
              <span class="meta">
                <span class="for">${c.for}</span>
                <p>${c.desc}</p>
              </span>
              <span class="end">
                <span class="time label">${c.time}</span>
                <span class="go" aria-hidden="true">→</span>
              </span>
            </a>`).join("")}
        </nav>
        <section class="colophon">
          <div><p class="small muted" style="margin:0">Each tool takes a few minutes. You can stop at any point, and nothing you type is stored.</p></div>
          <div class="swatches" aria-hidden="true"><i style="background:var(--breathe)"></i><i style="background:var(--untangle)"></i><i style="background:var(--reach)"></i></div>
        </section>
      </div>`;
  }

  function renderToolFrame(root, card) {
    root.innerHTML = `
      <div class="wrap">
        <div class="tool">
          <aside class="tool-side">
            <span class="num">${card.num}</span>
            <span class="t-name">${card.title}</span>
            <span class="t-for label">${card.for} · ${card.time}</span>
            <div class="doodle" aria-hidden="true">${doodles[card.id]}</div>
          </aside>
          <div class="tool-main" id="tool-main"></div>
        </div>
      </div>`;
    return root.querySelector("#tool-main");
  }

  function route() {
    const root = document.getElementById("app");
    const path = (location.hash.replace(/^#\/?/, "") || "").split("?")[0];
    if (current && current.unmount) current.unmount();
    current = null;

    const tool = tools[path];
    document.getElementById("exit-link").hidden = !tool;
    if (tool) {
      document.body.dataset.tool = tool.theme;
      current = tool;
      tool.mount(renderToolFrame(root, cards.find(c => c.route === path)));
    } else {
      renderMenu(root);
    }
    window.scrollTo(0, 0);
    root.focus({ preventScroll: true });
  }

  window.Steady = {
    register(route, tool) { tools[route] = tool; },
    start() {
      window.addEventListener("hashchange", route);
      route();
    },
    esc, toast, copy, prefersReducedMotion
  };
})();
