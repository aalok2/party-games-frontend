import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NAME_MAX_LENGTH, ROOM_CODE_LENGTH, space } from '@/shared';
import { GameView } from '@/components/game/game-view';
import { Lobby } from '@/components/lobby/lobby';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { toast, toastError } from '@/components/ui/toast';
import { socket } from '@/lib/socket';
import { storage } from '@/lib/storage';
import { useRoom } from '@/store/room';
import { useColors } from '@/theme/theme';

export default function RoomScreen() {
  const params = useLocalSearchParams<{ code: string }>();
  const code = String(params.code ?? '').toUpperCase().slice(0, ROOM_CODE_LENGTH);
  const router = useRouter();
  const { room, connection, kicked, resume, join, leave } = useRoom();
  const inRoom = room?.code === code;
  const [checking, setChecking] = useState(!inRoom);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    if (inRoom) return;
    let live = true;
    resume(code).finally(() => live && setChecking(false));
    return () => {
      live = false;
    };
    // Only on arrival; reconnects are handled by the store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    if (!kicked) return;
    toast('The host removed you from the room');
    useRoom.setState({ kicked: false });
    router.replace('/');
  }, [kicked, router]);

  const onLeave = async () => {
    await leave();
    router.replace('/');
  };

  if (inRoom) {
    return (
      <>
        {room.status === 'playing' && room.match ? <GameView room={room} /> : <Lobby room={room} onLeave={onLeave} />}
        {connection === 'offline' && <OfflineBadge />}
      </>
    );
  }
  if (checking) return <Loading />;
  return <JoinGate code={code} onJoin={join} onCancel={() => router.replace('/')} />;
}

function JoinGate({ code, onJoin, onCancel }: { code: string; onJoin(code: string, name: string): Promise<void>; onCancel(): void }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    storage.getName().then((n) => n && setName(n));
  }, []);
  const submit = async () => {
    setBusy(true);
    try {
      await onJoin(code, name.trim());
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen
      contentStyle={{ justifyContent: 'center' }}
      footer={
        <>
          <Button label="Join the room" variant="accent" disabled={!name.trim()} loading={busy} onPress={submit} />
          <Button label="Cancel" variant="ghost" onPress={onCancel} />
        </>
      }
    >
      <View style={{ gap: space.sm }}>
        <Text variant="label" tone="muted">
          Joining room
        </Text>
        <Text variant="display" style={{ letterSpacing: 6 }}>
          {code}
        </Text>
      </View>
      <Input
        value={name}
        onChangeText={setName}
        maxLength={NAME_MAX_LENGTH}
        placeholder="Your name"
        autoFocus
        returnKeyType="go"
        onSubmitEditing={() => name.trim() && submit()}
      />
    </Screen>
  );
}

function Loading() {
  const c = useColors();
  return (
    <View style={[styles.center, { backgroundColor: c.bg }]}>
      <ActivityIndicator color={c.muted} />
    </View>
  );
}

function OfflineBadge() {
  const c = useColors();
  return (
    <View pointerEvents="none" style={[styles.offline, { backgroundColor: c.fg }]}>
      <Text variant="caption" style={{ color: c.bg }}>
        Reconnecting…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  offline: { position: 'absolute', top: 56, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
});
