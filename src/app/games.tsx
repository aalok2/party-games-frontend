// Change game: opened from the lobby's "Change". The first screen of the app uses the same cards.

import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '@/shared';
import { Button } from '@/components/ui/button';
import { GameCard } from '@/components/games/game-card';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { toastError } from '@/components/ui/toast';
import { useRoom } from '@/store/room';

export default function Games() {
  const router = useRouter();
  const { room, games, loadGames, configure } = useRoom();
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadGames().catch(toastError);
  }, [loadGames]);

  if (!room) return <Redirect href="/" />;
  const isHost = room.hostId === room.me;
  const current = picked ?? room.gameId;
  const chosen = games.find((g) => g.id === current);

  const confirm = async () => {
    setBusy(true);
    try {
      if (current !== room.gameId) await configure({ gameId: current });
      router.back();
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={
        <Button
          label={isHost ? `Use ${chosen?.name ?? 'this game'}` : 'Back to lobby'}
          variant="primary"
          disabled={isHost && !chosen}
          loading={busy}
          onPress={isHost ? confirm : () => router.back()}
        />
      }
    >
      <View style={styles.head}>
        <Button label="Back" variant="ghost" size="md" onPress={() => router.back()} style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }} />
        <Text variant="display">Pick a game</Text>
        {!isHost && <Text tone="muted">Only the host can change the game.</Text>}
      </View>
      {games.map((g) => (
        <GameCard key={g.id} game={g} selected={g.id === current} disabled={!isHost} onPress={() => setPicked(g.id)} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({ head: { gap: space.sm } });
