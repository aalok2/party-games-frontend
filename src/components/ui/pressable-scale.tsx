import * as Haptics from 'expo-haptics';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { motion, timing } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type Haptic = 'light' | 'medium' | 'select' | 'none';

export function haptic(kind: Haptic) {
  if (Platform.OS === 'web' || kind === 'none') return;
  if (kind === 'select') void Haptics.selectionAsync();
  else void Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
}

/** Every tappable thing: scales to 0.97 while pressed so the UI feels like it's listening. */
export function PressableScale({
  style,
  haptics = 'light',
  scaleTo = motion.pressScale,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; haptics?: Haptic; scaleTo?: number }) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
      accessibilityState={{ disabled: !!disabled }}
      onPressIn={(e) => {
        scale.set(withTiming(scaleTo, timing(motion.duration.press)));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withTiming(1, timing(motion.duration.press)));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        haptic(haptics);
        onPress?.(e);
      }}
      style={[style, animated]}
    />
  );
}
