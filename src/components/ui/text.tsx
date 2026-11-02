import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { fontSize } from '@/shared';
import { fonts, useColors, type Colors } from '@/theme/theme';

const variants = {
  hero: { fontSize: fontSize.hero, lineHeight: 46, fontFamily: fonts.bold, letterSpacing: -2 },
  display: { fontSize: fontSize.display, lineHeight: 36, fontFamily: fonts.bold, letterSpacing: -0.8 },
  title: { fontSize: fontSize.title, lineHeight: 28, fontFamily: fonts.semibold, letterSpacing: -0.4 },
  lead: { fontSize: fontSize.lead, lineHeight: 24, fontFamily: fonts.medium, letterSpacing: -0.2 },
  body: { fontSize: fontSize.body, lineHeight: 22, fontFamily: fonts.regular },
  strong: { fontSize: fontSize.body, lineHeight: 22, fontFamily: fonts.semibold },
  caption: { fontSize: fontSize.caption, lineHeight: 18, fontFamily: fonts.medium },
  label: { fontSize: 13, lineHeight: 18, fontFamily: fonts.semibold },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof variants;

export function Text({
  variant = 'body',
  tone = 'fg',
  align,
  numeric,
  style,
  ...rest
}: TextProps & { variant?: TextVariant; tone?: keyof Colors; align?: TextStyle['textAlign']; numeric?: boolean }) {
  const colors = useColors();
  return (
    <RNText
      {...rest}
      style={[variants[variant], { color: colors[tone], textAlign: align }, numeric && styles.numeric, style]}
    />
  );
}

const styles = StyleSheet.create({ numeric: { fontVariant: ['tabular-nums'] } });
