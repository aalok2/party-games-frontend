import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, space, type MatchView, type RoomView } from '@/shared';
import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { TimerBar } from '@/components/ui/timer-bar';
import { easeOut, timing } from '@/theme/motion';
import { SchemeOverride, useColors, useScheme } from '@/theme/theme';
import { Feed } from './feed';
import { PromptPanel } from './prompt-panel';
import { Results } from './results';
import { RoleCard } from './role-card';

export function GameView({ room }: { room: RoomView }) {
  const match = room.match!;
  const night = match.phase.ui === 'night' && !match.result;
  return (
    <SchemeOverride scheme={night ? 'dark' : null}>
      <Backdrop night={night}>{match.result ? <Results room={room} /> : <Playing room={room} match={match} />}</Backdrop>
    </SchemeOverride>
  );
}

/** Crossfades the page colour when night falls instead of snapping. */
function Backdrop({ night, children }: { night: boolean; children: React.ReactNode }) {
  const scheme = useScheme();
  const dark = useSharedValue(scheme === 'dark' ? 1 : 0);
  useEffect(() => {
    dark.set(withTiming(scheme === 'dark' ? 1 : 0, timing(300)));
  }, [scheme, dark]);
  const bg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(dark.get(), [0, 1], [palette.light.bg, palette.dark.bg]),
  }));
  return (
    <Animated.View style={[styles.fill, bg]} accessibilityLabel={night ? 'Night' : undefined}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        {children}
      </SafeAreaView>
    </Animated.View>
  );
}

function Playing({ room, match }: { room: RoomView; match: MatchView }) {
  const c = useColors();
  const seated = match.players.some((p) => p.id === room.me);
  const phaseKey = `${match.round}:${match.phase.id}`;
  const roundLabel = match.totalRounds
    ? `Round ${match.round} of ${match.totalRounds}`
    : match.phase.ui === 'reveal'
      ? 'Getting ready'
      : `${match.phase.title} ${match.round}`;
  const events = match.feed.filter((e) => e.round === match.round && e.kind !== 'round');

  if (!seated)
    return (
      <View style={[styles.center, { padding: space.xl }]}>
        <Text variant="title" align="center">
          Game in progress
        </Text>
        <Text tone="muted" align="center">
          You’ll be dealt in when the next game starts.
        </Text>
      </View>
    );

  return (
    <View style={styles.fill}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Animated.View key={phaseKey} entering={FadeIn.duration(240).easing(easeOut)} style={{ flex: 1 }}>
            <Text variant="label" tone="muted">
              {roundLabel}
            </Text>
            <Text variant="display">{match.phase.title}</Text>
          </Animated.View>
        </View>
        <TimerBar msLeft={match.phase.msLeft} durationMs={match.phase.durationMs} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {match.phase.ui === 'reveal' ? (
          <RoleCard me={match.me} players={room.players} />
        ) : (
          <>
            {match.me.role && <RoleCard me={match.me} players={room.players} compact />}
            {!match.me.alive && (
              <View style={[styles.banner, { backgroundColor: c.raised }]}>
                <Text variant="strong">You’re out</Text>
                <Text tone="muted">Watch quietly, no hints to the living.</Text>
              </View>
            )}
            {match.content && <ContentCard content={match.content} />}
            <PlayerStrip room={room} match={match} />
            <Feed events={events} players={room.players} />
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: c.line }]}>
        {match.prompt ? (
          <PromptPanel key={phaseKey + match.prompt.key} prompt={match.prompt} players={room.players} />
        ) : (
          <StatusLine room={room} match={match} />
        )}
      </View>
    </View>
  );
}

/** The round's prompt or question, big, for everyone. The last field is the text; any before it are small labels. */
function ContentCard({ content }: { content: NonNullable<MatchView['content']> }) {
  const c = useColors();
  const text = content[content.length - 1]!;
  const labels = content.slice(0, -1);
  return (
    <Animated.View entering={FadeIn.duration(240).easing(easeOut)} style={[styles.qcard, { backgroundColor: c.surface, shadowColor: c.shadow }]}>
      {labels.length > 0 && (
        <Text variant="label" tone="accent">
          {labels.map((l) => l.text).join(' · ')}
        </Text>
      )}
      <Text variant="title">{text.text}</Text>
    </Animated.View>
  );
}

/** Who's still in, who has acted. Never what they did. */
function PlayerStrip({ room, match }: { room: RoomView; match: MatchView }) {
  const c = useColors();
  const turn = match.phase.turn?.playerId;
  return (
    <View style={styles.strip}>
      {match.players.map((mp) => {
        const p = room.players.find((x) => x.id === mp.id);
        if (!p) return null;
        return (
          <View key={mp.id} style={styles.chip} accessibilityLabel={`${p.name}${mp.alive ? '' : ', out'}`}>
            <View style={[styles.ring, { borderColor: turn === mp.id ? c.accent : 'transparent' }]}>
              <Avatar name={p.name} tone={p.tone} size={34} dimmed={!mp.alive} />
            </View>
            <Text variant="caption" tone={mp.alive ? 'fg' : 'faint'} numberOfLines={1} style={styles.chipName}>
              {p.name}
            </Text>
            {match.scored ? (
              <Text variant="caption" tone="muted" numeric>
                {mp.score}
              </Text>
            ) : mp.acted ? (
              <View style={[styles.tick, { backgroundColor: c.success }]} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function StatusLine({ room, match }: { room: RoomView; match: MatchView }) {
  const turn = match.phase.turn;
  if (turn) {
    const name = room.players.find((p) => p.id === turn.playerId)?.name ?? 'Someone';
    return (
      <Text tone="muted" align="center">
        {name} is thinking… ({turn.index + 1} of {turn.total})
      </Text>
    );
  }
  const waiting = match.players.filter((p) => p.alive && !p.acted).length;
  const text =
    match.phase.ui === 'night' && match.me.alive
      ? 'Eyes closed. The night is busy.'
      : waiting > 0
        ? `Waiting for ${waiting} ${waiting === 1 ? 'player' : 'players'}`
        : 'Moving on…';
  return (
    <Text tone="muted" align="center">
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm },
  header: { paddingHorizontal: space.lg, paddingTop: space.md, gap: space.md, width: '100%', maxWidth: 520, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end' },
  body: { padding: space.lg, gap: space.lg, width: '100%', maxWidth: 520, alignSelf: 'center' },
  qcard: {
    borderRadius: 18,
    padding: space.lg,
    gap: 6,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  banner: { borderRadius: 14, padding: space.lg, gap: 2 },
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  chip: { alignItems: 'center', width: 56, gap: 4 },
  chipName: { maxWidth: 56 },
  ring: { borderWidth: 2, borderRadius: 22, padding: 2 },
  tick: { width: 6, height: 6, borderRadius: 3 },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
});
