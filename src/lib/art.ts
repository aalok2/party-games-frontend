import type { ImageSourcePropType } from 'react-native';
import type { Scheme } from '@/theme/theme';

// Pre-rendered blurred colour art (see scripts/make-art.mjs). Static requires so Metro bundles them.
const art = {
  hero: { light: require('../../assets/art/hero-light.png'), dark: require('../../assets/art/hero-dark.png') },
  mafia: { light: require('../../assets/art/mafia-light.png'), dark: require('../../assets/art/mafia-dark.png') },
  imposter: { light: require('../../assets/art/imposter-light.png'), dark: require('../../assets/art/imposter-dark.png') },
} as const;

export function heroArt(scheme: Scheme): ImageSourcePropType {
  return art.hero[scheme];
}

/** Art for a game by id; unknown games fall back to the Mafia mesh until they get their own. */
export function gameArt(id: string, scheme: Scheme): ImageSourcePropType {
  const key = id in art ? (id as 'mafia' | 'imposter') : 'mafia';
  return art[key][scheme];
}
