import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { radius, space, type GameSetting, type GameSummary, type RoomView, type SettingValue } from '@/shared';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Segmented, Stepper, Toggle } from '@/components/ui/controls';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { toast, toastError } from '@/components/ui/toast';
import { inviteLink } from '@/lib/config';
import { useRoom } from '@/store/room';
import { easeOut } from '@/theme/motion';
import { fonts, useColors } from '@/theme/theme';

const layout = LinearTransition.duration(220).easing(easeOut);

export function Lobby({ room, onLeave }: { room: RoomView; onLeave(): void }) {
  const c = useColors();
  const { games, loadGames, configure, start, kick } = useRoom();
  const [starting, setStarting] = useState(false);
  const isHost = room.hostId === room.me;
  const game = games.find((g) => g.id === room.gameId);
  const present = room.players.filter((p) => p.connected).length;

  useEffect(() => {
    loadGames().catch(toastError);
  }, [loadGames]);

  const blocker = !game
    ? 'Loading games…'
    : present < game.players.min
      ? `Need ${game.players.min - present} more ${game.players.min - present === 1 ? 'player' : 'players'}`
      : present > game.players.max
        ? `${game.name} allows up to ${game.players.max}`
        : null;

  const invite = async () => {
    const url = inviteLink(room.code);
    try {
      await Share.share({ message: `Join my game: ${url}`, url });
    } catch {
      await Clipboard.setStringAsync(url);
      toast('Invite link copied');
    }
  };

  const setSetting = (key: string, value: SettingValue) =>
    configure({ settings: { [key]: value } }).catch(toastError);

  return (
    <Screen
      footer={
        isHost ? (
          <Button
            label={blocker ?? `Start ${game?.name}`}
            variant="accent"
            disabled={!!blocker}
            loading={starting}
            onPress={async () => {
              setStarting(true);
              await start().catch(toastError);
              setStarting(false);
            }}
          />
        ) : (
          <Text tone="muted" align="center" style={{ paddingVertical: 14 }}>
            Waiting for {room.players.find((p) => p.isHost)?.name ?? 'the host'} to start
          </Text>
        )
      }
    >
      <View style={styles.top}>
        <Button label="Leave" variant="ghost" size="md" onPress={onLeave} style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }} />
        <PressableScale
          haptics="select"
          onPress={async () => {
            await Clipboard.setStringAsync(room.code);
            toast('Room code copied');
          }}
          accessibilityLabel={`Room code ${room.code.split('').join(' ')}. Tap to copy.`}
          style={[styles.code, { borderColor: c.line, backgroundColor: c.surface }]}
        >
          <Text variant="label" tone="muted">
            Room code
          </Text>
          <Text style={[styles.codeText, { color: c.fg }]}>{room.code}</Text>
        </PressableScale>
        <Button label="Invite friends" variant="secondary" onPress={invite} />
      </View>

      <Section title={`Players · ${present}`}>
        <Animated.View layout={layout} style={styles.players}>
          {room.players.map((p) => (
            <Animated.View
              key={p.id}
              entering={FadeIn.duration(200).easing(easeOut)}
              exiting={FadeOut.duration(150)}
              layout={layout}
              style={styles.player}
            >
              <Avatar name={p.name} tone={p.tone} size={36} dimmed={!p.connected} />
              <View style={{ flex: 1 }}>
                <Text variant="strong">
                  {p.name}
                  {p.id === room.me ? ' (you)' : ''}
                </Text>
                {(p.isHost || !p.connected) && (
                  <Text variant="caption" tone="muted">
                    {p.isHost ? 'Host' : 'Reconnecting…'}
                  </Text>
                )}
              </View>
              {isHost && p.id !== room.me && (
                <Button label="Remove" variant="ghost" size="md" onPress={() => kick(p.id).catch(toastError)} />
              )}
            </Animated.View>
          ))}
        </Animated.View>
      </Section>

      <Section title="Game">
        <View style={styles.games}>
          {games.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              selected={g.id === room.gameId}
              disabled={!isHost}
              onPress={() => configure({ gameId: g.id }).catch(toastError)}
            />
          ))}
        </View>
      </Section>

      {game && game.settings.length > 0 && (
        <Section title="House rules">
          <View style={[styles.settings, { borderColor: c.line }]}>
            {game.settings.map((s, i) => (
              <SettingRow
                key={s.key}
                setting={s}
                value={room.settings[s.key] ?? s.default}
                disabled={!isHost}
                divider={i > 0}
                onChange={(v) => setSetting(s.key, v)}
              />
            ))}
          </View>
        </Section>
      )}
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.md }}>
      <Text variant="label" tone="muted">
        {title}
      </Text>
      {children}
    </View>
  );
}

function GameCard({ game, selected, disabled, onPress }: { game: GameSummary; selected: boolean; disabled: boolean; onPress(): void }) {
  const c = useColors();
  return (
    <PressableScale
      haptics="select"
      disabled={disabled}
      onPress={onPress}
      accessibilityState={{ selected, disabled }}
      style={[styles.game, { borderColor: selected ? c.fg : c.line, backgroundColor: c.surface }]}
    >
      <View style={styles.gameHead}>
        <Text variant="title">{game.name}</Text>
        <Text variant="label" tone={game.tier === 'free' ? 'success' : 'accent'}>
          {game.tier === 'free' ? 'Free' : 'Pass'}
        </Text>
      </View>
      <Text tone="muted">{game.tagline}</Text>
      <Text variant="caption" tone="faint">
        {game.players.min}–{game.players.max} players · {game.minutes[0]}–{game.minutes[1]} min
      </Text>
    </PressableScale>
  );
}

function SettingRow({
  setting: s,
  value,
  disabled,
  divider,
  onChange,
}: {
  setting: GameSetting;
  value: SettingValue;
  disabled: boolean;
  divider: boolean;
  onChange(v: SettingValue): void;
}) {
  const c = useColors();
  return (
    <View style={[styles.setting, divider && { borderTopColor: c.line, borderTopWidth: StyleSheet.hairlineWidth }]}>
      <Text variant="body" style={{ flex: 1 }}>
        {s.label}
      </Text>
      {s.type === 'number' && (
        <Stepper value={Number(value)} min={s.min} max={s.max} step={s.step} unit={s.unit} disabled={disabled} onChange={onChange} />
      )}
      {s.type === 'boolean' && <Toggle value={value === true} disabled={disabled} onChange={onChange} />}
      {s.type === 'choice' && s.options && (
        <Segmented value={value as string | number} options={s.options} disabled={disabled} onChange={onChange} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { gap: space.md },
  code: { borderWidth: StyleSheet.hairlineWidth * 2, borderRadius: radius.lg, paddingVertical: space.xl, alignItems: 'center', gap: space.xs },
  codeText: { fontFamily: fonts.bold, fontSize: 44, lineHeight: 50, letterSpacing: 10, paddingLeft: 10 },
  players: { gap: space.md },
  player: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 44 },
  games: { gap: space.sm },
  game: { borderWidth: 1.5, borderRadius: radius.lg, padding: space.lg, gap: space.xs },
  gameHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settings: { borderWidth: StyleSheet.hairlineWidth * 2, borderRadius: radius.lg, paddingHorizontal: space.lg },
  setting: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 60, paddingVertical: space.sm },
});
