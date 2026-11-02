// Copied from backend/src/shared/design.ts by scripts/sync-shared.mjs. Don't edit here.

// Design tokens shared by the mobile app and the web client.
// "Ember": warm grey ground, white soft-raised surfaces, glossy charcoal actions,
// one burnt-orange accent. Secrets sit behind a charcoal cover that slides away.
// Motion stays fast ease-out; springs only where a gesture drives the movement.

export const palette = {
  light: {
    bg: '#E9E7E8', // the ground everything sits on
    surface: '#FFFFFF', // raised sheets and cards
    raised: '#F5F3F3', // chips, segmented tracks, pressed rows
    inset: '#E0DDDE', // pressed-in fields and the room code well
    fg: '#221412',
    muted: '#6B5A55',
    faint: '#A39690',
    line: 'rgba(34,20,18,0.10)',
    accent: '#C93E0A',
    accentFg: '#FFFFFF',
    edge: '#FFFFFF', // 1px top light on raised surfaces
    shadow: '#46231A', // shadow colour; opacity set per use
    ink: '#1F1B1B', // primary button and cover fill
    inkFg: '#FFFFFF',
    danger: '#D6232E',
    success: '#12805C',
  },
  dark: {
    bg: '#0E0908',
    surface: '#221715',
    raised: '#2A1D1A',
    inset: '#0A0605',
    fg: '#FBEFEA',
    muted: '#C2A59C',
    faint: '#7A5F57',
    line: 'rgba(255,255,255,0.10)',
    accent: '#FF8A55',
    accentFg: '#1F0E07',
    edge: 'rgba(255,255,255,0.08)',
    shadow: '#000000',
    ink: '#FFFFFF',
    inkFg: '#221412',
    danger: '#FF6B73',
    success: '#3DD68C',
  },
} as const;

export type ColorName = keyof (typeof palette)['light'];

/** Player avatar colours, indexed by RoomPlayer.tone. */
export const tones = [
  '#FF5A1F',
  '#F5A524',
  '#30A46C',
  '#12A594',
  '#0090FF',
  '#3E63DD',
  '#8E4EC6',
  '#D6409F',
  '#E5484D',
  '#AD7F58',
  '#5B5BD6',
  '#29A383',
] as const;

export const radius = { sm: 12, md: 18, lg: 26, xl: 34, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const fontSize = { caption: 13, body: 15, lead: 17, title: 22, display: 30, hero: 44 } as const;

export const motion = {
  /** Strong ease-out: things entering or responding to the user. */
  easeOut: [0.23, 1, 0.32, 1] as const,
  /** Things moving between two on-screen positions. */
  easeInOut: [0.77, 0, 0.175, 1] as const,
  /** Milliseconds. UI motion stays under 300ms. */
  duration: { press: 160, fast: 180, base: 240, slow: 300 },
  pressScale: 0.97,
  /** For gesture-driven movement (card flips, sheets). No visible bounce. */
  spring: { damping: 26, stiffness: 320, mass: 1 },
} as const;
