/* Breathe — guided breathing with an animated orb. */
(function () {
  "use strict";
  const { esc, prefersReducedMotion } = Steady;

  // scale: target orb size at the end of the phase (0.45 = small, 1 = full)
  const patterns = {
    gentle: {
      name: "Gentle breathing", short: "In 4 · out 5",
      about: "Breathe in through your nose and out through your mouth, gently and without forcing it. This is the simple pattern the NHS recommends for stress.",
      phases: [{ cue: "Breathe in", secs: 4, scale: 1 }, { cue: "Breathe out", secs: 5, scale: .45 }]
    },
    sigh: {
      name: "Calming sigh", short: "In · top-up · long out",
      about: "Take a full breath in through your nose, then a short extra sip of air on top, then let it go in a long, slow exhale. In a small Stanford study, five minutes a day of this improved mood.",
      phases: [{ cue: "Breathe in", secs: 3, scale: .88 }, { cue: "A little more", secs: 1, scale: 1 }, { cue: "Long, slow out", secs: 6, scale: .45 }]
    },
    box: {
      name: "Box breathing", short: "4 · 4 · 4 · 4",
      about: "Breathe in, hold, breathe out, hold, each for four counts. The steady rhythm gives a busy mind something simple to follow.",
      phases: [{ cue: "Breathe in", secs: 4, scale: 1 }, { cue: "Hold", secs: 4, scale: 1 }, { cue: "Breathe out", secs: 4, scale: .45 }, { cue: "Hold", secs: 4, scale: .45 }]
    }
  };

  const endings = {
    better: "Good. Hold on to that feeling, and remember you can come back to this any time.",
    same: "That's okay. Breathing doesn't fix everything, and sometimes it just gives you a pause. You could try another round, or another tool.",
    worse: "Thank you for being honest. If focusing on your breath feels uncomfortable, that's common. Try something else, like Untangle or Reach Out, and if things feel like too much, talk to someone you trust."
  };

  let state, root, timers = [], audioCtx = null;

  function clearTimers() { timers.forEach(clearTimeout); timers.forEach(clearInterval); timers = []; }

  function chime(freq) {
    if (!state.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0, audioCtx.currentTime);
      g.gain.linearRampToValueAtTime(.08, audioCtx.currentTime + .05);
      g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + 1.1);
      o.connect(g).connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 1.2);
    } catch (_) { /* audio unavailable */ }
  }

  function buzz() { if (state.vibrate && navigator.vibrate) navigator.vibrate(40); }

  function renderSetup() {
    root.innerHTML = `
      <section class="view panel">
        <span class="tag">For stress &amp; anxiety</span>
        <h2>Take a breathing break</h2>
        <p class="muted">Find a comfortable position. You can keep your eyes open and look at the circle, or close them and follow the sounds.</p>

        <label class="field" id="pat-l">Choose a rhythm</label>
        <div class="choice-group" role="radiogroup" aria-labelledby="pat-l">
          ${Object.entries(patterns).map(([k, p]) => `
            <button class="choice" role="radio" data-pattern="${k}" aria-checked="${state.pattern === k}">
              <strong>${p.name}</strong><span>${p.short}</span>
            </button>`).join("")}
        </div>
        <p class="hint" id="pat-about">${esc(patterns[state.pattern].about)}</p>

        <label class="field" id="dur-l">How long?</label>
        <div class="toggle" role="group" aria-labelledby="dur-l">
          ${[1, 2, 3].map(m => `<button data-min="${m}" aria-pressed="${state.minutes === m}">${m} min</button>`).join("")}
        </div>

        <div class="settings-row">
          <label class="check"><input type="checkbox" id="opt-sound" ${state.sound ? "checked" : ""}> Soft chime</label>
          ${navigator.vibrate ? `<label class="check"><input type="checkbox" id="opt-vib" ${state.vibrate ? "checked" : ""}> Vibrate</label>` : ""}
        </div>

        <div class="btn-row">
          <button class="btn" id="start">Begin</button>
        </div>
        <p class="small muted" style="margin-top:14px">Never force the breath. If you feel light-headed, stop and breathe normally.</p>
      </section>`;

    root.querySelectorAll("[data-pattern]").forEach(b => b.onclick = () => {
      state.pattern = b.dataset.pattern;
      root.querySelectorAll("[data-pattern]").forEach(x => x.setAttribute("aria-checked", x === b));
      root.querySelector("#pat-about").textContent = patterns[state.pattern].about;
    });
    root.querySelectorAll("[data-min]").forEach(b => b.onclick = () => {
      state.minutes = +b.dataset.min;
      root.querySelectorAll("[data-min]").forEach(x => x.setAttribute("aria-pressed", x === b));
    });
    root.querySelector("#opt-sound").onchange = e => { state.sound = e.target.checked; if (state.sound) chime(528); };
    const vib = root.querySelector("#opt-vib");
    if (vib) vib.onchange = e => { state.vibrate = e.target.checked; buzz(); };
    root.querySelector("#start").onclick = renderSession;
  }

  function renderSession() {
    const p = patterns[state.pattern];
    const reduced = prefersReducedMotion();
    root.innerHTML = `
      <section class="view panel ${reduced ? "reduced" : ""}">
        <div class="tool-head">
          <div><span class="tag">${p.name}</span></div>
          <span class="step-count" id="remaining" aria-label="Time remaining"></span>
        </div>
        <div class="stage">
          <div class="orb-wrap">
            <div class="orb-ring" aria-hidden="true"></div>
            <div class="orb" id="orb"></div>
            <div class="orb-label" aria-live="assertive">
              <span class="cue" id="cue">Get ready</span>
              <span class="count" id="count"></span>
            </div>
          </div>
          <div class="phase-bar" aria-hidden="true"><div id="pbar"></div></div>
        </div>
        <div class="btn-row" style="justify-content:center">
          <button class="btn btn-ghost" id="pause">Pause</button>
          <button class="btn btn-link" id="stop">Finish early</button>
        </div>
      </section>`;

    const orb = root.querySelector("#orb"), cue = root.querySelector("#cue"), count = root.querySelector("#count"),
      pbar = root.querySelector("#pbar"), remainingEl = root.querySelector("#remaining"), pauseBtn = root.querySelector("#pause");

    const total = state.minutes * 60;
    let elapsed = 0, phaseIdx = -1, phaseLeft = 0, paused = false, finishing = false;

    function fmt(s) { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }

    function startPhase() {
      phaseIdx = (phaseIdx + 1) % p.phases.length;
      // Only end the session at the end of a full cycle, so it never stops mid-breath.
      if (phaseIdx === 0 && elapsed >= total) { finishing = true; return renderDone(); }
      const ph = p.phases[phaseIdx];
      phaseLeft = ph.secs;
      cue.textContent = ph.cue;
      count.textContent = ph.secs;
      orb.style.transitionDuration = ph.secs + "s";
      orb.style.transform = `scale(${ph.scale})`;
      pbar.style.transition = "none"; pbar.style.width = "0";
      void pbar.offsetWidth;
      pbar.style.transition = `width ${ph.secs}s linear`; pbar.style.width = "100%";
      chime(ph.cue.startsWith("Breathe in") ? 528 : ph.cue === "Hold" ? 440 : 396);
      buzz();
    }

    function tick() {
      if (paused || finishing) return;
      elapsed++; phaseLeft--;
      remainingEl.textContent = fmt(total - elapsed) + " left";
      if (phaseLeft <= 0) startPhase();
      else count.textContent = phaseLeft;
    }

    remainingEl.textContent = fmt(total) + " left";
    // Short lead-in so people can settle before the first breath.
    count.textContent = "3";
    let lead = 3;
    const leadT = setInterval(() => {
      if (paused) return;
      lead--;
      if (lead > 0) { count.textContent = lead; return; }
      clearInterval(leadT);
      startPhase();
      timers.push(setInterval(tick, 1000));
    }, 1000);
    timers.push(leadT);

    pauseBtn.onclick = () => {
      paused = !paused;
      pauseBtn.textContent = paused ? "Resume" : "Pause";
      if (paused) {
        // Freeze the orb and bar where they are.
        const cs = getComputedStyle(orb).transform;
        orb.style.transitionDuration = "0s"; orb.style.transform = cs;
        const w = getComputedStyle(pbar).width;
        pbar.style.transition = "none"; pbar.style.width = w;
        cue.textContent = "Paused";
      } else {
        const ph = p.phases[Math.max(phaseIdx, 0)];
        if (phaseIdx >= 0) {
          cue.textContent = ph.cue;
          orb.style.transitionDuration = phaseLeft + "s"; orb.style.transform = `scale(${ph.scale})`;
          pbar.style.transition = `width ${phaseLeft}s linear`; pbar.style.width = "100%";
        } else cue.textContent = "Get ready";
      }
    };
    root.querySelector("#stop").onclick = () => { finishing = true; renderDone(); };
  }

  function renderDone() {
    clearTimers();
    root.innerHTML = `
      <section class="view panel">
        <span class="tag">Well done</span>
        <h2>Take your time.</h2>
        <p class="muted">Notice how your body feels now, without needing it to be different.</p>
        <label class="field" id="feel-l">How do you feel compared to before?</label>
        <div class="feel-row" role="radiogroup" aria-labelledby="feel-l">
          <button class="choice feel" role="radio" aria-checked="false" data-feel="better"><span class="emo" aria-hidden="true">+</span>A bit better</button>
          <button class="choice feel" role="radio" aria-checked="false" data-feel="same"><span class="emo" aria-hidden="true">=</span>About the same</button>
          <button class="choice feel" role="radio" aria-checked="false" data-feel="worse"><span class="emo" aria-hidden="true">−</span>Not better</button>
        </div>
        <p class="hint" id="ending" hidden></p>
        <label class="field" for="focus">What's one thing you can focus on next? <span class="muted small">(optional)</span></label>
        <input type="text" id="focus" placeholder="e.g. Read the first question of my revision sheet" autocomplete="off">
        <div class="btn-row">
          <button class="btn" id="again">Go again</button>
          <a class="btn btn-ghost" href="#/untangle">Try Untangle</a>
          <a class="btn btn-link" href="#/">All tools</a>
        </div>
      </section>`;
    root.querySelectorAll("[data-feel]").forEach(b => b.onclick = () => {
      root.querySelectorAll("[data-feel]").forEach(x => x.setAttribute("aria-checked", x === b));
      const e = root.querySelector("#ending");
      e.textContent = endings[b.dataset.feel]; e.hidden = false;
    });
    root.querySelector("#again").onclick = renderSetup;
  }

  Steady.register("breathe", {
    theme: "breathe",
    mount(el) {
      root = el;
      state = { pattern: "gentle", minutes: 1, sound: false, vibrate: false };
      renderSetup();
    },
    unmount() { clearTimers(); }
  });
})();
