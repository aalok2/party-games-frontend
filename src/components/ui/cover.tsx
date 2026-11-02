// The signature device: a charcoal cover over something secret. Hold to slide it away, release to cover again.

import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { radius } from '@/shared';
import { easeInOut } from '@/theme/motion';
import { useColors } from '@/theme/theme';
import { haptic } from './pressable-scale';

/** Wraps `children`; they stay hidden until the cover is held. Reduced motion fades instead of sliding. */
export function Cover({ children, label, padding = 10 }: { children: ReactNode; label: string; padding?: number }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const open = useSharedValue(0);
  const style = useAnimatedStyle(() =>
    reduced ? { opacity: 1 - open.get() } : { transform: [{ translateX: open.get() * (width + 8) }] },
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Hold to reveal"
      onPressIn={() => {
        haptic('light');
        open.set(withTiming(1, { duration: 380, easing: easeInOut }));
      }}
      onPressOut={() => open.set(withTiming(0, { duration: 260, easing: easeInOut }))}
    >
      <View style={[styles.clip, { paddingHorizontal: padding }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {children}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.bar, { backgroundColor: c.ink }, style]} />
      </View>
    </Pressable>
  );
}

/** A small static cover: "something is hidden here" (an undealt role, for example). */
export function CoverPill({ width = 54, height = 22 }: { width?: number; height?: number }) {
  const c = useColors();
  return <View accessibilityElementsHidden style={{ width, height, borderRadius: radius.pill, backgroundColor: c.ink }} />;
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden', borderRadius: radius.pill, alignSelf: 'flex-start' },
  bar: { borderRadius: radius.pill },
});
