import { StyleSheet, View } from 'react-native';

import { AppText, Screen } from '@/components';
import { space } from '@/design/tokens';

// M3'te gerçek içerik gelecek: arama, kategori grid'i, program rafı.
export default function ExploreScreen() {
  return (
    <Screen>
      <View style={styles.stack}>
        <AppText variant="display2">Keşfet</AppText>
        <AppText tone="secondary">Kategoriler, programlar ve arama burada olacak.</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.xs },
});
