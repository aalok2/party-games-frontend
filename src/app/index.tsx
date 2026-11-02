// First screen: choose what to play. Name and room come next; people with a code can skip ahead.

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space } from '@/shared';
import { GameCard } from '@/components/games/game-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cover } from '@/components/ui/cover';
import { Text } from '@/components/ui/text';
import { toastError } from '@/components/ui/toast';
import { heroArt } from '@/lib/art';
import { useRoom } from '@/store/room';
import { easeOut } from '@/theme/motion';
import { useColors, useScheme } from '@/theme/theme';

const enter = (i: number) => FadeInDown.duration(280).delay(i * 50).easing(easeOut);

export default function PickGame() {
  const router = useRouter();
  const c = useColors();
  const scheme = useScheme();
  const insets = useSafeAreaInsets();
  const { games, loadGames, connection } = useRoom();
  const [picked, setPicked] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    loadGames().catch((e) => {
      setFailed(true);
      toastError(e);
    });
  }, [loadGames]);
  useEffect(() => {
    load();
  }, [load]);

  const current = picked ?? games[0]?.id ?? null;
  const chosen = games.find((g) => g.id === current);

  return (
    <View style={[styles.fill, { backgroundColor: c.bg }]}>
      <ScrollView style={styles.fill} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={enter(0)}>
          <ImageBackground source={heroArt(scheme)} resizeMode="cover" style={[styles.hero, { paddingTop: insets.top + 40 }]}>
            <View style={styles.column}>
              <Text variant="hero" style={styles.headline}>
                Everyone here
              </Text>
              <View style={styles.secretRow}>
                <Text variant="hero" style={styles.headline}>
                  has a{' '}
                </Text>
                <Cover label="The secret word" padding={12}>
                  <Text variant="hero" style={styles.headline}>
                    secret
                  </Text>
                </Cover>
                <Text variant="hero" style={styles.headline}>
                  .
                </Text>
              </View>
            </View>
          </ImageBackground>
        </Animated.View>

        <View style={[styles.column, styles.list]}>
          {connection === 'outdated' && (
            <Card radiusSize="md" style={styles.notice}>
              <Text variant="strong">Update the app to keep playing</Text>
              <Text tone="muted">This version can’t talk to the game server any more.</Text>
            </Card>
          )}
          <Text variant="title" style={styles.heading}>
            What are we playing?
          </Text>
          {games.length === 0 ? (
            failed ? (
              <View style={styles.status}>
                <Text tone="muted" align="center">
                  Couldn’t load the games.
                </Text>
                <Button
                  label="Try again"
                  variant="secondary"
                  size="md"
                  onPress={() => {
                    setFailed(false);
                    load();
                  }}
                />
              </View>
            ) : (
              <View style={styles.status}>
                <ActivityIndicator color={c.muted} />
              </View>
            )
          ) : (
            games.map((g, i) => (
              <Animated.View key={g.id} entering={enter(i + 1)}>
                <GameCard game={g} selected={g.id === current} onPress={() => setPicked(g.id)} />
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <View style={styles.column}>
          <Button
            label={chosen ? `Play ${chosen.name}` : 'Play'}
            variant="primary"
            disabled={!chosen}
            onPress={() => chosen && router.push({ pathname: '/new', params: { game: chosen.id } })}
          />
          <Button label="Have a code? Join a room" variant="ghost" onPress={() => router.push('/join')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: space.lg },
  hero: {
    paddingHorizontal: space.xl,
    paddingBottom: 72,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  column: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  headline: { fontSize: 40, lineHeight: 44, letterSpacing: -1.8 },
  secretRow: { flexDirection: 'row', alignItems: 'center' },
  list: { paddingHorizontal: space.lg, gap: space.lg, marginTop: space.xl },
  heading: { paddingHorizontal: 4 },
  notice: { padding: space.lg, gap: 2 },
  status: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },
  footer: { paddingHorizontal: space.lg, paddingTop: space.md, gap: space.sm },
});
