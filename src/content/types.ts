import data from './content.json';

export type Contact = {
  id: string;
  name: string;
  role: 'pastor' | 'counsellor';
  church: string;
  canHelpWith: string;
  cannotHelpWith: string;
  phone: string; // empty until the reviewer verifies it
  verified: boolean;
};

export type BreathPhase = { label: string; seconds: number; motion: 'grow' | 'hold' | 'shrink'; short?: string }; // short: "In", "Hold", "Out"

export type FinishedOption = { label: string; next: 'home' | 'talkToSomeone'; hint?: string };

export type Topic = { id: string; label: string; opening: string; tips: string[]; faith: string };

// Abel's feelings-to-content taxonomy. Matching only ever uses these ids.
export type Tag = { id: string; label: string; definition: string; examplePhrases: string[] };
export type Taxonomy = {
  feelings: Tag[];
  themes: Tag[];
  needs: Tag[];
  intensity: { id: string; label: string }[]; // filtering only, never shown
};

export type LibraryItem = {
  id: string;
  type: 'tool' | 'reading' | 'scripture' | 'video' | 'audio';
  title: string;
  summary: string;
  forWhom: string; // in the student's own words; drives matching quality
  opens: { topic?: string; screen?: 'breathing' }; // exactly one
  tags: { feelings: string[]; themes: string[]; needs: string[]; intensity: string[] };
  durationMinutes: number;
  scriptureRefs: string[];
  status: 'draft' | 'inReview' | 'approved' | 'published' | 'retired';
};

export type ToolId = 'breathe' | 'untangle' | 'reachOut';

export type FeelingGroup = {
  id: string;
  tag: string;
  heading: string;
  body: string;
  tools: ToolId[]; // first is "Try this first"
  feelings: string[]; // taxonomy feeling ids that open this page
};

export type HelpNumber ={ label: string; number: string; verified: boolean };

export type ReachOutNeed = { id: string; label: string; sub: string; casual: string[]; open: string[] };

export type DemoRoute = '/check-in' | '/topics' | '/untangle' | '/reach-out' | '/breathing' | '/finished' | '/talk-to-someone' | '/need-help' | '/adults-only';

export type Content = {
  reviewStatus: string;
  reviewNotes: string[];
  home: { title: string };
  common: { back: string; needHelpLink: string; needHelpLinkHint: string };
  welcome: {
    title: string;
    body: string;
    basis?: string;
    notEmergency: string;
    continue: string;
    ageTag: string;
    ageQuestion: string;
    ageBody: string;
    adult: string;
    underAge: string;
    inDanger: string;
    answerStays: string;
    back: string;
  };
  adultsOnly: { message: string; whereToGetHelp: string; cardTitle: string; inDanger?: string; goBack: string };
  checkIn: {
    prompt: string;
    feelingsHint: string;
    typeLabel: string;
    typePlaceholder: string;
    typeNote: string;
    find: string;
    unsafe: string;
    unsafeHint: string;
    chips: { label: string; feeling: string }[]; // feeling: a taxonomy feeling id
  };
  topics: {
    prompt: string;
    intro: string;
    tryThis: string;
    faithShow: string;
    faithHint: string;
    breathe: string;
    talk: string;
    other: string;
    otherHint: string;
    reachOut: string;
    urgent: string;
    disclaimer: string;
    list: Topic[];
  };
  tools: Record<ToolId, { title: string; body: string }>;
  feelingPages: { tryFirst: string; orTry: string; start: string; readingMeta: string; groups: FeelingGroup[] };
  untangle: {
    title: string;
    intro: string;
    begin: string;
    next: string;
    done: string;
    another: string;
    stepOf: string;
    steps: { title: string; body: string }[]; // one card per step on the intro
    useExample: string;
    name: { title: string; body: string; label: string; placeholder: string; examplesLabel: string; examples: string[]; note: string };
    stepBack: { title: string; body: string; prefix: string; further: string; prefix2: string; note: string; button: string };
    knowGuess: {
      title: string;
      body: string;
      know: string;
      guess: string;
      moreLabel: string;
      morePlaceholder: string;
      allKnown: string;
      guessOne: string;
      guessMany: string;
    };
    friend: { title: string; body: string; label: string; placeholder: string; example: string };
    balanced: { title: string; body: string; label: string; placeholder: string; example: string };
    nextStep: {
      title: string;
      body: string;
      label: string;
      placeholder: string;
      example: string;
      whenLabel: string;
      when: string[];
      see: string;
    };
    summary: { heading: string; thought: string; balanced: string; step: string; returns: string; help: string };
  };
  // Reach Out: a short kind moment, then help with the words. Nothing written is saved; Send opens the phone's share menu.
  reachOut: {
    title: string;
    moment: {
      heading: string;
      body: string;
      lines: { text: string; note: string }[];
      lineOf: string;
      next: string;
      continue: string;
      skip: string;
    };
    needs: { heading: string; body: string; options: ReachOutNeed[] };
    message: {
      heading: string;
      body: string;
      label: string;
      toneLabel: string;
      casual: string;
      open: string;
      wordingOf: string;
      another: string;
      send: string;
      sendHint: string;
      who: string;
      help: string;
      talk: string;
      back: string;
      note: string;
    };
  };

  taxonomy: Taxonomy;
  library: LibraryItem[];
  safety: { crisisPhrases: string[]; crisisEndings: string[] }; // reviewed by a qualified professional before launch; endings count only at the end of a sentence
  matching: {
    calmFirst: string[]; // feeling ids that put the quick tool before any reading
    goodFeelings: string[]; // feeling ids that get a kind reply instead of help options
    good: { heading: string; message: string; done: string };
    headingFeeling: string;
    headingFeelingTheme: string;
    headingTheme: string;
    headingNone: string;
    more: string;
    notReplacement: string;
    noMatch: string;
    closest: string; // nothing recognised at all: ask for the closest feeling
    meaningThreshold: number; // 0..1, how close in meaning a typed sentence must be to add a tag
    breathe: string;
    talk: string;
    browse: string;
    types: Record<LibraryItem['type'], string>;
    minutes: string;
  };
  breathing: {
    title: string;
    intro: string;
    phases: BreathPhase[];
    minutes: number[]; // the lengths offered, in minutes
    defaultMinutes: number;
    pause: string;
    resume: string;
    stop: string;
    length: string;
    lengthOption: string; // "{n} min"
    lengthHint: string;
    timeLeft: string; // "{time} left"
    seconds: string; // "{n}s"
    patternLabel: string; // "{label} {n} seconds", read out once for the whole pattern
  };

  finished: { message?: string; prompt: string; options: FinishedOption[] };
  talkToSomeone: {
    title: string;
    note: string;
    roles: Record<Contact['role'], string>;
    canHelpWith: string;
    cannotHelpWith: string;
    call: string;
    message: string;
    pending: string;
    pendingWhatNow: string;
    noContacts: string;
    openFailed: string;
    needHelpNow: string;
    contacts: Contact[];
  };
  demo: {
    title: string;
    note: string;
    firstTime: string;
    startHome: string;
    jumpHeading: string;
    screens: { label: string; route: DemoRoute }[];
    breathingSeconds: number[];
    callNote: string;
    testNumber: string; // "{number}" is the demo contact's obviously fake test number
    modelCheck: {
      heading: string;
      states: Record<'idle' | 'loading' | 'off' | 'ready' | 'failed', string>;
      refresh: string;
      tryLabel: string;
      run: string;
      tags: string;
      top: string;
      none: string;
      unavailable: string;
      golden: string;
      goldenRow: string;
      missesHeading: string;
      alarmsHeading: string;
      current: string;
    };
    contacts: (Contact & { tappable?: boolean })[]; // tappable: shows a note instead of dialling
  };
  needHelp: {
    title: string;
    message: string;
    emergencyHeading: string;
    helplinesHeading: string;
    peopleHeading: string;
    emergencyNumbers: HelpNumber[];
    helplines: HelpNumber[];
    pendingMessage: string;
    call: string;
    callHint: string;
    talk: string;
    home: string;
  };
};

// JSON widens "kind" etc. to string, so a cast is needed. Keep this type in step with content.json.
export const content = data as Content;
