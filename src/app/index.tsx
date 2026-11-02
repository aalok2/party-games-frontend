import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { NAME_MAX_LENGTH, ROOM_CODE_LENGTH, space } from '@/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { toastError } from '@/components/ui/toast';
import { storage } from '@/lib/storage';
import { useRoom } from '@/store/room';
import { easeOut } from '@/theme/motion';
import { fonts, useColors } from '@/theme/theme';

const enter = (i: number) => FadeInDown.duration(280).delay(i * 50).easing(easeOut);

export default function Home() {
  const router = useRouter();
  const c = useColors();
  const { create, connection } = useRoom();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<'create' | null>(null);

  useEffect(() => {
    storage.getName().then((n) => n && setName(n));
  }, []);

  const named = name.trim().length > 0;
  const codeReady = code.length === ROOM_CODE_LENGTH;

  const onCreate = async () => {
    setBusy('create');
    try {
      const roomCode = await create(name.trim());
      router.push(`/room/${roomCode}`);
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(null);
    }
  };

  const onJoin = async () => {
    if (named) await storage.setName(name.trim());
    router.push(`/room/${code}`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen contentStyle={styles.content}>
        <Animated.View entering={enter(0)} style={styles.hero}>
          <Text variant="label" tone="accent">
            Party games
          </Text>
          <Text variant="hero">Game night,{'\n'}sorted.</Text>
          <Text variant="lead" tone="muted">
            Mafia, Imposter and more. The app runs the game; you bring the drama.
          </Text>
        </Animated.View>

        {connection === 'outdated' && (
          <View style={[styles.notice, { backgroundColor: c.raised }]}>
            <Text variant="strong">Update the app to keep playing</Text>
            <Text tone="muted">This version can’t talk to the game server any more.</Text>
          </View>
        )}

        <Animated.View entering={enter(1)} style={styles.block}>
          <Text variant="label" tone="muted">
            Your name
          </Text>
          <Input
            value={name}
            onChangeText={setName}
            maxLength={NAME_MAX_LENGTH}
            placeholder="What your friends call you"
            autoCapitalize="words"
            returnKeyType="done"
          />
          <Button label="Create a room" variant="accent" disabled={!named} loading={busy === 'create'} onPress={onCreate} />
        </Animated.View>

        <Animated.View entering={enter(2)} style={styles.block}>
          <Text variant="label" tone="muted">
            Got a code?
          </Text>
          <View style={styles.joinRow}>
            <Input
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ROOM_CODE_LENGTH))}
              placeholder="ABCDE"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={() => codeReady && onJoin()}
              style={[styles.codeInput, { fontFamily: fonts.semibold }]}
            />
            <Button label="Join" variant="primary" disabled={!codeReady} onPress={onJoin} style={{ minWidth: 96 }} />
          </View>
        </Animated.View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: space.xxl, paddingVertical: space.xxl },
  hero: { gap: space.md },
  block: { gap: space.sm },
  joinRow: { flexDirection: 'row', gap: space.sm },
  codeInput: { flex: 1, letterSpacing: 6 },
  notice: { borderRadius: 14, padding: space.lg, gap: 2 },
});
