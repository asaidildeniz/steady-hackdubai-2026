// Section 7 of the build guide, with the team's palette from Samuel's design deck. System font only, nothing to download.
export const colors = {
  background: '#F4F7FA', // soft background
  text: '#1E2A33',
  muted: '#56636E', // 5.7:1 on the background
  accent: '#EFE56F', // soft yellow: button fills only, always with dark text, never as text colour
  calm: '#7EC0EE', // calm blue: the breathing circle only
  needHelp: '#3A3A3A',
  needHelpText: '#F4F7FA',
};

export const type = {
  body: 20,
  title: 24, // a card's heading, e.g. a contact's name
  heading: 32,
  button: 20,
};

export const text = {
  heading: { fontSize: type.heading, fontWeight: '700', color: colors.text },
  title: { fontSize: type.title, fontWeight: '700', color: colors.text },
  body: { fontSize: type.body, color: colors.text },
  note: { fontSize: type.body, color: colors.muted },
} as const;

export const space = {
  screen: 24,
  gap: 16,
  tap: 56, // minimum tap target height
};
