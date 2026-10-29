/* Untangle — step back from a heavy thought (defusion + gentle reframing). */
(function () {
  "use strict";
  const { esc, copy } = Steady;

  // Example thoughts, each with sample answers so a demo can move quickly.
  const examples = [
    { thought: "I failed this exam, so my whole future is ruined.",
      friend: "One exam doesn't decide your future. You're upset because you care, so let's work out what went wrong.",
      balanced: "I didn't do well on this exam, and that's disappointing. It's one result, and I can learn from it.",
      step: "Look over the paper and note two topics to revise." },
    { thought: "Nobody in my class actually likes me.",
      friend: "Feeling left out is really hard, but it doesn't mean nobody likes you. Has anyone been friendly lately?",
      balanced: "I feel disconnected right now. That doesn't prove nobody likes me, and I can try reaching out to one person.",
      step: "Say hi to the person I sit next to and ask how their week is going." },
    { thought: "I have too much to do and I'll never get it all done.",
      friend: "That sounds like a lot. You don't have to do it all at once. What's due first?",
      balanced: "I have a lot on, and it feels heavy. I can't do it all today, but I can start with the most urgent thing.",
      step: "Write a list and spend 10 minutes on the first item." }
  ];

  const starters = [
    "It's true that …, but …",
    "Even though …, I also know …",
    "This is hard right now, and …",
    "One setback doesn't mean …"
  ];

  const whenOptions = ["Right now (5 min)", "Later today", "Tomorrow", "This week"];

  const steps = ["thought", "notice", "sort", "friend", "balanced", "step", "summary"];

  let root, s;

  function fresh() {
    return { i: 0, example: null, thought: "", parts: [], extraFacts: "", friend: "", balanced: "", step: "", when: "" };
  }

  function splitThought(t) {
    return t.split(/[.;!?,]+|\s+(?:and|so|but|because)\s+/i)
      .map(x => x.trim()).filter(x => x.length > 2)
      .map(text => ({ text, kind: null }));
  }

  function shell(inner, opts = {}) {
    const n = steps.length - 1;
    const pct = Math.round((s.i / n) * 100);
    return `
      <section class="view panel">
        <div class="tool-head">
          <span class="tag">Untangle · for overthinking</span>
          ${s.i < n ? `<span class="step-count">Step ${s.i + 1} of ${n}</span>` : ""}
        </div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div style="width:${pct}%"></div></div>
        ${inner}
        ${opts.nav === false ? "" : `
        <div class="btn-row spread">
          ${s.i > 0 ? `<button class="btn btn-link" id="back">← Back</button>` : `<span></span>`}
          <span style="display:flex;gap:10px;align-items:center">
            ${s.example && opts.fill ? `<button class="btn btn-link" id="fill">Use example</button>` : ""}
            <button class="btn" id="next" ${opts.canNext === false ? "disabled" : ""}>${opts.nextLabel || "Next"}</button>
          </span>
        </div>`}
      </section>`;
  }

  function go(d) { s.i = Math.max(0, Math.min(steps.length - 1, s.i + d)); render(); }

  function wire(onNext) {
    const back = root.querySelector("#back");
    if (back) back.onclick = () => go(-1);
    const next = root.querySelector("#next");
    if (next) next.onclick = () => { if (onNext && onNext() === false) return; go(1); };
  }

  // Enable "Next" only when a text field has content.
  function gate(input) {
    const next = root.querySelector("#next");
    const check = () => { next.disabled = !input.value.trim(); };
    input.addEventListener("input", check);
    check();
  }

  const views = {
    thought() {
      root.innerHTML = shell(`
        <h2>What's the thought that's weighing on you?</h2>
        <p class="muted">Write it the way it sounds in your head. It doesn't have to be fair or tidy.</p>
        <label class="visually-hidden" for="t">Your thought</label>
        <textarea id="t" placeholder="e.g. I'm going to mess this up…">${esc(s.thought)}</textarea>
        <p class="small muted" style="margin:12px 0 0">Or try an example:</p>
        <div class="chips">
          ${examples.map((e, i) => `<button class="chip" data-ex="${i}" aria-pressed="${s.example === e}">${esc(e.thought)}</button>`).join("")}
        </div>`, { canNext: !!s.thought.trim() });
      const t = root.querySelector("#t");
      t.oninput = () => { s.thought = t.value; if (s.example && t.value !== s.example.thought) { s.example = null; markEx(); } };
      gate(t);
      function markEx() { root.querySelectorAll("[data-ex]").forEach(c => c.setAttribute("aria-pressed", examples[c.dataset.ex] === s.example)); }
      root.querySelectorAll("[data-ex]").forEach(c => c.onclick = () => {
        s.example = examples[c.dataset.ex];
        s.thought = t.value = s.example.thought;
        t.dispatchEvent(new Event("input"));
        s.example = examples[c.dataset.ex];
        markEx();
      });
      wire(() => { s.thought = t.value.trim(); s.parts = splitThought(s.thought); if (!s.parts.length) s.parts = [{ text: s.thought, kind: null }]; });
    },

    notice() {
      root.innerHTML = shell(`
        <h2>Step back from it</h2>
        <p class="muted">Read your thought slowly with these words in front of it.</p>
        <div class="quote"><span class="prefix">I'm having the thought that</span> ${esc(lower(s.thought))}</div>
        <p class="muted">Now one step further back:</p>
        <div class="quote"><span class="prefix">I notice I'm having the thought that</span> ${esc(lower(s.thought))}</div>
        <p class="hint">Notice what changed. The thought is still there, but you're <em>looking at it</em> instead of looking through it. A thought is something your mind is saying. It isn't automatically a fact.</p>`,
        { nextLabel: "I've noticed it" });
      wire();
    },

    sort() {
      root.innerHTML = shell(`
        <h2>What do you know, and what are you guessing?</h2>
        <p class="muted">Mark each part of your thought. Be honest: some parts may really be true.</p>
        <div class="sort-list">
          ${s.parts.map((p, i) => `
            <div class="sort-item">
              <span>${esc(p.text)}</span>
              <span class="seg" role="group" aria-label="Is this a fact or a guess?">
                <button data-i="${i}" data-k="fact" aria-pressed="${p.kind === "fact"}">I know this</button>
                <button data-i="${i}" data-k="guess" aria-pressed="${p.kind === "guess"}">I'm guessing</button>
              </span>
            </div>`).join("")}
        </div>
        <label class="field" for="facts">Anything else you know for certain? <span class="muted small">(optional)</span></label>
        <textarea id="facts" placeholder="e.g. I passed my last two exams. I still have the resit option.">${esc(s.extraFacts)}</textarea>
        <p class="hint" id="sort-hint" hidden></p>`);
      const hint = root.querySelector("#sort-hint");
      function updateHint() {
        const g = s.parts.filter(p => p.kind === "guess").length;
        hint.hidden = !s.parts.some(p => p.kind);
        hint.textContent = g
          ? `You marked ${g} part${g > 1 ? "s" : ""} as a guess. Predictions can feel certain, especially when we're stressed, but they haven't happened.`
          : "Okay. Even when something is true, how we tell the story about it matters. Let's look at it the way a friend might.";
      }
      root.querySelectorAll(".seg button").forEach(b => b.onclick = () => {
        s.parts[b.dataset.i].kind = b.dataset.k;
        b.parentElement.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
        updateHint();
      });
      updateHint();
      const facts = root.querySelector("#facts");
      facts.oninput = () => { s.extraFacts = facts.value; };
      wire();
    },

    friend() {
      root.innerHTML = shell(`
        <h2>What would you tell a friend?</h2>
        <p class="muted">Imagine a close friend came to you and said:</p>
        <div class="quote">“${esc(s.thought)}”</div>
        <label class="field" for="f">What would you say to them?</label>
        <textarea id="f" placeholder="Speak to them the way you'd want to be spoken to.">${esc(s.friend)}</textarea>`,
        { fill: true, canNext: !!s.friend.trim() });
      const f = root.querySelector("#f");
      f.oninput = () => { s.friend = f.value; };
      gate(f);
      fillBtn(f, "friend");
      wire();
    },

    balanced() {
      const facts = s.parts.filter(p => p.kind === "fact").map(p => p.text);
      root.innerHTML = shell(`
        <h2>Write a more balanced thought</h2>
        <p class="muted">Not forced positivity. Write something honest that includes the hard part <em>and</em> the bigger picture.</p>
        ${s.friend ? `<p class="small muted">You told your friend: <em>“${esc(s.friend)}”</em></p>` : ""}
        ${facts.length || s.extraFacts ? `<p class="small muted">What you know: <em>${esc([...facts, s.extraFacts].filter(Boolean).join(" · "))}</em></p>` : ""}
        <label class="field" for="b">A more balanced way to see it</label>
        <textarea id="b">${esc(s.balanced)}</textarea>
        <p class="small muted" style="margin:10px 0 0">Need a starting point?</p>
        <div class="chips">${starters.map(t => `<button class="chip" data-st="${esc(t)}">${esc(t)}</button>`).join("")}</div>`,
        { fill: true, canNext: !!s.balanced.trim() });
      const b = root.querySelector("#b");
      b.oninput = () => { s.balanced = b.value; };
      gate(b);
      root.querySelectorAll("[data-st]").forEach(c => c.onclick = () => {
        b.value = c.dataset.st; b.dispatchEvent(new Event("input")); b.focus();
        const j = b.value.indexOf("…"); if (j >= 0) b.setSelectionRange(j, j + 1);
      });
      fillBtn(b, "balanced");
      wire();
    },

    step() {
      root.innerHTML = shell(`
        <h2>One small next step</h2>
        <p class="muted">What's the smallest useful thing you could do about this? Ideally something that takes five minutes or less.</p>
        <label class="field" for="st">My next step</label>
        <input type="text" id="st" value="${esc(s.step)}" placeholder="e.g. Message my tutor to ask about the resit" autocomplete="off">
        <label class="field" id="when-l">When will you do it?</label>
        <div class="chips" role="radiogroup" aria-labelledby="when-l">
          ${whenOptions.map(w => `<button class="chip" role="radio" data-w="${esc(w)}" aria-pressed="${s.when === w}" aria-checked="${s.when === w}">${esc(w)}</button>`).join("")}
        </div>`,
        { fill: true, canNext: !!s.step.trim(), nextLabel: "See my summary" });
      const st = root.querySelector("#st");
      st.oninput = () => { s.step = st.value; };
      gate(st);
      root.querySelectorAll("[data-w]").forEach(c => c.onclick = () => {
        s.when = c.dataset.w;
        root.querySelectorAll("[data-w]").forEach(x => { x.setAttribute("aria-pressed", x === c); x.setAttribute("aria-checked", x === c); });
      });
      fillBtn(st, "step");
      wire();
    },

    summary() {
      root.innerHTML = shell(`
        <h2>Here's what you untangled</h2>
        <div class="summary">
          <div class="row"><span class="lbl">The thought</span><span class="txt">${esc(s.thought)}</span></div>
          <div class="arrow-down" aria-hidden="true">↓</div>
          <div class="row balanced"><span class="lbl">A more balanced view</span><span class="txt">${esc(s.balanced)}</span></div>
          <div class="arrow-down" aria-hidden="true">↓</div>
          <div class="row"><span class="lbl">My next step${s.when ? " · " + esc(s.when) : ""}</span><span class="txt">${esc(s.step)}</span></div>
        </div>
        <p class="hint">The original thought may come back, and that's normal. When it does, you can remind yourself of what you wrote here.</p>
        <p class="small muted">If heavy thoughts keep coming back or are getting in the way of daily life, talking to a counsellor or someone you trust can really help.</p>
        <div class="btn-row">
          <button class="btn" id="copy">Copy summary</button>
          <button class="btn btn-ghost" id="restart">Untangle another</button>
          <a class="btn btn-link" href="#/">All tools</a>
        </div>`, { nav: false });
      root.querySelector("#copy").onclick = () => copy(
        `The thought: ${s.thought}\nA more balanced view: ${s.balanced}\nMy next step${s.when ? " (" + s.when + ")" : ""}: ${s.step}`);
      root.querySelector("#restart").onclick = () => { s = fresh(); render(); };
    }
  };

  function lower(t) {
    // "I failed…" stays capitalised ("I"); other first letters are lowered to read naturally after the prefix.
    return /^I\b/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1);
  }

  function fillBtn(input, key) {
    const b = root.querySelector("#fill");
    if (b) b.onclick = () => { input.value = s.example[key]; input.dispatchEvent(new Event("input")); };
  }

  function render() {
    views[steps[s.i]]();
    const h = root.querySelector("h2");
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0 });
  }

  Steady.register("untangle", {
    theme: "untangle",
    mount(el) { root = el; s = fresh(); render(); },
    unmount() {}
  });
})();
