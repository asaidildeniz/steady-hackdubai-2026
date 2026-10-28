// Section 7 of the build guide. System font only, nothing to download.
export const colors = {
  background: '#F5F2ED',
  text: '#121212',
  muted: '#6B6B6B',
  accent: '#EFE56F', // button fills only, always with dark text, never as text colour
  needHelp: '#121212',
  needHelpText: '#F5F2ED',
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
