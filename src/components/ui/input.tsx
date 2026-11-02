import { useState } from 'react';
import { Platform, StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { fontSize, radius } from '@/shared';
import { fonts, useColors } from '@/theme/theme';

/** A pressed-in field: tinted well, no outline until focused. */
export function Input({ style, onFocus, onBlur, ...rest }: TextInputProps) {
  const c = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={c.faint}
      selectionColor={c.accent}
      {...rest}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        styles.input,
        { color: c.fg, backgroundColor: c.inset, borderColor: focused ? c.accent : 'transparent' },
        Platform.OS === 'web' && styles.web,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: 18,
    fontSize: fontSize.lead,
    fontFamily: fonts.medium,
  },
  web: { outlineWidth: 0 },
});
