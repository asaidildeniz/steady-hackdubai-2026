/* Steady — shell: router, home, Need help now, Talk to someone, shared helpers. No data leaves the page.
   The look follows the Expo app's v3 screens: a round back button top left, "Need help now" top right. */
(function () {
  "use strict";

  const tools = {};
  let current = null;

  // The app's line icons (src/components/Icon.tsx).
  const P = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    drop: `<svg viewBox="0 0 24 24" aria-hidden="true"><path ${P} d="M12 3 C12 3 5.5 10.5 5.5 14.5 a6.5 6.5 0 0 0 13 0 C18.5 10.5 12 3 12 3 Z"/></svg>`,
    wave: `<svg viewBox="0 0 24 24" aria-hidden="true"><path ${P} d="M3 14 C5.5 9 7.5 9 9.5 13 S13.5 17 15.5 12 S19.5 8 21 11"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path ${P} d="M12 20 C12 20 4 15 4 9.5 A4 4 0 0 1 12 7.5 A4 4 0 0 1 20 9.5 C20 15 12 20 12 20 Z"/></svg>`,
    read: `<svg viewBox="0 0 24 24" aria-hidden="true"><path ${P} d="M4 6 C7 5 10 5.5 12 7 C14 5.5 17 5 20 6 V18 C17 17 14 17.5 12 19 C10 17.5 7 17 4 18 Z M12 7 V19"/></svg>`,
    back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14.5 5 L8 12 L14.5 19"/></svg>`
  };

  const cards = [
    { id: "breathe", route: "breathe", icon: "drop", title: "Breathe", for: "Stress & anxiety · 1–3 min",
      desc: "Slow your breath with a gentle, guided rhythm." },
    { id: "untangle", route: "untangle", icon: "wave", title: "Untangle", for: "Overthinking · 2–3 min",
      desc: "Step back from a heavy thought and find one next step." },
    { id: "reach", route: "reach-out", icon: "heart", title: "Reach Out", for: "Loneliness · 1–2 min",
      desc: "A moment of kindness, then help with the words to message someone." },
    { id: "stories", route: "stories", icon: "read", title: "Walk through it", for: "Worry, low days, doubt · 3–5 min",
      desc: "Short steps through a reading, shaped by what you choose." }
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

  // Top bar: the wordmark on Home; elsewhere a round back button and the screen's name. Need help now on every screen but its own.
  function topbar({ back, title, help = true }) {
    document.getElementById("brand").hidden = !!back;
    document.getElementById("back-btn").hidden = !back;
    const t = document.getElementById("top-title");
    t.textContent = title || "";
    t.hidden = !back;
    document.getElementById("help-link").hidden = !help;
  }

  let sessionHasHistory = false; // true once the person has moved inside the demo, so Back can step back

  function renderMenu(root) {
    document.body.dataset.tool = "menu";
    topbar({});
    root.innerHTML = `
      <div class="wrap view">
        <section class="hero">
          <span class="label">Self-care tools · Demo</span>
          <h1>A little space to breathe.</h1>
          <p>Four short tools for different moments. Pick the one that fits right now.</p>
        </section>
        <nav class="tool-list" aria-label="Tools">
          ${cards.map(c => `
            <a class="tool-row row-${c.id}" href="#/${c.route}">
              <span class="icon">${icons[c.icon]}</span>
              <h2>${c.title}</h2>
              <span class="meta">
                <p>${c.desc}</p>
                <span class="for">${c.for}</span>
              </span>
            </a>`).join("")}
        </nav>
        <div class="btn-row"><a class="btn btn-ghost" href="#/need-help">I don't feel safe right now</a></div>
        <section class="colophon">
          <p class="small muted" style="margin:0">Each tool takes a few minutes. You can stop at any point, and nothing you type is stored.</p>
        </section>
      </div>`;
  }

  function renderToolFrame(root, card) {
    topbar({ back: true, title: card.title });
    root.innerHTML = `
      <div class="wrap">
        <div class="tool"><div class="tool-main" id="tool-main"></div></div>
      </div>`;
    return root.querySelector("#tool-main");
  }

  // Need help now (the app's S9). Only verified numbers are shown. In this demo a call button never dials.
  function renderHelp(root) {
    const h = window.SteadyHelp.needHelp;
    document.body.dataset.tool = "menu";
    topbar({ back: true, title: "", help: false });
    root.innerHTML = `
      <div class="wrap view"><section class="panel tool">
        <h1>${esc(h.title)}</h1>
        <p>${esc(h.message)}</p>
        ${h.emergency.length ? `<p class="group-head">${esc(h.emergencyHeading)}</p>
        <div class="cards">${h.emergency.map(e => `
          <button class="help-card" data-number="${esc(e.number)}" aria-label="Call ${esc(e.label)}, ${esc(e.number.split("").join(" "))}">
            <span class="txt"><strong>${esc(e.label)}</strong>${e.when ? `<span class="when">${esc(e.when.charAt(0).toUpperCase() + e.when.slice(1))}</span>` : ""}</span>
            <span class="call-pill">${esc(e.number)}</span>
          </button>`).join("")}</div>` : `<p class="note-box">${esc(h.pending)}</p>`}
        <p class="note-box" id="call-note" role="status" hidden></p>
        <div class="btn-row">
          <a class="btn btn-ghost" href="#/talk">Talk to someone</a>
          <a class="btn btn-ghost" href="#/">Home</a>
        </div>
      </section></div>`;
    root.querySelectorAll("[data-number]").forEach(b => b.onclick = () => demoCall(root, b.dataset.number));
  }

  function demoCall(root, number) {
    const n = root.querySelector("#call-note");
    n.textContent = `${window.SteadyHelp.callNote} The number is ${number}.`;
    n.hidden = false;
  }

  // Talk to someone: the trusted people straight away, with Call and Message. Unverified numbers are never tappable.
  function renderTalk(root) {
    const t = window.SteadyHelp.talk;
    document.body.dataset.tool = "reach";
    topbar({ back: true, title: "" });
    root.innerHTML = `
      <div class="wrap view"><section class="panel tool">
        <span class="tag">Talk to someone</span>
        <h1>Someone can listen.</h1>
        <p class="muted">${esc(t.note)}</p>
        <div class="cards">${t.contacts.map(p => {
          const ok = p.phone && p.tappable;
          return `
          <div class="person">
            <h3>${esc(p.name)}</h3>
            <span class="role">${esc(t.roles[p.role] || p.role)} · ${esc(p.church)}</span>
            <span class="small"><strong>${esc(t.canHelpWith)}:</strong> ${esc(p.canHelpWith)}</span>
            <span class="small muted"><strong>${esc(t.cannotHelpWith)}:</strong> ${esc(p.cannotHelpWith)}</span>
            ${ok ? `<span class="small muted">${esc(p.phone)}</span>` : `<span class="small muted">${esc(t.pending)}</span>`}
            <div class="row2">
              <button class="btn" data-call="${ok ? esc(p.phone) : ""}" ${ok ? "" : "disabled"}>${esc(t.call)}</button>
              <button class="btn btn-ghost" data-call="${ok ? esc(p.phone) : ""}" ${ok ? "" : "disabled"}>${esc(t.message)}</button>
            </div>
          </div>`; }).join("")}</div>
        <p class="note-box" id="call-note" role="status" hidden></p>
        <div class="btn-row">
          <a class="btn btn-ghost" href="#/reach-out">Help me find the words</a>
          <a class="btn btn-ghost" href="#/need-help">I need help now</a>
        </div>
      </section></div>`;
    root.querySelectorAll("[data-call]").forEach(b => b.onclick = () => { if (b.dataset.call) demoCall(root, b.dataset.call); });
  }

  const pages = { "need-help": renderHelp, "talk": renderTalk };

  function route() {
    const root = document.getElementById("app");
    const path = (location.hash.replace(/^#\/?/, "") || "").split("?")[0];
    if (current && current.unmount) current.unmount(path);
    current = null;

    const tool = tools[path];
    if (tool) {
      document.body.dataset.tool = tool.theme;
      current = tool;
      tool.mount(renderToolFrame(root, cards.find(c => c.route === path)));
    } else if (pages[path]) {
      pages[path](root);
    } else {
      renderMenu(root);
    }
    window.scrollTo(0, 0);
    root.focus({ preventScroll: true });
  }

  window.Steady = {
    register(route, tool) { tools[route] = tool; },
    start() {
      document.getElementById("back-btn").innerHTML = icons.back;
      document.getElementById("back-btn").onclick = () => (sessionHasHistory ? history.back() : (location.hash = "#/"));
      window.addEventListener("hashchange", () => { sessionHasHistory = true; route(); });
      route();
    },
    esc, toast, copy, prefersReducedMotion, icons
  };
})();
