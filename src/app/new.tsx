// Second step for hosts: your name, then the room is created with the game you picked.

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { NAME_MAX_LENGTH, radius, space } from '@/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { toastError } from '@/components/ui/toast';
import { gameArt } from '@/lib/art';
import { storage } from '@/lib/storage';
import { useRoom } from '@/store/room';
import { useScheme } from '@/theme/theme';

export default function NewRoom() {
  const { game: gameId } = useLocalSearchParams<{ game: string }>();
  const router = useRouter();
  const scheme = useScheme();
  const { games, loadGames, create } = useRoom();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    storage.getName().then((n) => n && setName(n));
    loadGames().catch(toastError);
  }, [loadGames]);

  if (!gameId) return <Redirect href="/" />;
  const game = games.find((g) => g.id === gameId);
  const named = name.trim().length > 0;

  const onCreate = async () => {
    setBusy(true);
    try {
      const code = await create(name.trim(), gameId);
      router.replace(`/room/${code}`);
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        footer={<Button label="Create a room" variant="primary" disabled={!named} loading={busy} onPress={onCreate} />}
      >
        <View style={styles.head}>
          <Button label="Back" variant="ghost" size="md" onPress={() => router.back()} style={styles.back} />
          <Text variant="display">What’s your name?</Text>
          <Text tone="muted">Your friends will see it in the lobby.</Text>
        </View>

        {game && (
          <Card radiusSize="xl" style={styles.game}>
            <ImageBackground source={gameArt(game.id, scheme)} resizeMode="cover" style={styles.thumb} imageStyle={{ borderRadius: radius.lg }} />
            <View style={{ flex: 1 }}>
              <Text variant="title">{game.name}</Text>
              <Text variant="caption" tone="muted">
                {game.players.min}–{game.players.max} players  {game.minutes[0]}–{game.minutes[1]} min
              </Text>
            </View>
          </Card>
        )}

        <Input
          value={name}
          onChangeText={setName}
          maxLength={NAME_MAX_LENGTH}
          placeholder="What your friends call you"
          autoCapitalize="words"
          autoFocus
          returnKeyType="go"
          onSubmitEditing={() => named && onCreate()}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  head: { gap: space.sm },
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  game: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  thumb: { width: 64, height: 64 },
});
