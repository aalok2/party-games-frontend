import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useColors } from '@/theme/theme';

/** Drains smoothly from the time left to zero. Time is linear; everything else eases. */
export function TimerBar({ endsAt, durationMs }: { endsAt: number | null; durationMs: number | null }) {
  const c = useColors();
  const progress = useSharedValue(1);
  useEffect(() => {
    if (!endsAt || !durationMs) {
      progress.set(1);
      return;
    }
    const left = Math.max(0, endsAt - Date.now());
    progress.set(left / durationMs);
    progress.set(withTiming(0, { duration: left, easing: Easing.linear }));
  }, [endsAt, durationMs, progress]);
  const fill = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.get() }],
    backgroundColor: progress.get() < 0.2 ? c.danger : c.accent,
  }));
  if (!endsAt) return <View style={[styles.track, { backgroundColor: 'transparent' }]} />;
  return (
    <View style={[styles.track, { backgroundColor: c.line }]}>
      <Animated.View style={[styles.fill, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 3, borderRadius: 2, overflow: 'hidden' },
  fill: { flex: 1, transformOrigin: 'left' },
});
