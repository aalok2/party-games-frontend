import { ActivityIndicator, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius } from '@/shared';
import { useColors } from '@/theme/theme';
import { PressableScale, type Haptic } from './pressable-scale';
import { Text } from './text';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';

/** Pill buttons. Primary is the glossy charcoal action; accent is reserved for the single "go" moment. */
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
    primary: { bg: c.ink, fg: c.inkFg, raised: true },
    accent: { bg: c.accent, fg: c.accentFg, raised: true },
    secondary: { bg: c.surface, fg: c.fg, raised: true },
    ghost: { bg: 'transparent', fg: c.muted, raised: false },
    danger: { bg: 'transparent', fg: c.danger, raised: false },
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
        { backgroundColor: look.bg, opacity: disabled ? 0.45 : 1 },
        look.raised && { shadowColor: c.shadow, shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: look.raised ? 2 : 0 },
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
    minHeight: 56,
    borderRadius: radius.pill,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  md: { minHeight: 44, paddingHorizontal: 18 },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
