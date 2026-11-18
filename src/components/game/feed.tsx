// The narrator's log: clues, votes, who's out. Newest last, each line eases in once.

import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { describeEvent, radius, space, type FeedEvent, type RoomPlayer } from '@/shared';
import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { easeOut } from '@/theme/motion';
import { useColors } from '@/theme/theme';

const enter = FadeInDown.duration(220).easing(easeOut);

export function Feed({ events, players }: { events: FeedEvent[]; players: RoomPlayer[] }) {
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? 'Someone';
  const person = (id: string) => players.find((p) => p.id === id);
  if (events.length === 0) return null;
  return (
    <View style={styles.feed}>
      {events.map((e) => (
        <Animated.View key={e.id} entering={enter}>
          <FeedItem event={e} nameOf={nameOf} person={person} />
        </Animated.View>
      ))}
    </View>
  );
}

function FeedItem({
  event: e,
  nameOf,
  person,
}: {
  event: FeedEvent;
  nameOf(id: string): string;
  person(id: string): RoomPlayer | undefined;
}) {
  const c = useColors();
  if (e.kind === 'text') {
    const p = person(e.player);
    return (
      <View style={styles.clue}>
        {p && <Avatar name={p.name} tone={p.tone} size={28} />}
        <View style={[styles.bubble, { backgroundColor: c.raised }]}>
          <Text variant="caption" tone="muted">
            {nameOf(e.player)}
          </Text>
          <Text variant="lead">{e.text}</Text>
        </View>
      </View>
    );
  }
  if (e.kind === 'votes') return <VoteBreakdown event={e} nameOf={nameOf} />;
  if (e.kind === 'round')
    return (
      <Text variant="label" tone="faint" align="center" style={styles.divider}>
        Round {e.round}
      </Text>
    );
  const line = describeEvent(e, nameOf);
  if (!line) return null;
  const loud = e.kind === 'eliminated' || e.kind === 'role_revealed' || e.kind === 'reveal';
  return (
    <View style={[styles.line, loud && { backgroundColor: c.raised }]}>
      {e.kind === 'reveal' && (
        <Text variant="label" tone="accent">
          Only you can see this
        </Text>
      )}
      <Text variant={loud ? 'strong' : 'body'} tone={e.kind === 'score' ? 'accent' : 'fg'}>
        {line}
      </Text>
    </View>
  );
}

function VoteBreakdown({ event, nameOf }: { event: Extract<FeedEvent, { kind: 'votes' }>; nameOf(id: string): string }) {
  const c = useColors();
  const total = event.counts.reduce((n, x) => n + x.count, 0) || 1;
  return (
    <View style={[styles.votes, { borderColor: c.line }]}>
      <Text variant="strong">{describeEvent(event, nameOf)}</Text>
      {event.counts.map((row) => (
        <View key={row.player} style={styles.voteRow}>
          <View style={styles.voteHead}>
            <Text variant="caption" style={{ flexShrink: 1 }}>
              {event.of === 'option' ? row.player : row.label ? `${nameOf(row.player)}: “${row.label}”` : nameOf(row.player)}
            </Text>
            <Text variant="caption" tone="muted">
              {row.voters.length > 0 ? row.voters.map(nameOf).join(', ') : row.count}
            </Text>
          </View>
          <View style={[styles.barTrack, { backgroundColor: c.raised }]}>
            <View
              style={[
                styles.bar,
                {
                  width: `${(row.count / total) * 100}%`,
                  backgroundColor: row.player === event.top ? c.accent : c.faint,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  feed: { gap: space.sm },
  clue: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  bubble: { borderRadius: radius.md, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 8, maxWidth: '80%' },
  divider: { marginVertical: space.sm },
  line: { borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
  votes: { borderWidth: StyleSheet.hairlineWidth * 2, borderRadius: radius.md, padding: 14, gap: space.md },
  voteRow: { gap: 6 },
  voteHead: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  barTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
});
