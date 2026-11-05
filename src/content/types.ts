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

export type HelpNumber ={ label: string; number: string; verified: boolean };

export type DemoRoute = '/check-in' | '/topics' | '/breathing' | '/finished' | '/talk-to-someone' | '/need-help' | '/adults-only';

export type Content = {
  reviewStatus: string;
  reviewNotes: string[];
  home: { title: string };
  common: { back: string };
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
  taxonomy: Taxonomy;
  library: LibraryItem[];
  safety: { crisisPhrases: string[] }; // reviewed by a qualified professional before launch
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
