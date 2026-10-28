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

export type HelpNumber = { label: string; number: string; verified: boolean };

export type Content = {
  reviewStatus: string;
  home: { title: string };
  needHelpButton: { label: string; hint: string };
  welcome: { title: string; body: string; notEmergency: string };
  adultsOnly: { message: string; whereToGetHelp: string };
  checkIn: { prompt: string; moods: Mood[] };
  results: Record<'kind' | 'gentle', { message: string }>;
  breathing: { phases: { label: string; seconds: number }[]; cycles: number };
  finished: { prompt: string; options: string[] };
  talkToSomeone: { note: string; contacts: Contact[] };
  needHelp: {
    message: string;
    emergencyNumbers: HelpNumber[];
    helplines: HelpNumber[];
    pendingMessage: string;
  };
};

// JSON widens "kind" etc. to string, so a cast is needed. Keep this type in step with content.json.
export const content = data as Content;
