// Press and hold to see your role, so friends sitting next to you can't read it.
// The flip follows the finger (a spring), and falls back to a fade with reduced motion.
// `compact` is a slim bar for mid-game peeks that leaves room for the clues and votes.

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { radius, space, type MatchView, type RoomPlayer } from '@/shared';
import { Avatar } from '@/components/ui/avatar';
import { haptic, PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { spring, timing } from '@/theme/motion';
import { useColors } from '@/theme/theme';

const INFO_LABELS: Record<string, string> = { word: 'Secret word', category: 'Category' };

export function RoleCard({ me, players, compact }: { me: MatchView['me']; players: RoomPlayer[]; compact?: boolean }) {
  const role = me.role;
  const allies = me.allies.map((a) => players.find((p) => p.id === a.playerId)).filter((p): p is RoomPlayer => !!p);

  if (compact) {
    const detail = [role?.name, ...Object.values(me.info)].filter(Boolean).join(' · ');
    return (
      <Flip
        height={64}
        label="Hold to peek at your role"
        hint={detail}
        front={(c) => (
          <View style={styles.bar}>
            <Text variant="label" style={{ color: c.inkFg, opacity: 0.6 }}>
              Your role
            </Text>
            <Text variant="strong" style={{ color: c.inkFg }}>
              Hold to peek
            </Text>
          </View>
        )}
        back={() => (
          <View style={styles.bar}>
            <Text variant="strong" numberOfLines={1} style={{ flexShrink: 1 }}>
              {detail || 'Watching'}
            </Text>
            <View style={styles.allies}>
              {allies.map((p) => (
                <Avatar key={p.id} name={p.name} tone={p.tone} size={24} />
              ))}
            </View>
          </View>
        )}
      />
    );
  }

  return (
    <Flip
      height={340}
      label="Hold to see your role"
      hint={role ? `Your role is ${role.name}` : undefined}
      front={(c) => (
        <>
          <View style={[styles.pattern, { borderColor: c.inkFg }]} />
          <Text variant="label" style={{ color: c.inkFg, opacity: 0.6 }}>
            Your role
          </Text>
          <Text variant="title" align="center" style={{ color: c.inkFg }}>
            Hold to reveal
          </Text>
          <Text variant="caption" align="center" style={{ color: c.inkFg, opacity: 0.6 }}>
            Keep it hidden from the others
          </Text>
        </>
      )}
      back={() =>
        role ? (
          <>
            {role.teamName !== role.name && (
              <Text variant="label" tone="muted">
                {role.teamName}
              </Text>
            )}
            <Text variant="display" align="center">
              {role.name}
            </Text>
            {Object.entries(me.info).map(([k, v]) => (
              <View key={k} style={styles.info}>
                <Text variant="caption" tone="muted">
                  {INFO_LABELS[k] ?? k}
                </Text>
                <Text variant={k === 'word' ? 'title' : 'lead'} align="center">
                  {v}
                </Text>
              </View>
            ))}
            <Text variant="body" tone="muted" align="center">
              {role.description}
            </Text>
            {allies.length > 0 && (
              <View style={styles.allyList}>
                {allies.map((p) => (
                  <View key={p.id} style={styles.ally}>
                    <Avatar name={p.name} tone={p.tone} size={22} />
                    <Text variant="caption">{p.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <Text variant="lead" tone="muted">
            You’re watching this one
          </Text>
        )
      }
    />
  );
}

type Faces = (c: ReturnType<typeof useColors>) => ReactNode;

function Flip({ height, label, hint, front, back }: { height: number; label: string; hint?: string; front: Faces; back: Faces }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const shown = useSharedValue(0);
  const compact = height < 100;

  const reveal = (on: boolean) => {
    if (on) haptic('medium');
    shown.set(reduced ? withTiming(on ? 1 : 0, timing(160)) : withSpring(on ? 1 : 0, spring));
  };

  // The bar flips on its short axis so it doesn't swing past the screen edge.
  const turn = (deg: number) => {
    'worklet';
    return compact ? { rotateX: `${deg}deg` } : { rotateY: `${deg}deg` };
  };
  const frontStyle = useAnimatedStyle(() =>
    reduced
      ? { opacity: 1 - shown.get() }
      : { transform: [{ perspective: 900 }, turn(interpolate(shown.get(), [0, 1], [0, 180]))] },
  );
  const backStyle = useAnimatedStyle(() =>
    reduced
      ? { opacity: shown.get() }
      : { transform: [{ perspective: 900 }, turn(interpolate(shown.get(), [0, 1], [180, 360]))] },
  );

  const face = [styles.face, compact ? styles.faceCompact : styles.faceFull, { height }];
  return (
    <PressableScale
      haptics="none"
      scaleTo={0.98}
      onPressIn={() => reveal(true)}
      onPressOut={() => reveal(false)}
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={{ height }}
    >
      <Animated.View style={[face, { backgroundColor: c.ink }, frontStyle]}>{front(c)}</Animated.View>
      <Animated.View style={[face, styles.back, { backgroundColor: c.surface, borderColor: c.line, shadowColor: c.shadow }, backStyle]}>
        {back(c)}
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  face: { ...StyleSheet.absoluteFill, backfaceVisibility: 'hidden', overflow: 'hidden' },
  faceFull: { borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', gap: space.sm, padding: space.xl },
  faceCompact: { borderRadius: radius.lg, justifyContent: 'center', paddingHorizontal: space.lg },
  back: { borderWidth: StyleSheet.hairlineWidth * 2, shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: 10 } },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  pattern: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: radius.xl - 10,
    borderWidth: 1,
    opacity: 0.12,
  },
  info: { alignItems: 'center', gap: 2 },
  allies: { flexDirection: 'row', gap: 4 },
  allyList: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center', marginTop: space.xs },
  ally: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
