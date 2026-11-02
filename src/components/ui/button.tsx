import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius } from '@/shared';
import { useColors } from '@/theme/theme';
import { PressableScale, type Haptic } from './pressable-scale';
import { Text } from './text';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  haptics,
  style,
  size = 'lg',
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  haptics?: Haptic;
  style?: StyleProp<ViewStyle>;
  size?: 'md' | 'lg';
}) {
  const c = useColors();
  const look = {
    primary: { bg: c.fg, fg: c.bg, border: c.fg },
    accent: { bg: c.accent, fg: c.accentFg, border: c.accent },
    secondary: { bg: 'transparent', fg: c.fg, border: c.line },
    ghost: { bg: 'transparent', fg: c.muted, border: 'transparent' },
    danger: { bg: 'transparent', fg: c.danger, border: c.line },
  }[variant];
  const off = disabled || loading;
  return (
    <PressableScale
      onPress={onPress}
      disabled={off}
      haptics={haptics ?? (variant === 'accent' || variant === 'primary' ? 'medium' : 'light')}
      accessibilityLabel={label}
      style={[
        styles.base,
        size === 'md' && styles.md,
        { backgroundColor: look.bg, borderColor: look.border, opacity: disabled ? 0.4 : 1 },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={look.fg} /> : <Text variant="strong" style={{ color: look.fg }}>{label}</Text>}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  md: { minHeight: 44, borderRadius: radius.sm, paddingHorizontal: 14 },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
