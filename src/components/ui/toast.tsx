// Sonner-style toasts: newest at the bottom, quick fade-up in, auto-dismiss, tap to close.

import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { radius } from '@/shared';
import { easeOut } from '@/theme/motion';
import { useColors } from '@/theme/theme';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

interface Toast {
  id: number;
  text: string;
  tone: 'default' | 'error';
}

const useToasts = create<{ items: Toast[] }>(() => ({ items: [] }));
let nextId = 1;

function dismiss(id: number) {
  useToasts.setState((s) => ({ items: s.items.filter((t) => t.id !== id) }));
}

export function toast(text: string, tone: Toast['tone'] = 'default') {
  const id = nextId++;
  useToasts.setState((s) => ({ items: [...s.items.slice(-2), { id, text, tone }] }));
  setTimeout(() => dismiss(id), 3200);
}

/** Show an error from a failed request. */
export const toastError = (e: unknown) => toast(e instanceof Error ? e.message : 'Something went wrong', 'error');

export function Toaster() {
  const items = useToasts((s) => s.items);
  const insets = useSafeAreaInsets();
  const c = useColors();
  return (
    <View pointerEvents="box-none" style={[styles.host, { bottom: insets.bottom + 88 }]}>
      {items.map((t) => (
        <Animated.View
          key={t.id}
          entering={FadeInDown.duration(220).easing(easeOut)}
          exiting={FadeOut.duration(160)}
          layout={LinearTransition.duration(200).easing(easeOut)}
        >
          <PressableScale
            onPress={() => dismiss(t.id)}
            haptics="none"
            accessibilityRole="alert"
            style={[styles.toast, { backgroundColor: c.fg }]}
          >
            {t.tone === 'error' ? <View style={[styles.dot, { backgroundColor: c.danger }]} /> : null}
            <Text variant="strong" style={{ color: c.bg, flexShrink: 1 }}>
              {t.text}
            </Text>
          </PressableScale>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, alignItems: 'center', gap: 8 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    maxWidth: 480,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
