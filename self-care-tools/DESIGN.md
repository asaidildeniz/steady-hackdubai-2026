# Design — Steady

**Direction (2026-10-27):** a Swiss / International Typographic Style layout, using the palette and type of
the brand reference Abel supplied (blue ink on cream, Space Grotesk, hand-drawn line doodles).
Tone: calm, warm, non-clinical. Not gamified: no streaks, scores, or nagging.

## Colour tokens (`css/styles.css :root`), LOCKED
These were sampled from the reference image.

| Token | Hex | Role |
|---|---|---|
| `--blue` | #1C19A8 | Ink: all text, rules, borders, primary buttons (light mode) |
| `--cream` | #F7F3E8 | Page background (light), and ink in dark mode |
| `--coffee` | #2A211C | Page background in dark mode |
| `--sky` | #B1D4F0 | Breathe accent |
| `--neon` | #E3F50D | Untangle accent; focus ring in dark mode |
| `--orange` | #FFA042 | Reach Out accent |

- Each tool sets `--accent` via `body[data-tool]`.
- Text on an accent fill is always `--on-accent`: blue in light mode, coffee in dark mode. Never put cream text on accents.

## Typography
- One family only: **Space Grotesk** (300 / 400 / 500 / 700). Falls back to Helvetica Neue / Arial.
- Display: 700 weight with tight tracking (−0.035 to −0.06em). Hero up to 6.2rem; the tool numbers 01/02/03 are 3–5.5rem.
- Captions: 0.72rem uppercase with +0.12em tracking (`.label`, `.tag`, `.step-count`).
- Body: 17px with 1.5 line height, max 60ch per line.

## Grid and structure
- 1120px max width; 16px gutters on mobile, 32px from 720px up.
- The menu is a table-like index on a 4-column grid (No. / Tool / For / Time) with 2px rules between rows.
- Tool pages use a 3/9 split from 900px up. The left column holds the tool number, name, and doodle in a sticky column with a 2px vertical rule. On mobile it collapses into a horizontal header.
- Everything is flush-left and ragged-right. Asymmetry is intended.

## Components
- Corners are square everywhere; the only circles are the breathing orb and the swatch dots.
- Buttons are solid blue with a → glyph. Ghost buttons have a 2px outline. Links are underlined text.
- Choices are full-width list rows between rules. A selected row fills with the accent colour.
- Progress bars are outlined boxes with an accent fill.

## Motion
- Views rise in over 0.45s.
- Hovering a menu row wipes the accent colour up from the bottom.
- The orb scales with ease-in-out over each breath phase.
- `prefers-reduced-motion` turns off animation, and the orb stays still.

## Illustration
- Inline SVG line doodles: a 2.6px round-capped stroke in currentColor, plus one accent-coloured blob.
- They're the only loose, hand-made element in an otherwise strict grid. Use one per view at most, and never behind text.

## Do / don't
- Do keep the copy short, honest, and optional.
- Don't use drop shadows, gradients, rounded cards, or emoji.
