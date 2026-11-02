// Copied from backend/src/shared/design.ts by scripts/sync-shared.mjs. Don't edit here.

// Design tokens shared by the mobile app and the web client.
// Follows Emil Kowalski's approach: quiet neutrals, one accent, fast ease-out
// motion, springs only where a gesture drives the movement.

export const palette = {
  light: {
    bg: '#FAFAF9',
    surface: '#FFFFFF',
    raised: '#F5F5F4',
    fg: '#0C0A09',
    muted: '#78716C',
    faint: '#A8A29E',
    line: '#E7E5E4',
    accent: '#FF5A1F',
    accentFg: '#FFFFFF',
    danger: '#E5484D',
    success: '#30A46C',
  },
  dark: {
    bg: '#0C0A09',
    surface: '#1C1917',
    raised: '#292524',
    fg: '#FAFAF9',
    muted: '#A8A29E',
    faint: '#78716C',
    line: '#292524',
    accent: '#FF6B35',
    accentFg: '#FFFFFF',
    danger: '#EC5D5E',
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

export const radius = { sm: 10, md: 14, lg: 20, xl: 28 } as const;
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
