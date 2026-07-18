import { StyleSheet, Text, View } from 'react-native';

import { palette, space, type } from '@/design/tokens';

const colors = palette.dark;

export default function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Sen</Text>
      <Text style={styles.hint}>İstatistikler, favoriler ve ayarlar burada olacak. (M6)</Text>
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
