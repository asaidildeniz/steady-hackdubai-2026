// "Steady — App Screens v3": warm off-white, sage and teal, with a soft card colour per tool.
// DM Sans is bundled with the app (assets/fonts, Open Font License), so nothing is downloaded.
export const colors = {
  background: '#F8F4EE', // warm off-white
  backgroundLow: '#DCE7E1', // bottom of the soft gradient on calm screens
  surface: '#FFFFFF',
  text: '#2B3A34', // deep green-grey
  muted: '#55635C', // 5.9:1 on the background
  primary: '#3E6E6A', // teal: main buttons and Start, always with white text (5.6:1)
  onPrimary: '#FFFFFF',
  line: '#E2DED6', // outline of white buttons
  chip: '#DCE7DE', // sage chips and the Breathe card
  chipText: '#2F4A40',
  breathe: '#DCE7DE',
  untangle: '#DCE5EF',
  untangleInk: '#3D5A80',
  reachOut: '#E6E1F3',
  reachOutInk: '#5B4A8C',
  disabled: '#E6E2D9',
  disabledText: '#7C847F',
  // Kept for screens not yet redrawn: the safety screen and demo tools use them.
  accent: '#3E6E6A',
  calm: '#A9C4CC',
  needHelp: '#2B3A34',
  needHelpText: '#F8F4EE',
  // Only the emergency call buttons are red (option D, 11 Nov): a deep brick, so it stands out without shouting.
  emergency: '#B23A2B', // white text on it is 5.9:1
  onEmergency: '#FFFFFF',
};

export const fonts = {
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  bold: 'DMSans-Bold',
};

export const type = {
  body: 18,
  small: 15,
  title: 22, // a card's heading
  heading: 32,
  button: 18,
};

// Android ignores fontWeight with custom fonts, so each weight is its own family.
export const text = {
  heading: { fontSize: type.heading, lineHeight: 40, fontFamily: fonts.medium, color: colors.text },
  title: { fontSize: type.title, lineHeight: 28, fontFamily: fonts.medium, color: colors.text },
  body: { fontSize: type.body, lineHeight: 26, fontFamily: fonts.regular, color: colors.text },
  note: { fontSize: type.small, lineHeight: 22, fontFamily: fonts.regular, color: colors.muted },
} as const;

export const space = {
  screen: 24,
  gap: 16,
  tap: 56, // minimum tap target height
};

export const radius = { pill: 999, card: 24, row: 20 };
