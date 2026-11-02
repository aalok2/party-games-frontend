// Inputs for lobby house rules: number stepper, on/off switch, segmented choice.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { radius } from '@/shared';
import { timing } from '@/theme/motion';
import { useColors } from '@/theme/theme';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export function Stepper({
  value,
  min = 0,
  max = 99,
  step = 1,
  unit,
  disabled,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  onChange(v: number): void;
}) {
  const c = useColors();
  const label = unit === 's' && value >= 60 ? `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}` : `${value}${unit ?? ''}`;
  const btn = (sign: -1 | 1) => {
    const next = value + sign * step;
    const off = disabled || next < min || next > max;
    return (
      <PressableScale
        haptics="select"
        disabled={off}
        onPress={() => onChange(next)}
        accessibilityLabel={sign < 0 ? 'Decrease' : 'Increase'}
        style={[styles.stepBtn, { borderColor: c.line, opacity: off ? 0.35 : 1 }]}
      >
        <Text variant="lead">{sign < 0 ? '−' : '+'}</Text>
      </PressableScale>
    );
  };
  return (
    <View style={styles.stepper}>
      {btn(-1)}
      <Text variant="strong" align="center" numeric style={styles.stepValue}>
        {label}
      </Text>
      {btn(1)}
    </View>
  );
}

export function Toggle({ value, disabled, onChange }: { value: boolean; disabled?: boolean; onChange(v: boolean): void }) {
  const c = useColors();
  const on = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    on.set(withTiming(value ? 1 : 0, timing(180)));
  }, [value, on]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(on.get(), [0, 1], [c.line, c.accent]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: on.get() * 20 }] }));
  return (
    <PressableScale
      haptics="select"
      disabled={disabled}
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.knob, knob]} />
      </Animated.View>
    </PressableScale>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  disabled,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  disabled?: boolean;
  onChange(v: T): void;
}) {
  const c = useColors();
  return (
    <View style={[styles.segments, { backgroundColor: c.raised }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <PressableScale
            key={String(o.value)}
            haptics="select"
            disabled={disabled}
            onPress={() => onChange(o.value)}
            accessibilityState={{ selected: active, disabled }}
            style={[styles.segment, active && { backgroundColor: c.surface, borderColor: c.line }]}
          >
            <Text variant="caption" tone={active ? 'fg' : 'muted'}>
              {o.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { minWidth: 44 },
  track: { width: 48, height: 28, borderRadius: 14, padding: 2 },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  segments: { flexDirection: 'row', borderRadius: radius.sm, padding: 3 },
  segment: {
    minWidth: 44,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: radius.sm - 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
});
