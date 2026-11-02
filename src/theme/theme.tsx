import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { palette, type ColorName } from '@/shared';

export type Scheme = 'light' | 'dark';
export type Colors = Record<ColorName, string>;

const ForcedScheme = createContext<Scheme | null>(null);

/** Force a scheme for a subtree, e.g. night phases are always dark. */
export function SchemeOverride({ scheme, children }: { scheme: Scheme | null; children: ReactNode }) {
  return <ForcedScheme.Provider value={scheme}>{children}</ForcedScheme.Provider>;
}

export function useScheme(): Scheme {
  const forced = useContext(ForcedScheme);
  const system = useColorScheme();
  return forced ?? (system === 'dark' ? 'dark' : 'light');
}

export function useColors(): Colors {
  return palette[useScheme()];
}

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;
