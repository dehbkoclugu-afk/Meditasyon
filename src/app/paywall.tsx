import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Screen } from '@/components';
import { purchasesGateway } from '@/features/purchases/gateway';
import { yearlySavingsPercent } from '@/features/purchases/logic';
import type { Plan, PlanId } from '@/features/purchases/types';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { usePremium } from '@/stores/premium';

// Gerçek paywall. Fiyatlar daima RevenueCat Offerings'ten (hardcode yasak).
// Apple kontrol listesi: kapatma X'i baştan görünür, geri yükle + şartlar +
// gizlilik linkleri, "Ücretsiz devam et" her zaman erişilebilir.

const PLAN_TITLES: Record<PlanId, string> = {
  yearly: 'Yıllık',
  monthly: 'Aylık',
  lifetime: 'Ömür boyu',
};

const PLAN_PERIOD: Record<PlanId, string> = {
  yearly: '/yıl',
  monthly: '/ay',
  lifetime: 'tek seferlik',
};

// Yayın öncesi gerçek URL'lere bağlanacak (M8, docs/legal → GitHub Pages)
const TERMS_URL = 'https://example.com/sakin/kosullar';
const PRIVACY_URL = 'https://example.com/sakin/gizlilik';

type LoadState = 'loading' | 'ready' | 'unavailable';

export default function PaywallScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const setPremium = usePremium((s) => s.setPremium);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [selected, setSelected] = useState<PlanId>('yearly');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!purchasesGateway.isAvailable()) {
        setLoadState('unavailable');
        return;
      }
      try {
        const loaded = await purchasesGateway.getPlans();
        if (cancelled) return;
        setPlans(loaded);
        setLoadState(loaded.length > 0 ? 'ready' : 'unavailable');
      } catch {
        if (!cancelled) setLoadState('unavailable');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const savings = yearlySavingsPercent(plans);
  const selectedPlan = plans.find((p) => p.id === selected);

  async function buy() {
    if (!selectedPlan || busy) return;
    setBusy(true);
    setError(null);
    const result = await purchasesGateway.purchase(selectedPlan.id);
    setBusy(false);
    if (result === 'success') {
      setPremium(true);
      router.back();
    } else if (result === 'error') {
      setError('Satın alma tamamlanamadı. Tekrar dener misin?');
    } // cancelled: sessiz
  }

  async function restore() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const found = await purchasesGateway.restore();
    setBusy(false);
    if (found) {
      setPremium(true);
      router.back();
    } else {
      setError('Geri yüklenecek satın alma bulunamadı.');
    }
  }

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <Screen scroll>
        <View style={styles.stack}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kapat"
            onPress={() => router.back()}
            style={styles.close}
            hitSlop={12}
          >
            <AppText variant="display3" tone="secondary">
              ✕
            </AppText>
          </Pressable>

          <View style={styles.header}>
            <AppText variant="display1">Sakin Premium</AppText>
            <AppText tone="secondary">Pratiğini derinleştir — tüm kütüphane, sınırsız.</AppText>
          </View>

          <View style={styles.perks}>
            {[
              'Tüm meditasyonlar ve programlar',
              'Uyku hikâyelerinin tamamı',
              'Her ay yeni içerik',
            ].map((perk) => (
              <View key={perk} style={styles.perkRow}>
                <View style={[styles.perkDot, { backgroundColor: colors.accent }]} />
                <AppText>{perk}</AppText>
              </View>
            ))}
          </View>

          {loadState === 'loading' && (
            <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText tone="secondary">Planlar yükleniyor…</AppText>
            </View>
          )}

          {loadState === 'unavailable' && (
            <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText variant="bodyMedium">Mağaza bağlantısı bu ortamda yok</AppText>
              <AppText variant="caption" tone="secondary">
                Planlar cihazda, RevenueCat yapılandırması sonrası görünür (docs/REVENUECAT.md).
              </AppText>
            </View>
          )}

          {loadState === 'ready' && (
            <View style={styles.planList}>
              {plans.map((plan) => {
                const active = selected === plan.id;
                const featured = plan.id === 'yearly';
                return (
                  <Pressable
                    key={plan.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setSelected(plan.id)}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: active ? colors.surfaceHigh : colors.surface,
                        borderColor: active ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.planTop}>
                      <AppText variant="bodyMedium">{PLAN_TITLES[plan.id]}</AppText>
                      {featured && savings !== null && (
                        <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
                          <AppText variant="caption" style={{ color: colors.accent }}>
                            %{savings} tasarruf
                          </AppText>
                        </View>
                      )}
                    </View>
                    <AppText variant="secondary" tone="secondary">
                      {plan.trialLabel ? `${plan.trialLabel}, sonra ` : ''}
                      {plan.priceLabel}
                      {PLAN_PERIOD[plan.id] === 'tek seferlik' ? ' · tek seferlik' : PLAN_PERIOD[plan.id]}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}

          {error && (
            <AppText variant="secondary" tone="danger">
              {error}
            </AppText>
          )}

          <View style={styles.actions}>
            {loadState === 'ready' && (
              <Button
                label={selectedPlan?.trialLabel ? 'Denemeyi başlat' : 'Premium’a geç'}
                onPress={buy}
                loading={busy}
              />
            )}
            <Button label="Ücretsiz devam et" variant="ghost" onPress={() => router.back()} />
            <Button label="Satın alımları geri yükle" variant="text" onPress={restore} />
          </View>

          <View style={styles.legal}>
            <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
              <AppText variant="caption" tone="secondary">
                Kullanım Koşulları
              </AppText>
            </Pressable>
            <AppText variant="caption" tone="secondary">
              ·
            </AppText>
            <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8}>
              <AppText variant="caption" tone="secondary">
                Gizlilik Politikası
              </AppText>
            </Pressable>
          </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.lg, paddingTop: space.xl },
  close: { alignSelf: 'flex-end', minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  header: { gap: space.xs },
  perks: { gap: space.sm },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  perkDot: { width: 8, height: 8, borderRadius: 4 },
  infoBox: { borderRadius: radius.card, borderWidth: 1, padding: space.md, gap: 4 },
  planList: { gap: space.sm },
  planCard: { borderRadius: radius.card, borderWidth: 1, padding: space.md, gap: 4 },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: 999, paddingHorizontal: space.sm, paddingVertical: 3 },
  actions: { gap: space.xs },
  legal: { flexDirection: 'row', justifyContent: 'center', gap: space.xs, paddingBottom: space.lg },
});
