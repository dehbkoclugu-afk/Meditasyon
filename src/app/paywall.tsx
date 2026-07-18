import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Screen } from '@/components';
import { space } from '@/design/tokens';
import { useTheme } from '@/design/theme';

// M5'te RevenueCat Offerings ile gerçek paywall'a dönüşecek:
// plan seçici (yıllık öne çıkan + deneme), geri yükle, şartlar/gizlilik.
// Fiyat burada asla hardcode edilmez (DESIGN.md).
export default function PaywallScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const perks = [
    'Tüm meditasyonlar ve programlar',
    'Uyku hikâyelerinin tamamı',
    'Her ay yeni içerik',
  ];

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <Screen>
        <View style={styles.stack}>
          <AppText variant="display1">Sakin Premium</AppText>
          <AppText tone="secondary">
            Pratiğini derinleştir — tüm kütüphane, sınırsız.
          </AppText>
          <View style={styles.perks}>
            {perks.map((perk) => (
              <View key={perk} style={styles.perkRow}>
                <View style={[styles.perkDot, { backgroundColor: colors.accent }]} />
                <AppText>{perk}</AppText>
              </View>
            ))}
          </View>
          <View style={[styles.planBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText variant="bodyMedium">{"Planlar M5'te RevenueCat'ten gelecek"}</AppText>
            <AppText variant="caption" tone="secondary">
              Yıllık (7 gün deneme) · Aylık · Ömür boyu
            </AppText>
          </View>
          <View style={styles.actions}>
            <Button label="Ücretsiz devam et" variant="ghost" onPress={() => router.back()} />
          </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  stack: { flex: 1, justifyContent: 'center', gap: space.lg },
  perks: { gap: space.sm },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  perkDot: { width: 8, height: 8, borderRadius: 4 },
  planBox: { borderRadius: 20, borderWidth: 1, padding: space.md, gap: 4 },
  actions: { gap: space.xs },
});
