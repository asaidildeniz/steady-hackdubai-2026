/* Walk through it — three team readings as short branching steps (worry, feeling down, faith or doubt).
   The wording lives in js/stories-content.js. Everything is held in memory only: nothing is stored or sent,
   and a reload starts fresh. */
(function () {
  "use strict";
  const { esc, copy } = Steady;
  const { STORIES, isCrisis } = window.SteadyStories;

  const intro = {
    worry: "When your mind keeps going round",
    down: "When everything takes more effort",
    faith: "When God feels distant"
  };
  // Hand-offs open the real tools on this site.
  const TOOLS = {
    breathe: { name: "Breathe", route: "breathe" },
    untangle: { name: "Untangle", route: "untangle" },
    reach: { name: "Reach Out", route: "reach-out" }
  };

  let root, timers = [];
  // Kept across a hand-off to another tool so the person can pick up where they were. Memory only.
  let s = null, resume = null;

  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const story = () => STORIES[s.story];
  const isHelp = to => to === "@help";

  function focusHeading() {
    const h = root.querySelector("h2");
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }

  function startStory(id) {
    s = { story: id, cur: STORIES[id].start, history: [], typed: "", draft: "" };
    render();
  }

  function go(id) {
    clearTimers();
    s.history.push(s.cur);
    s.cur = id;
    render();
  }

  function back() {
    clearTimers();
    if (s.history.length) { s.cur = s.history.pop(); render(); } else renderChooser();
  }

  function follow(to) {
    if (to === "@home") { s = null; resume = null; location.hash = "#/"; return; }
    if (isHelp(to)) return go("@help");
    const m = to.match(/^@(untangle|reach|breathe):(.+)$/);
    if (m) {
      clearTimers();
      resume = m[2] === "@home" ? null : { ...s, history: [...s.history, s.cur], cur: m[2] };
      location.hash = "#/" + TOOLS[m[1]].route;
      return;
    }
    go(to);
  }

  function renderChooser() {
    clearTimers();
    s = null;
    root.innerHTML = `
      <section class="view panel">
        <span class="tag">Walk through it</span>
        <h2>Which feels closest right now?</h2>
        <p class="muted">A few short steps at a time. What you choose shapes the next step, and you can stop whenever you like.</p>
        <div class="choice-group">
          ${Object.entries(STORIES).map(([id, st]) => `
            <button class="choice" data-story="${id}"><strong>${esc(st.title)}</strong><span>${esc(intro[id])}</span></button>`).join("")}
        </div>
        <p class="small muted" style="margin-top:22px">Draft wording, not yet reviewed. Nothing you type is saved or sent anywhere.</p>
        <div class="btn-row"><a class="btn btn-link" href="#/">← All tools</a></div>
      </section>`;
    root.querySelectorAll("[data-story]").forEach(b => b.onclick = () => startStory(b.dataset.story));
    focusHeading();
  }

  function renderResume() {
    root.innerHTML = `
      <section class="view panel">
        <span class="tag">${esc(STORIES[resume.story].title)}</span>
        <h2>Welcome back.</h2>
        <p class="muted">Would you like to carry on where you left off?</p>
        <div class="btn-row">
          <button class="btn" id="carry">Carry on</button>
          <button class="btn btn-link" id="fresh">Choose again</button>
        </div>
      </section>`;
    root.querySelector("#carry").onclick = () => { s = resume; resume = null; render(); };
    root.querySelector("#fresh").onclick = () => { resume = null; renderChooser(); };
    focusHeading();
  }

  function head(beat) {
    const st = story(), i = st.beats.indexOf(beat);
    const step = i >= 0 ? `<span class="step-count">Step ${i + 1} of ${st.beats.length}</span>` : "";
    const dots = i >= 0 ? `<div class="dots" aria-hidden="true">${st.beats.map((_, j) => `<i class="${j <= i ? "on" : ""}"></i>`).join("")}</div>` : "";
    return `
      <div class="tool-head">
        <span class="tag">${esc(st.title)}${i >= 0 ? " · " + esc(beat) : ""}</span>
        ${beat === "Need help now" ? "" : `<button class="btn btn-link" id="help">Need help now</button>`}
      </div>
      <div class="story-progress">${dots}${step}</div>`;
  }

  // The first line is the heading when it is short; long reading sentences stay body text, a little larger.
  function lines(say) {
    const [first, ...rest] = say;
    const top = first.length <= 80 ? `<h2>${esc(first)}</h2>` : `<h2 class="visually-hidden">${esc(story().title)}</h2><p class="story-lead">${esc(first)}</p>`;
    return top + rest.map(t => `<p class="story-text">${esc(t)}</p>`).join("");
  }

  function footer() {
    return `
      <div class="btn-row spread">
        <button class="btn btn-link" id="back">← Back</button>
        <a class="btn btn-link" href="#/">All tools</a>
      </div>`;
  }

  function wire() {
    const h = root.querySelector("#help"); if (h) h.onclick = () => go("@help");
    root.querySelector("#back").onclick = back;
    focusHeading();
  }

  function renderHelp() {
    root.innerHTML = `
      <section class="view panel">
        ${head("Need help now")}
        <h2>You are not alone.</h2>
        <p class="story-text">If you are in danger or cannot keep yourself safe, contact emergency services now.</p>
        <p class="hint">Verified numbers will appear here once our reviewer has checked them.</p>
        <div class="btn-row"><a class="btn" href="#/reach-out">Talk to someone</a></div>
        ${footer()}
      </section>`;
    wire();
  }

  function render() {
    clearTimers();
    if (s.cur === "@help") return renderHelp();
    const n = story().nodes[s.cur];
    let body = "";
    if (n.verse) body += `<p class="hint"><strong>${esc(n.verse.ref)}</strong>${n.verse.quote ? `<br>“${esc(n.verse.quote)}”` : ""}</p>`;
    if (n.echo && s.typed) body += `<p class="hint">You wrote: “${esc(s.typed)}”</p>`;
    body += lines(n.say);

    let actions = "";
    if (n.copy) {
      body += `
        <div class="message-card">
          <label class="visually-hidden" for="story-msg">Message you could send</label>
          <textarea id="story-msg">${esc(n.copy)}</textarea>
        </div>
        <div class="btn-row" style="margin-top:12px"><button class="btn btn-ghost" id="copy">Copy message</button></div>`;
    }
    if (n.breathe) {
      body += `<div class="story-breath" aria-live="polite"><div class="story-orb" id="orb"></div><p class="story-phase" id="phase">Get ready</p></div>`;
      actions = `<div class="btn-row"><button class="btn btn-ghost" id="skip">Skip</button></div>`;
    } else if (n.input) {
      body += `
        <div class="message-card">
          <label class="visually-hidden" for="story-input">${esc(n.input.placeholder)}</label>
          <textarea id="story-input" placeholder="${esc(n.input.placeholder)}">${esc(s.draft)}</textarea>
        </div>
        <p class="small muted">Nothing you type is saved or sent anywhere. It's gone when you close this.</p>`;
      actions = `<div class="btn-row"><button class="btn" id="next">Next</button>${n.input.optional ? `<button class="btn btn-link" id="skip">Skip</button>` : ""}</div>`;
    } else {
      const list = n.choices || n.end || (n.next ? [["Continue", n.next]] : []);
      const single = list.length === 1;
      actions = single
        ? `<div class="btn-row"><button class="btn" data-to="${esc(list[0][1])}">${esc(list[0][0])}</button></div>`
        : `<div class="choice-group">${list.map(([label, to]) => {
            const t = to.match(/^@(untangle|reach|breathe):/);
            const text = to === "@home" ? "All tools" : label;
            return `<button class="choice" data-to="${esc(to)}"><strong>${esc(text)}</strong>${t ? `<span>Opens ${TOOLS[t[1]].name}</span>` : ""}</button>`;
          }).join("")}</div>`;
    }

    root.innerHTML = `<section class="view panel">${head(n.beat)}${body}${actions}${footer()}</section>`;
    root.querySelectorAll("[data-to]").forEach(b => b.onclick = () => follow(b.dataset.to));

    const c = root.querySelector("#copy");
    if (c) c.onclick = () => copy(root.querySelector("#story-msg").value);

    if (n.breathe) {
      const orb = root.querySelector("#orb"), phase = root.querySelector("#phase");
      let i = 0;
      const cycle = () => {
        if (i >= n.breathe) { phase.textContent = "Done"; timers.push(setTimeout(() => go(n.next), 900)); return; }
        i++; orb.className = "story-orb in"; phase.textContent = `Breathe in · ${i} of ${n.breathe}`;
        timers.push(setTimeout(() => { orb.className = "story-orb out"; phase.textContent = "Breathe out"; }, 4000));
        timers.push(setTimeout(cycle, 10000));
      };
      timers.push(setTimeout(cycle, 800));
      root.querySelector("#skip").onclick = () => go(n.next);
    }

    if (n.input) {
      const ta = root.querySelector("#story-input");
      ta.oninput = () => { s.draft = ta.value; };
      root.querySelector("#next").onclick = () => {
        const v = ta.value.trim();
        s.draft = "";
        if (v && isCrisis(v)) return go("@help");
        if (v) s.typed = v;
        go(n.input.to);
      };
      const sk = root.querySelector("#skip");
      if (sk) sk.onclick = () => { s.draft = ""; go(n.input.to); };
    }
    wire();
  }

  Steady.register("stories", {
    theme: "stories",
    mount(el) { root = el; if (resume) renderResume(); else renderChooser(); },
    unmount() { clearTimers(); }
  });
})();
