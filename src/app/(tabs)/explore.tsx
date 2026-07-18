import { StyleSheet, Text, View } from 'react-native';

import { palette, space, type } from '@/design/tokens';

const colors = palette.dark;

export default function ExploreScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Keşfet</Text>
      <Text style={styles.hint}>Kategoriler, programlar ve arama burada olacak. (M3)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: space.screenMargin,
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: type.size.display1,
    marginBottom: space.sm,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: type.size.body,
    lineHeight: type.size.body * type.bodyLineHeight,
  },
});
