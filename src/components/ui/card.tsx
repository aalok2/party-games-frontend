import { Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { radius } from '@/shared';
import { useColors } from '@/theme/theme';

/** The one raised material: white surface, light top edge, soft shadow. Use for grouped content, not for every row. */
export function Card({ style, radiusSize = 'lg', ...rest }: ViewProps & { style?: StyleProp<ViewStyle>; radiusSize?: 'md' | 'lg' | 'xl' }) {
  const c = useColors();
  return (
    <View
      {...rest}
      style={[
        styles.card,
        { backgroundColor: c.surface, borderRadius: radius[radiusSize], borderTopColor: c.edge, shadowColor: c.shadow },
        // Android has no coloured soft shadow, so it gets a hairline instead.
        Platform.OS === 'android' && { borderWidth: StyleSheet.hairlineWidth, borderColor: c.line },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderTopWidth: 1,
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
});
