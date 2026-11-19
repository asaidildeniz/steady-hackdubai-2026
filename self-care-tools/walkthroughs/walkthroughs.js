// Steady walk-through prototype: three team readings as short branching paths. Nothing is stored or sent.
// Crisis phrases copied from src/content/content.json (safety.crisisPhrases).
const CRISIS = ["suicide","suicidal","kill myself","killing myself","end my life","ending my life","want to die","wanna die","better off dead","better off without me","no reason to live","dont want to be here","cant go on","hurt myself","hurting myself","harm myself","self harm","cutting myself","overdose","not safe at home","being abused","someone is hurting me"];
const norm = s => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
const isCrisis = s => { const t = " " + norm(s) + " "; return CRISIS.some(p => t.includes(" " + p + " ")); };

// Shared ending, used by both paths. {msg} is the suggested message for the path.
const shared = (p, msg) => ({
  [p + "reach"]: { beat: "Reach out", say: ["One more step. Things often feel lighter when someone else knows.", "Who could you tell, even in one line?"],
    choices: [["A friend", p + "msg"], ["Family", p + "msg"], ["A pastor or counsellor", "@reach:" + p + "check"], ["No one comes to mind", p + "noone"]] },
  [p + "msg"]: { beat: "Reach out", say: ["You could send this, or say it your own way:"], copy: msg,
    choices: [["I'll send it", p + "check"], ["Maybe later", p + "check"]] },
  [p + "noone"]: { beat: "Reach out", say: ["That happens to a lot of people, and it's okay.", "Reach Out lists pastors and counsellors who are there for this."],
    choices: [["Open Reach Out", "@reach:" + p + "check"], ["Not now", p + "check"]] },
  [p + "check"]: { beat: "Check out", say: ["How do you feel now?", "Whatever the answer is, it's okay."],
    choices: [["A little lighter", p + "better"], ["Still heavy", p + "heavy"]] },
  [p + "better"]: { beat: "Check out", say: ["I'm glad.", "It may come back, and that's normal. You can walk through this again whenever you need to."], end: [["Back to Home", "@home"]] },
  [p + "heavy"]: { beat: "Check out", say: ["Thank you for being honest.", "Some things take longer than a few minutes. You don't have to hold this alone."],
    end: [["Talk to someone", "@reach:@home"], ["Breathe for a minute", "@breathe:@home"], ["I don't feel safe right now", "@help"], ["Back to Home", "@home"]] },
});

const STORIES = {
  worry: {
    title: "When worry won't stop",
    beats: ["Arrive", "Name it", "Body or head", "Write it", "Look at it", "Faith", "Reach out", "Check out"],
    optional: ["Faith"],
    start: "w.start",
    nodes: Object.assign({
      "w.start": { beat: "Arrive", say: ["Worry can take up a lot of room.", "Let's go one small step at a time. You can stop whenever you like."], choices: [["Let's start", "w.what"]], primary: true },
      "w.what": { beat: "Name it", say: ["What's on your mind most right now?"],
        choices: [["Studies or exams", "w.study"], ["Family", "w.family"], ["Friends or relationships", "w.friends"], ["The future", "w.future"], ["Everything at once", "w.all"]] },
      "w.study": { beat: "Name it", say: ["Exams and deadlines can fill every thought.", "That's a lot to carry."], next: "w.where" },
      "w.family": { beat: "Name it", say: ["Worrying about family can feel heavy, especially from far away or when you can't fix things."], next: "w.where" },
      "w.friends": { beat: "Name it", say: ["Relationships matter, so worry about them can follow you everywhere."], next: "w.where" },
      "w.future": { beat: "Name it", say: ["Thinking about the future can make today feel heavier.", "We'll stay with today for a few minutes."], next: "w.where" },
      "w.all": { beat: "Name it", say: ["When it's everything at once, it's hard to know where to start.", "We'll pick just one piece."], next: "w.where" },
      "w.where": { beat: "Body or head", say: ["Where do you feel it most right now?"],
        choices: [["In my body: tight chest, racing heart", "w.breathe"], ["In my head: thoughts going round", "w.write"], ["I'm not sure", "w.write"]] },
      "w.breathe": { beat: "Body or head", say: ["Let's slow your body down first.", "Three slow breaths. Follow the circle."], breathe: 3, next: "w.after" },
      "w.after": { beat: "Body or head", say: ["Your thoughts can wait a minute.", "Now let's look at the worry itself."], next: "w.write" },
      "w.write": { beat: "Write it", say: ["Write down the one worry that's loudest.", "A few words is enough."], input: { placeholder: "I'm worried that…", to: "w.today" } },
      "w.today": { beat: "Look at it", echo: true, say: ["Is this something you can do something about today?"],
        choices: [["Yes, a little", "w.small"], ["Not today", "w.wait"], ["I'm not sure", "w.unsure"]] },
      "w.small": { beat: "Look at it", say: ["Pick the smallest piece of it.", "Something you could finish in about ten minutes."], input: { placeholder: "My ten-minute step is…", to: "w.faith", optional: true } },
      "w.wait": { beat: "Look at it", say: ["Then it can wait. You've written it down, so you don't have to keep holding it.", "It's okay to put it down for now."], next: "w.faith" },
      "w.unsure": { beat: "Look at it", say: ["That's okay. Worries often mix what we know with what we're guessing.", "Untangle can help you sort the two."],
        choices: [["Open Untangle", "@untangle:w.faith"], ["Skip for now", "w.faith"]] },
      "w.faith": { beat: "Faith", say: ["Would a short Bible verse help right now?"], choices: [["Yes", "w.verse"], ["Not now", "w.reach"]] },
      "w.verse": { beat: "Faith", verse: { ref: "1 Peter 5:7", quote: "Cast all your anxiety on him because he cares for you." }, say: ["You don't need perfect words to be honest with God."], next: "w.reach" },
    }, shared("w.", "I've been worrying a lot lately. Can we talk?")),
  },
  down: {
    title: "When you're feeling down",
    beats: ["Arrive", "Name it", "Body first", "Make it smaller", "How long", "Faith", "Reach out", "Check out"],
    optional: ["Make it smaller", "Faith"],
    start: "d.start",
    nodes: Object.assign({
      "d.start": { beat: "Arrive", say: ["Some days feel heavier than others.", "You don't need the right words, or a clear reason, to deserve care."], choices: [["Let's start", "d.what"]], primary: true },
      "d.what": { beat: "Name it", say: ["What feels hardest today?"],
        choices: [["Getting started: bed, messages, anything", "d.starting"], ["Keeping up with classes", "d.classes"], ["Feeling alone", "d.alone"], ["I just feel low and don't know why", "d.unknown"]] },
      "d.starting": { beat: "Name it", say: ["When everything takes extra effort, small things count.", "Opening this counts too."], next: "d.body" },
      "d.classes": { beat: "Name it", say: ["When classes pile up, it's easy to feel behind on everything.", "We'll make it smaller in a minute."], next: "d.body" },
      "d.alone": { beat: "Name it", say: ["Feeling alone can make everything heavier.", "Before we finish, we'll think about one person you could reach."], next: "d.body" },
      "d.unknown": { beat: "Name it", say: ["You don't need a reason. Low days happen."], next: "d.body" },
      "d.body": { beat: "Body first", say: ["Let's start with your body. Could you do one of these now?"],
        choices: [["Drink some water", "d.pause"], ["Step outside for a few minutes", "d.pause"], ["Stretch or open a window", "d.pause"], ["Not right now", "d.notnow"]] },
      "d.pause": { beat: "Body first", say: ["Go ahead. Take your time.", "This will be here when you're back."], pause: true, choices: [["I'm back", "d.task"], ["Skip", "d.task"]] },
      "d.notnow": { beat: "Body first", say: ["That's okay. Reading this far is a step too."], next: "d.task" },
      "d.task": { beat: "Make it smaller", say: ["Is there one task sitting on you today?"], choices: [["Yes", "d.smaller"], ["Not really", "d.howlong"]] },
      "d.smaller": { beat: "Make it smaller", say: ["Let's shrink it. Not “study for the exam”, but “open my notes and read one page”.", "What's the smallest piece?"], input: { placeholder: "The smallest piece is…", to: "d.step" } },
      "d.step": { beat: "Make it smaller", echo: true, say: ["That's your next step.", "It's okay if that's all you manage today."], next: "d.howlong" },
      "d.howlong": { beat: "How long", say: ["How long has it felt like this?"],
        choices: [["A few days", "d.faith"], ["A couple of weeks or more", "d.longer"], ["It's getting heavier", "d.longer"]] },
      "d.longer": { beat: "How long", say: ["Thank you for telling me.", "When a low feeling lasts or keeps getting heavier, it's a good time to talk to a university counsellor or another qualified professional."],
        choices: [["Open Reach Out", "@reach:d.faith"], ["Continue", "d.faith"]] },
      "d.faith": { beat: "Faith", say: ["If faith is part of your life, would a short reading help?"], choices: [["Yes", "d.verse"], ["Not now", "d.reach"]] },
      "d.verse": { beat: "Faith", verse: { ref: "Psalm 13" }, say: ["An honest prayer from someone in distress, asking God to hear them.", "You can come to God as you are. You don't have to force yourself to feel hopeful."], next: "d.reach" },
    }, shared("d.", "I've been feeling low lately. Could we talk?")),
  },
  faith: {
    title: "Questions about faith or doubt",
    beats: ["Arrive", "Name it", "Elijah", "God's quiet voice", "Your questions", "A little break", "Remember", "Reach out", "Check out"],
    optional: [],
    start: "f.start",
    nodes: Object.assign({
      "f.start": { beat: "Arrive", say: ["Have you ever felt like the world is getting too loud, but God seems distant?"],
        choices: [["Yes, that's how it feels", "f.silent"], ["Sometimes", "f.silent"], ["I'm not sure", "f.silent"]] },
      "f.silent": { beat: "Name it", say: ["It’s like He sees everything you're going through but remains silent.", "You have so many questions, yet no answers, and all you want to do is sleep it away, drown it out with music, or bury yourself in work.", "Which sounds most like you?"],
        choices: [["Sleep it away", "f.sleep"], ["Drown it out with music", "f.music"], ["Bury myself in work", "f.work"], ["Something else", "f.other"]] },
      "f.sleep": { beat: "Name it", added: true, say: ["Sleep can feel like the only break from the questions."], next: "f.elijah" },
      "f.music": { beat: "Name it", added: true, say: ["Music can fill the quiet when the quiet feels too heavy."], next: "f.elijah" },
      "f.work": { beat: "Name it", added: true, say: ["Keeping busy can feel easier than sitting with the questions."], next: "f.elijah" },
      "f.other": { beat: "Name it", added: true, say: ["Whatever you reach for, it makes sense that you want some relief."], next: "f.elijah" },
      "f.elijah": { beat: "Elijah", say: ["You're not alone in feeling this way.", "Even Elijah, a man of God, reached a point where he felt so overwhelmed that he wanted everything to end (1 Kings 19:1–18)."],
        choices: [["Continue", "f.elijah2"], ["I've felt like that too", "f.felt"]] },
      "f.felt": { beat: "Elijah", added: true, say: ["Thank you for telling me.", "If you are thinking about ending your life, or you can't keep yourself safe, please reach out to someone now."],
        choices: [["I don't feel safe right now", "@help"], ["Talk to someone", "@reach:f.elijah2"], ["Keep reading", "f.elijah2"]] },
      "f.elijah2": { beat: "Elijah", say: ["He withdrew from the chaos, exhausted and desperate for rest.", "But God didn't scold him or demand more from him."], next: "f.elijah3" },
      "f.elijah3": { beat: "Elijah", say: ["Instead, He sent an angel to provide food and strength.", "And when God finally spoke, He did so in a gentle whisper."], next: "f.quiet" },
      "f.quiet": { beat: "God's quiet voice", say: ["God's voice is quiet because He doesn't want to add to the world's noise and chaos.", "Sometimes we can miss it amidst the chaos."], next: "f.there" },
      "f.there": { beat: "God's quiet voice", say: ["Even when He seems silent, He is still there, supporting you, understanding your struggles, and reminding you that you don't have to carry everything alone.", "His plans include you and your needs, too."], next: "f.questions" },
      "f.questions": { beat: "Your questions", say: ["He will never push away your questions; He will always answer them.", "In fact, that’s what Jesus did His whole life!", "Would you like to put one of your questions into words?"],
        choices: [["Yes", "f.ask"], ["Not now", "f.break"]] },
      "f.ask": { beat: "Your questions", added: true, say: ["Write it the way it sounds in your head.", "It doesn't have to be tidy."], input: { placeholder: "My question is…", to: "f.asked" } },
      "f.asked": { beat: "Your questions", added: true, echo: true, say: ["You can bring this question to God just as it is.", "A pastor you trust can sit with it with you too."], next: "f.break" },
      "f.break": { beat: "A little break", say: ["So give yourself a little break!", "Take a nap, grab a snack as a reward, or simply take five minutes to breathe and unwind before getting back to your day.", "Never underestimate the power of a snack and some good rest!"],
        choices: [["Take a nap", "f.rest"], ["Grab a snack", "f.rest"], ["Take five minutes to breathe", "@breathe:f.remember"], ["Maybe later", "f.remember"]] },
      "f.rest": { beat: "A little break", added: true, say: ["Go ahead. Take your time.", "This will be here when you're back."], pause: true, choices: [["I'm back", "f.remember"], ["Skip", "f.remember"]] },
      "f.remember": { beat: "Remember", say: ["Remember, you are never alone.", "God has not left you to carry your burdens by yourself (Matthew 11:28; Numbers 11:10-17)."], next: "f.reach" },
    }, shared("f.", "I've had a lot of questions about my faith lately. Could we talk?")),
  },
};
// The shared reach-out and check-out screens are not in the faith reading either.
Object.keys(STORIES.faith.nodes).filter(k => /^f\.(reach|msg|noone|check|better|heavy)$/.test(k)).forEach(k => STORIES.faith.nodes[k].added = true);

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
