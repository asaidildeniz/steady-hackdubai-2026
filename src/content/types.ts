import data from './content.json';

export type MoodGroup = 'kind' | 'gentle' | 'urgent';

export type Mood = { id: string; label: string; group: MoodGroup };

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

export type BreathPhase = { label: string; seconds: number; motion: 'grow' | 'hold' | 'shrink' };

export type FinishedOption = { label: string; next: 'home' | 'talkToSomeone'; hint?: string };

export type HelpNumber = { label: string; number: string; verified: boolean };

export type DemoRoute = '/check-in' | '/breathing' | '/finished' | '/talk-to-someone' | '/need-help' | '/adults-only';

export type Content = {
  reviewStatus: string;
  reviewNotes: string[];
  home: { title: string; checkIn: string; calm: string; talk: string };
  needHelpButton: { label: string; hint: string };
  welcome: {
    title: string;
    body: string;
    notEmergency: string;
    continue: string;
    ageQuestion: string;
    adult: string;
    underAge: string;
    inDanger: string;
    answerStays: string;
    back: string;
  };
  adultsOnly: { message: string; whereToGetHelp: string; inDanger?: string };
  checkIn: { prompt: string; moods: Mood[] };
  results: Record<'kind' | 'gentle', { message: string; primary: string; secondary: string }>;
  breathing: {
    title: string;
    stop: string;
    intro: string;
    progress: string;
    phases: BreathPhase[];
    cycles: number;
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
    contact: Contact;
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
