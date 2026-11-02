import { StyleSheet, View } from 'react-native';
import { tones } from '@/shared';
import { fonts } from '@/theme/theme';
import { Text } from './text';

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export function Avatar({ name, tone, size = 40, dimmed }: { name: string; tone: number; size?: number; dimmed?: boolean }) {
  return (
    <View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tones[tone % tones.length], opacity: dimmed ? 0.35 : 1 },
      ]}
    >
      <Text style={{ color: '#fff', fontFamily: fonts.semibold, fontSize: size * 0.38, lineHeight: size * 0.5 }}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({ dot: { alignItems: 'center', justifyContent: 'center' } });
