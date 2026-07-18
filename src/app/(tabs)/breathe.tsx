import { StyleSheet, View } from 'react-native';

import { AppText, Screen } from '@/components';
import { space } from '@/design/tokens';

// M6'da gerçek içerik gelecek: patern kartları (Kutu, 4-7-8), egzersiz ekranı.
export default function BreatheScreen() {
  return (
    <Screen>
      <View style={styles.stack}>
        <AppText variant="display2">Nefes</AppText>
        <AppText tone="secondary">Nefes egzersizleri burada olacak.</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.xs },
});
