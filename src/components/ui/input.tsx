import { Platform, StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { fontSize, radius } from '@/shared';
import { fonts, useColors } from '@/theme/theme';

export function Input({ style, ...rest }: TextInputProps) {
  const c = useColors();
  return (
    <TextInput
      placeholderTextColor={c.faint}
      selectionColor={c.accent}
      {...rest}
      style={[styles.input, { color: c.fg, backgroundColor: c.surface, borderColor: c.line }, Platform.OS === 'web' && styles.web, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: 16,
    fontSize: fontSize.lead,
    fontFamily: fonts.medium,
  },
  web: { outlineWidth: 0 },
});
