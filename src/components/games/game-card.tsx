import { ImageBackground, StyleSheet, View } from 'react-native';
import { radius, space, type GameSummary } from '@/shared';
import { Card } from '@/components/ui/card';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { gameArt } from '@/lib/art';
import { useColors, useScheme } from '@/theme/theme';

/** One large card per game: colour art, name, tagline, size. Used on the first screen and when changing games. */
export function GameCard({ game, selected, disabled, onPress }: { game: GameSummary; selected: boolean; disabled?: boolean; onPress(): void }) {
  const c = useColors();
  const scheme = useScheme();
  return (
    <PressableScale
      haptics="select"
      disabled={disabled}
      onPress={onPress}
      scaleTo={0.98}
      accessibilityLabel={game.name}
      accessibilityState={{ selected, disabled: !!disabled }}
    >
      <Card radiusSize="xl" style={[styles.card, selected && { borderWidth: 2.5, borderColor: c.accent }]}>
        <ImageBackground source={gameArt(game.id, scheme)} resizeMode="cover" style={styles.art}>
          <Motif id={game.id} />
        </ImageBackground>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text variant="title">{game.name}</Text>
            <Text variant="caption" tone={selected ? 'accent' : game.tier === 'free' ? 'success' : 'muted'}>
              {selected ? 'Selected' : game.tier === 'free' ? 'Free' : 'Pass'}
            </Text>
          </View>
          <Text tone="muted">{game.tagline}</Text>
          <Text variant="caption" tone="muted">
            {game.players.min}–{game.players.max} players  {game.minutes[0]}–{game.minutes[1]} min
          </Text>
        </View>
      </Card>
    </PressableScale>
  );
}

/** Each game's art is built from the cover device: Imposter is lines of text, everything else is a row of faces. */
function Motif({ id }: { id: string }) {
  const c = useColors();
  if (id === 'imposter') {
    return (
      <View style={styles.lines}>
        <View style={[styles.line, { width: '78%', backgroundColor: c.ink }]} />
        <View style={[styles.line, { width: '36%', backgroundColor: c.accent }]} />
        <View style={[styles.line, { width: '92%', backgroundColor: c.ink }]} />
      </View>
    );
  }
  return (
    <View style={styles.faces}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.face, { backgroundColor: i === 2 ? c.accent : c.ink }]} />
      ))}
      <View style={[styles.face, { borderWidth: 2, borderColor: c.ink, borderStyle: 'dashed' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  art: { height: 132, justifyContent: 'center', paddingHorizontal: space.xl },
  info: { padding: space.lg, gap: space.xs },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  faces: { flexDirection: 'row', gap: 10 },
  face: { width: 36, height: 36, borderRadius: radius.pill },
  lines: { gap: 8 },
  line: { height: 12, borderRadius: radius.pill },
});
