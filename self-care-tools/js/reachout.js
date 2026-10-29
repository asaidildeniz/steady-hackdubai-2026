/* Reach Out — a short self-compassion moment, then a message you can send. */
(function () {
  "use strict";
  const { esc, copy, toast } = Steady;

  // Based on the three parts of Kristin Neff's Self-Compassion Break.
  const lines = [
    { text: "This is hard right now.", note: "Feeling lonely is painful, and it's okay to admit that." },
    { text: "Lots of people feel this way, too.", note: "Loneliness is really common, especially among students. You're not the only one." },
    { text: "I can be kind to myself.", note: "If it helps, place a hand on your chest. Speak to yourself the way you would to a friend." }
  ];

  const needs = {
    listen: {
      label: "Someone to listen", sub: "I don't need advice, just company",
      msgs: {
        casual: [
          "Hey, I've had a bit of a rough day. Are you free to talk for a bit?",
          "No pressure, but would you be up for a call later? I could use a chat.",
          "I don't need advice or anything, I'd just really like someone to listen for a bit. Free at some point?"
        ],
        open: [
          "Hey, I've been feeling pretty low lately and I'd really like to talk to someone. Would you have some time today or tomorrow?",
          "I'm finding things harder than usual at the moment. I don't need you to fix anything, but it would mean a lot to talk. Are you around?",
          "I've been feeling quite lonely recently and I trust you. Could we talk sometime soon?"
        ]
      }
    },
    reconnect: {
      label: "Reconnect with a friend", sub: "It's been a while",
      msgs: {
        casual: [
          "Hey! It's been ages. How are you doing? Want to catch up sometime?",
          "Saw something today that reminded me of you 😊 How's everything going?",
          "Fancy grabbing a coffee or going for a walk this week? Would be really good to see you."
        ],
        open: [
          "Hey, I know we haven't talked in a while, and that's on me too. I've missed chatting with you. Would you like to catch up?",
          "I've been thinking about you and realised how much I miss our conversations. Any chance we could meet up soon?",
          "It's been a while and I'd really love to reconnect. No pressure at all, but I'd love to hear how you're doing."
        ]
      }
    },
    trust: {
      label: "Talk to someone I trust", sub: "A family member, mentor, or counsellor",
      msgs: {
        casual: [
          "Hi, do you have a few minutes sometime this week? There's something I'd like to talk through.",
          "Hey, could we have a chat soon? Nothing urgent, but I'd value your perspective.",
          "Hi, would you be free for a quick call? I've had a lot on my mind."
        ],
        open: [
          "Hi, I've been struggling a bit lately and I'd really value talking to you about it. When would be a good time?",
          "I've been feeling quite alone recently and it's been getting to me. Would you be able to make some time to talk?",
          "Hi, I wanted to reach out because things have felt heavy lately. I'm not sure what I need yet, but I think talking would help. Are you free soon?"
        ]
      }
    }
  };

  let root, s, timer;

  function stop() { clearTimeout(timer); }

  function renderMoment() {
    const reduced = Steady.prefersReducedMotion();
    root.innerHTML = `
      <section class="view panel">
        <div class="tool-head">
          <span class="tag">Reach Out · for loneliness</span>
          <button class="btn btn-link" id="skip">Skip</button>
        </div>
        <h2>First, a moment for you</h2>
        <p class="muted">Take a slow breath and read each line to yourself.</p>
        <div class="compassion-line" aria-live="polite"><span id="line"></span></div>
        <p class="muted small" id="note" style="text-align:center;min-height:3em"></p>
        <div class="dots" aria-hidden="true">${lines.map(() => "<i></i>").join("")}</div>
        <div class="btn-row" style="justify-content:center">
          <button class="btn" id="next">Next</button>
        </div>
      </section>`;
    const noteEl = root.querySelector("#note"), dots = root.querySelectorAll(".dots i"), next = root.querySelector("#next");
    let i = -1;
    function show() {
      i++;
      stop();
      if (i >= lines.length) return renderNeeds();
      // Re-create the span so the fade-in animation replays.
      const old = root.querySelector("#line"), fresh = old.cloneNode();
      old.replaceWith(fresh);
      fresh.textContent = lines[i].text;
      noteEl.textContent = lines[i].note;
      dots.forEach((d, j) => d.classList.toggle("on", j <= i));
      next.textContent = i === lines.length - 1 ? "Continue" : "Next";
      // Gently auto-advance; people can also tap Next.
      if (!reduced && i < lines.length - 1) timer = setTimeout(show, 7000);
    }
    next.onclick = show;
    root.querySelector("#skip").onclick = () => { stop(); renderNeeds(); };
    show();
  }

  function renderNeeds() {
    stop();
    root.innerHTML = `
      <section class="view panel">
        <span class="tag">Reach Out · for loneliness</span>
        <h2>What would help you right now?</h2>
        <p class="muted">Even starting a message can feel hard. Pick one, and we'll help you with the words.</p>
        <div class="choice-group" role="radiogroup" aria-label="What would help">
          ${Object.entries(needs).map(([k, n]) => `
            <button class="choice" role="radio" aria-checked="false" data-need="${k}">
              <strong>${n.label}</strong><span>${n.sub}</span>
            </button>`).join("")}
        </div>
        <div class="btn-row"><button class="btn btn-link" id="back">← Back</button></div>
      </section>`;
    root.querySelectorAll("[data-need]").forEach(b => b.onclick = () => { s.need = b.dataset.need; s.idx = 0; renderMessage(); });
    root.querySelector("#back").onclick = renderMoment;
    focusHeading();
  }

  function currentMsg() { return needs[s.need].msgs[s.tone][s.idx]; }

  function renderMessage() {
    const n = needs[s.need];
    const list = n.msgs[s.tone];
    root.innerHTML = `
      <section class="view panel">
        <span class="tag">${esc(n.label)}</span>
        <h2>Here's a message you could send</h2>
        <p class="muted">Edit it so it sounds like you. Small, honest messages are usually enough.</p>

        <div class="settings-row" style="justify-content:space-between">
          <div class="toggle" role="group" aria-label="Tone">
            <button data-tone="casual" aria-pressed="${s.tone === "casual"}">Casual</button>
            <button data-tone="open" aria-pressed="${s.tone === "open"}">More open</button>
          </div>
          <span class="step-count">Option ${s.idx + 1} of ${list.length}</span>
        </div>

        <div class="message-card">
          <label class="visually-hidden" for="msg">Your message</label>
          <textarea id="msg">${esc(s.edited ?? currentMsg())}</textarea>
        </div>

        <div class="btn-row">
          <button class="btn" id="copy">Copy message</button>
          ${navigator.share ? `<button class="btn btn-ghost" id="share">Share…</button>` : ""}
          <button class="btn btn-link" id="other">Try another wording</button>
        </div>

        <p class="hint" style="margin-top:22px">Not sure who to send it to? Think of one person who has been kind to you, even in a small way. It doesn't have to be your closest friend.</p>
        <p class="small muted">If you're feeling like this a lot, or it's starting to feel like too much, please talk to someone you trust or a counsellor. You deserve support.</p>

        <div class="btn-row spread">
          <button class="btn btn-link" id="back">← Choose something else</button>
          <a class="btn btn-link" href="#/">All tools</a>
        </div>
      </section>`;

    const msg = root.querySelector("#msg");
    msg.oninput = () => { s.edited = msg.value; };
    root.querySelectorAll("[data-tone]").forEach(b => b.onclick = () => {
      if (s.tone === b.dataset.tone) return;
      s.tone = b.dataset.tone; s.edited = null; renderMessage();
    });
    root.querySelector("#other").onclick = () => { s.idx = (s.idx + 1) % list.length; s.edited = null; renderMessage(); };
    root.querySelector("#copy").onclick = async () => { if (await copy(msg.value)) s.sent = true; };
    const share = root.querySelector("#share");
    if (share) share.onclick = async () => {
      try { await navigator.share({ text: msg.value }); toast("Sent to your app"); }
      catch (e) { if (e.name !== "AbortError") copy(msg.value); }
    };
    root.querySelector("#back").onclick = () => { s.edited = null; renderNeeds(); };
    focusHeading();
  }

  function focusHeading() {
    const h = root.querySelector("h2");
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }

  Steady.register("reach-out", {
    theme: "reach",
    mount(el) { root = el; s = { need: null, tone: "casual", idx: 0, edited: null }; renderMoment(); },
    unmount() { stop(); }
  });
})();
