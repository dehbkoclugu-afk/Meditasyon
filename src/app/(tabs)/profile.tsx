import { StyleSheet, View } from 'react-native';

import { AppText, Screen, StatTile } from '@/components';
import { space } from '@/design/tokens';

// M6'da gerçek veri gelecek: istatistik store'u, favoriler, ayarlar girişi.
export default function ProfileScreen() {
  return (
    <Screen>
      <View style={styles.stack}>
        <AppText variant="display2">Sen</AppText>
        <View style={styles.tiles}>
          <StatTile value="0" label="toplam dakika" />
          <StatTile value="0" label="seans" />
          <StatTile value="0" label="seri (gün)" />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.lg },
  tiles: { flexDirection: 'row', gap: space.sm },
});
