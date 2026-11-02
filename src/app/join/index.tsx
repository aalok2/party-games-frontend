// Join with a code: no game choice needed, the room already has one.

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ROOM_CODE_LENGTH, space } from '@/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { fonts } from '@/theme/theme';

export default function JoinWithCode() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const ready = code.length === ROOM_CODE_LENGTH;
  const go = () => ready && router.replace(`/room/${code}`);

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen footer={<Button label="Join the room" variant="primary" disabled={!ready} onPress={go} />}>
        <View style={styles.head}>
          <Button label="Back" variant="ghost" size="md" onPress={() => router.back()} style={styles.back} />
          <Text variant="display">Join a room</Text>
          <Text tone="muted">Ask the host for the {ROOM_CODE_LENGTH}-letter code.</Text>
        </View>
        <Input
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ROOM_CODE_LENGTH))}
          placeholder="ABCDE"
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          returnKeyType="go"
          onSubmitEditing={go}
          style={[styles.code, { fontFamily: fonts.semibold }]}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  head: { gap: space.sm },
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  code: { fontSize: 28, letterSpacing: 10, minHeight: 68, textAlign: 'center' },
});
