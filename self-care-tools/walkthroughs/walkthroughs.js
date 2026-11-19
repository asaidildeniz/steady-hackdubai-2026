// Steady walk-through review page: the three paths with a live map. The story text lives in ../js/stories-content.js.
const { STORIES, isCrisis } = window.SteadyStories;

const TOOLS = {
  untangle: { name: "Untangle", cls: "untangle", line: "In the app this opens the existing six-step Untangle, then comes back here." },
  reach: { name: "Reach Out", cls: "reach", line: "In the app this opens Talk to someone, with the trusted pastors and counsellors." },
  breathe: { name: "Breathe", cls: "breathe", line: "In the app this opens the one-minute Calm moment." },
};

let storyId = "worry", cur, history = [], seen = new Set(), typed = "", draft = "", timers = [];
const $ = id => document.getElementById(id);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

function startStory(id) {
  storyId = id; history = []; seen = new Set(); typed = ""; draft = "";
  document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-pressed", t.dataset.story === id));
  go(STORIES[id].start, false);
}

function go(target, push = true) {
  clearTimers();
  if (push && cur) history.push(cur);
  cur = target;
  if (!target.startsWith("@")) seen.add(target);
  render(); renderMap();
}

function follow(to) {
  if (to === "@home") return go("@home");
  if (to === "@help") return go("@help");
  const m = to.match(/^@(\w+):(.+)$/);
  if (m) return go("@tool:" + m[1] + ":" + m[2]);
  go(to);
}

function back() { clearTimers(); if (history.length) { cur = history.pop(); render(); renderMap(); } }

function frame(beatText) {
  const s = $("screen"); s.innerHTML = "";
  const bar = el("div", "bar");
  const b = el("button", "icon-btn", "‹"); b.disabled = !history.length; b.onclick = back; b.setAttribute("aria-label", "Back to the previous screen");
  const top = el("div", "toprow"); top.append(b);
  if (beatText !== "Need help now") { const h = el("button", "help-link", "Need help now"); h.onclick = () => go("@help"); top.append(h); }
  bar.append(top);
  const beats = STORIES[storyId].beats, idx = beats.indexOf(beatText);
  if (idx >= 0) {
    const p = el("div", "progress"), fill = el("i"); fill.style.width = ((idx + 1) / beats.length * 100) + "%"; p.append(fill);
    bar.append(el("span", "beat", "Step " + (idx + 1) + " of " + beats.length + " · " + beatText), p);
  } else if (beatText) bar.append(el("span", "pill-tag", beatText));
  const body = el("div", "body"), actions = el("div", "actions");
  s.append(bar, body, actions);
  return { s, body, actions };
}

// Need help now sits top right on every screen (see frame), so the bottom of the screen needs nothing extra.
function safeLink(s) {}

function sayLines(body, lines) {
  lines.forEach((t, i) => body.append(el("p", "say" + (i === 0 ? " first" : ""), t)));
}

function render() {
  const story = STORIES[storyId];
  if (cur === "@home") return renderSimple("Home", ["This is where the walk-through ends and the student lands on Home."], [["Start again", () => startStory(storyId)]]);
  if (cur === "@help") return renderHelp();
  if (cur.startsWith("@tool:")) {
    const [, tool, ret] = cur.split(":");
    const t = TOOLS[tool];
    const { s, body, actions } = frame(t.name);
    const stub = el("div", "stub");
    stub.append(el("span", "tag " + t.cls, t.name), el("p", "say", t.line), el("p", "note", "Placeholder in this prototype."));
    body.append(stub);
    stub.className = "btn tool " + t.cls; stub.style.flexDirection = "column"; stub.style.alignItems = "flex-start"; stub.style.cursor = "default";
    const btn = el("button", "btn primary", ret === "@home" ? "Done" : "Done, back to the walk-through");
    btn.onclick = () => follow(ret); actions.append(btn);
    safeLink(s); return;
  }

  const n = story.nodes[cur];
  const { s, body, actions } = frame(n.beat);

  if (n.verse) {
    const v = el("div", "verse");
    v.append(el("span", "ref", n.verse.ref));
    if (n.verse.quote) v.append(el("q", null, n.verse.quote));
    body.append(v);
  }
  if (n.echo && typed) body.append(el("div", "echo", "You wrote: “" + typed + "”"));
  sayLines(body, n.say);

  if (n.copy) {
    const box = el("div", "copybox");
    box.append(el("span", null, n.copy));
    const c = el("button", "btn small", "Copy message");
    c.onclick = async () => {
      try { await navigator.clipboard.writeText(n.copy); c.textContent = "Copied"; }
      catch { const r = document.createRange(); r.selectNodeContents(box.firstChild); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); c.textContent = "Selected, copy it from here"; }
    };
    box.append(c); body.append(box);
  }

  if (n.breathe) {
    const wrap = el("div", "orb-wrap"), orb = el("div", "orb"), phase = el("div", "phase", "Get ready");
    wrap.append(orb, phase); body.append(wrap);
    let i = 0;
    const cycle = () => {
      if (i >= n.breathe) { phase.textContent = "Done"; timers.push(setTimeout(() => go(n.next), 900)); return; }
      i++; orb.className = "orb in"; phase.textContent = "Breathe in · " + i + " of " + n.breathe;
      timers.push(setTimeout(() => { orb.className = "orb out"; phase.textContent = "Breathe out"; }, 4000));
      timers.push(setTimeout(cycle, 10000));
    };
    timers.push(setTimeout(cycle, 800));
    const skip = el("button", "btn", "Skip"); skip.onclick = () => go(n.next); actions.append(skip);
    safeLink(s); return;
  }

  if (n.input) {
    const id = "input-" + cur;
    const ta = el("textarea"); ta.id = id; ta.placeholder = n.input.placeholder; ta.value = draft;
    ta.setAttribute("aria-label", n.input.placeholder);
    ta.oninput = () => { draft = ta.value; };
    body.append(ta, el("p", "note", "Nothing you type is saved or sent anywhere. It's gone when you close this."));
    const go1 = el("button", "btn primary", "Next");
    go1.onclick = () => {
      const v = ta.value.trim();
      if (v && isCrisis(v)) { draft = ""; return go("@help"); }
      if (v) typed = v;
      draft = "";
      go(n.input.to);
    };
    actions.append(go1);
    if (n.input.optional) { const sk = el("button", "btn", "Skip"); sk.onclick = () => { draft = ""; go(n.input.to); }; actions.append(sk); }
    safeLink(s); return;
  }

  const list = n.choices || n.end || (n.next ? [["Continue", n.next]] : []);
  list.forEach(([label, to], i) => {
    const toolMatch = to.match(/^@(untangle|reach|breathe):/);
    const single = n.primary || (!n.choices && !n.end);
    const b = el("button", "btn" + (single && i === 0 ? " primary" : "") + (n.end && !toolMatch ? " pill" : "") + (toolMatch ? " tool " + TOOLS[toolMatch[1]].cls : ""));
    if (toolMatch) { b.append(el("span", null, label), el("span", "tag", "Start")); }
    else b.textContent = label;
    b.onclick = () => follow(to);
    actions.append(b);
  });
  if (!(n.end && n.end.some(e => e[1] === "@help"))) safeLink(s);
}

function renderSimple(beat, lines, buttons) {
  const { body, actions } = frame(beat);
  sayLines(body, lines);
  buttons.forEach(([label, fn], i) => { const b = el("button", "btn" + (i === 0 ? " primary" : ""), label); b.onclick = fn; actions.append(b); });
}

function renderHelp() {
  const { body, actions } = frame("Need help now");
  sayLines(body, ["You are not alone.", "If you are in danger or cannot keep yourself safe, contact emergency services now."]);
  body.append(el("div", "pending", "Verified numbers will appear here once our reviewer has checked them."));
  body.append(el("p", "note", "This is the existing Need help now screen. Typing a crisis phrase in any text box also brings the student here."));
  const t = el("button", "btn primary", "Talk to someone"); t.onclick = () => go("@tool:reach:@home");
  const h = el("button", "btn", "Back to the walk-through"); h.onclick = back;
  actions.append(t, h);
}

function renderMap() {
  const story = STORIES[storyId];
  const byBeat = {};
  Object.entries(story.nodes).forEach(([id, n]) => (byBeat[n.beat] = byBeat[n.beat] || []).push(id));
  const curBeat = story.nodes[cur] ? story.nodes[cur].beat : null;
  const curIdx = story.beats.indexOf(curBeat);
  const spine = $("spine"); spine.innerHTML = "";
  story.beats.forEach((beat, bi) => {
    const row = el("div", "row"), rail = el("div", "rail"), col = el("div", "beatcol");
    const ids = byBeat[beat] || [];
    const state = beat === curBeat ? "now" : ids.some(i => seen.has(i)) ? "done" : "";
    rail.append(el("span", "dot " + state), el("span", "stem"));
    const name = el("div", "beatname", beat);
    if (story.optional.includes(beat)) name.append(el("span", "opt", "can be skipped"));
    const chips = el("div", "chips");
    ids.forEach(id => {
      const c = el("button", "chip" + (story.nodes[id].added ? " added" : "") + (id === cur ? " now" : seen.has(id) ? " seen" : ""), id.split(".")[1]);
      c.title = story.nodes[id].say[0];
      c.setAttribute("aria-label", "Jump to " + beat + ": " + story.nodes[id].say[0]);
      c.onclick = () => go(id);
      chips.append(c);
    });
    col.append(name, chips); row.append(rail, col); spine.append(row);
  });

  const nodes = Object.values(story.nodes);
  const words = n => [...(n.say || []), n.copy || "", n.verse && n.verse.quote || ""].join(" ").split(/\s+/).filter(Boolean).length;
  const longest = Math.max(...nodes.map(words));
  const sentences = n => (n.say || []).join(" ").split(/[.!?]+(?=\s|$)/).filter(x => x.trim()).length;
  const maxSent = Math.max(...nodes.map(sentences));
  $("legend-added").hidden = !nodes.some(n => n.added);
  const st = $("stats"); st.innerHTML = "";
  [[Object.keys(story.nodes).length, "screens to review"], [longest, "words on the longest screen"], [maxSent, "sentences at most per screen"]]
    .forEach(([v, l]) => { const d = el("div", "stat"); d.append(el("b", null, String(v)), el("span", null, l)); st.append(d); });
}

document.querySelectorAll(".tab").forEach(t => t.onclick = () => startStory(t.dataset.story));
startStory("worry");
