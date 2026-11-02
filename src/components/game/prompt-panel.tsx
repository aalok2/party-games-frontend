// The one thing this player can do right now: pick a player, vote, type, or tap ready.

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { radius, space, type Prompt, type RoomPlayer } from '@/shared';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { toastError } from '@/components/ui/toast';
import { useRoom } from '@/store/room';
import { useColors } from '@/theme/theme';

export function PromptPanel({ prompt, players }: { prompt: Prompt; players: RoomPlayer[] }) {
  const act = useRoom((s) => s.act);
  const [busy, setBusy] = useState(false);
  const send = async (value: string) => {
    setBusy(true);
    try {
      await act(prompt.key, value);
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.panel}>
      {prompt.type !== 'ready' && <Text variant="lead">{prompt.label}</Text>}
      {prompt.type === 'ready' && (
        <Button
          label={prompt.submitted ? 'Waiting for the others…' : prompt.label}
          disabled={!!prompt.submitted}
          loading={busy}
          onPress={() => send('ready')}
        />
      )}
      {(prompt.type === 'choose_player' || prompt.type === 'vote') && (
        <PlayerPicker prompt={prompt} players={players} disabled={busy} onPick={send} />
      )}
      {prompt.type === 'choose_option' && (
        <View style={styles.options}>
          {prompt.options.map((o) => (
            <Button key={o} label={o} variant={prompt.submitted === o ? 'accent' : 'secondary'} onPress={() => send(o)} />
          ))}
        </View>
      )}
      {prompt.type === 'text' && <TextAnswer prompt={prompt} busy={busy} onSubmit={send} />}
    </View>
  );
}

function PlayerPicker({
  prompt,
  players,
  disabled,
  onPick,
}: {
  prompt: Prompt;
  players: RoomPlayer[];
  disabled: boolean;
  onPick(id: string): void;
}) {
  const c = useColors();
  const pickers = (id: string) => prompt.teamPicks.filter((t) => t.value === id).map((t) => players.find((p) => p.id === t.playerId)?.name);
  return (
    <View style={styles.grid}>
      {prompt.options.map((id) => {
        const p = players.find((x) => x.id === id);
        if (!p) return null;
        const chosen = prompt.submitted === id;
        const teammates = pickers(id).filter(Boolean);
        return (
          <PressableScale
            key={id}
            haptics="select"
            disabled={disabled}
            onPress={() => onPick(id)}
            accessibilityLabel={p.name}
            accessibilityState={{ selected: chosen }}
            style={[
              styles.tile,
              { borderColor: chosen ? c.accent : 'transparent', backgroundColor: c.surface, shadowColor: c.shadow },
            ]}
          >
            <Avatar name={p.name} tone={p.tone} size={36} />
            <Text variant="strong" numberOfLines={1} style={{ flexShrink: 1 }}>
              {p.name}
            </Text>
            {teammates.length > 0 && (
              <Text variant="caption" tone="accent" numberOfLines={1}>
                {teammates.join(', ')}
              </Text>
            )}
          </PressableScale>
        );
      })}
    </View>
  );
}

function TextAnswer({ prompt, busy, onSubmit }: { prompt: Prompt; busy: boolean; onSubmit(v: string): void }) {
  const [text, setText] = useState('');
  if (prompt.submitted)
    return (
      <Text variant="body" tone="muted">
        You said “{prompt.submitted}”
      </Text>
    );
  const ready = text.trim().length > 0;
  return (
    <View style={styles.textRow}>
      <Input
        value={text}
        onChangeText={setText}
        maxLength={prompt.maxLength ?? 140}
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="send"
        onSubmitEditing={() => ready && onSubmit(text)}
        placeholder="Type here"
        style={{ flex: 1 }}
      />
      <Button label="Send" variant="accent" disabled={!ready} loading={busy} onPress={() => onSubmit(text)} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: space.md },
  options: { gap: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.sm,
    paddingRight: space.md,
    borderRadius: radius.md,
    borderWidth: 2.5,
    minHeight: 56,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  textRow: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
});
