import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { space, type RoomView } from '@/shared';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { toastError } from '@/components/ui/toast';
import { useRoom } from '@/store/room';
import { easeOut } from '@/theme/motion';
import { useColors } from '@/theme/theme';

export function Results({ room }: { room: RoomView }) {
  const c = useColors();
  const match = room.match!;
  const result = match.result!;
  const { start, backToLobby } = useRoom();
  const [busy, setBusy] = useState(false);
  const isHost = room.hostId === room.me;
  const nameOf = (id: string) => room.players.find((p) => p.id === id)?.name ?? 'Someone';
  const won = result.winners.includes(room.me);
  const showScores = match.scored;

  const headline = result.team
    ? `${result.team.name} wins`
    : result.winners.length === 1
      ? `${nameOf(result.winners[0]!)} wins`
      : result.winners.length > 1
        ? "It's a tie"
        : 'Game over';

  const run = (fn: () => Promise<void>) => async () => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.fill}>
      <ScrollView contentContainerStyle={styles.body}>
        <Animated.View entering={FadeInDown.duration(280).easing(easeOut)} style={styles.hero}>
          <Text variant="label" tone={won ? 'accent' : 'muted'}>
            {!showScores ? 'That’s a wrap' : won ? 'You won' : 'Better luck next time'}
          </Text>
          <Text variant="hero" align="center">
            {headline}
          </Text>
        </Animated.View>

        <Card style={styles.list}>
          {result.standings.map((s, i) => {
            const p = room.players.find((x) => x.id === s.player);
            const mp = match.players.find((x) => x.id === s.player);
            return (
              <Animated.View
                key={s.player}
                entering={FadeInDown.duration(240).delay(60 + i * 30).easing(easeOut)}
                style={[styles.row, i > 0 && { borderTopColor: c.line, borderTopWidth: StyleSheet.hairlineWidth }]}
              >
                <Avatar name={p?.name ?? '?'} tone={p?.tone ?? 0} size={36} dimmed={mp ? !mp.alive && !showScores : false} />
                <View style={styles.who}>
                  <Text variant="strong">{p?.name ?? 'Left the room'}</Text>
                  {mp?.revealedRole && (
                    <Text variant="caption" tone="muted">
                      {mp.revealedRole.name}
                      {!mp.alive && !showScores ? ' · out' : ''}
                    </Text>
                  )}
                </View>
                {result.winners.includes(s.player) && (
                  <Text variant="label" tone="accent">
                    Winner
                  </Text>
                )}
                {showScores && <Text variant="title" numeric>{s.score}</Text>}
              </Animated.View>
            );
          })}
        </Card>
      </ScrollView>
      <View style={styles.footer}>
        {isHost ? (
          <>
            <Button label="Play again" variant="primary" loading={busy} onPress={run(start)} />
            <Button label="Back to lobby" variant="secondary" disabled={busy} onPress={run(backToLobby)} />
          </>
        ) : (
          <Text tone="muted" align="center">
            Waiting for the host to start another round
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { padding: space.lg, gap: space.xl, width: '100%', maxWidth: 520, alignSelf: 'center' },
  hero: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  list: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  who: { flex: 1, gap: 2 },
  footer: {
    padding: space.lg,
    gap: space.sm,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
});
