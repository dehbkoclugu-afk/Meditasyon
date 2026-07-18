import { StyleSheet, View } from 'react-native';

import { AppText, BreathRing } from '@/components';
import { space } from '@/design/tokens';

// M3'te gerçek içerik gelecek: selamlama saate göre, öneri motoru, devam rafı.
export default function TodayScreen() {
  return (
    <View style={styles.center}>
      <BreathRing size={140} />
      <View style={styles.copy}>
        <AppText variant="display1">İyi akşamlar</AppText>
        <AppText tone="secondary" style={styles.sub}>
          Günün önerisi ve devam eden programın burada olacak.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxl,
    padding: space.screenMargin,
  },
  copy: { alignItems: 'center', gap: space.xs },
  sub: { textAlign: 'center', maxWidth: 280 },
});
