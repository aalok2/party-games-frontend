import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { radius, space, type GameSetting, type RoomView, type SettingValue } from '@/shared';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Segmented, Stepper, Toggle } from '@/components/ui/controls';
import { CoverPill } from '@/components/ui/cover';
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
  const router = useRouter();
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
            variant="primary"
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
      <View style={styles.bar}>
        <Button label="Leave" variant="ghost" size="md" onPress={onLeave} style={styles.leave} />
        <Button label="Invite friends" variant="secondary" size="md" onPress={invite} />
      </View>

      <PressableScale
        haptics="select"
        onPress={async () => {
          await Clipboard.setStringAsync(room.code);
          toast('Room code copied');
        }}
        accessibilityLabel={`Room code ${room.code.split('').join(' ')}. Tap to copy.`}
        style={[styles.code, { backgroundColor: c.inset }]}
      >
        <Text variant="label" tone="muted">
          Room code. Tap to copy
        </Text>
        <Text style={[styles.codeText, { color: c.fg }]}>{room.code}</Text>
      </PressableScale>

      <Section title="Players" note={`${present} here`}>
        <Card>
          <Animated.View layout={layout}>
            {room.players.map((p, i) => (
              <Animated.View
                key={p.id}
                entering={FadeIn.duration(200).easing(easeOut)}
                exiting={FadeOut.duration(150)}
                layout={layout}
                style={[styles.player, i > 0 && { borderTopColor: c.line, borderTopWidth: StyleSheet.hairlineWidth * 2 }]}
              >
                <Avatar name={p.name} tone={p.tone} size={38} dimmed={!p.connected} />
                <View style={{ flex: 1 }}>
                  <Text variant="strong">
                    {p.name}
                    {p.id === room.me ? ' (you)' : ''}
                  </Text>
                  {p.isHost || !p.connected ? (
                    <Text variant="caption" tone={p.isHost ? 'accent' : 'muted'}>
                      {p.isHost ? 'Host' : 'Reconnecting…'}
                    </Text>
                  ) : isHost && p.id !== room.me ? (
                    <PressableScale haptics="none" onPress={() => kick(p.id).catch(toastError)} accessibilityLabel={`Remove ${p.name}`} hitSlop={8}>
                      <Text variant="caption" tone="muted">
                        Remove
                      </Text>
                    </PressableScale>
                  ) : null}
                </View>
                {p.connected && <CoverPill />}
              </Animated.View>
            ))}
          </Animated.View>
        </Card>
      </Section>

      <Section title="Game">
        <Card radiusSize="xl" style={styles.gameRow}>
          <View style={{ flex: 1 }}>
            <Text variant="title">{game?.name ?? '…'}</Text>
            {game && (
              <Text variant="caption" tone="muted">
                {game.players.min}–{game.players.max} players  {game.minutes[0]}–{game.minutes[1]} min
              </Text>
            )}
          </View>
          {isHost && (
            <Button label="Change" variant="primary" size="md" onPress={() => router.push('/games')} />
          )}
        </Card>
      </Section>

      {game && game.settings.length > 0 && (
        <Section title="House rules">
          <Card style={styles.settings}>
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
          </Card>
        </Section>
      )}
    </Screen>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.sectionHead}>
        <Text variant="title">{title}</Text>
        {note ? (
          <Text variant="caption" tone="muted">
            {note}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
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
  const stacked = s.type === 'choice';
  return (
    <View style={[styles.setting, stacked && styles.settingStacked, divider && { borderTopColor: c.line, borderTopWidth: StyleSheet.hairlineWidth * 2 }]}>
      <Text variant="body" style={stacked ? undefined : { flex: 1 }}>
        {s.label}
      </Text>
      {s.type === 'number' && (
        <Stepper value={Number(value)} min={s.min} max={s.max} step={s.step} unit={s.unit} disabled={disabled} onChange={onChange} />
      )}
      {s.type === 'boolean' && <Toggle value={value === true} disabled={disabled} onChange={onChange} />}
      {s.type === 'choice' && s.options && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.choiceScroll}>
          <Segmented value={value as string | number} options={s.options} disabled={disabled} onChange={onChange} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leave: { paddingHorizontal: 0 },
  code: { borderRadius: radius.lg, paddingVertical: space.lg, alignItems: 'center', gap: space.xs },
  codeText: { fontFamily: fonts.bold, fontSize: 54, lineHeight: 60, letterSpacing: 8, paddingLeft: 8 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 4 },
  player: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64, paddingHorizontal: space.lg },
  gameRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, paddingLeft: space.xl, paddingRight: space.md },
  settings: { paddingHorizontal: space.lg },
  settingStacked: { flexDirection: 'column', alignItems: 'stretch', gap: space.sm, paddingVertical: space.md },
  choiceScroll: { flexGrow: 0 },
  setting: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 60, paddingVertical: space.sm },
});
