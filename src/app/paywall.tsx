import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { AppText, Button, Screen } from '@/components';
import { purchasesGateway } from '@/features/purchases/gateway';
import { yearlySavingsPercent } from '@/features/purchases/logic';
import type { Plan, PlanId } from '@/features/purchases/types';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { usePremium } from '@/stores/premium';
import { useStats } from '@/stores/stats';

// Gerçek paywall. Fiyatlar daima RevenueCat Offerings'ten (hardcode yasak).
// Apple kontrol listesi: kapatma X'i baştan görünür, geri yükle + şartlar +
// gizlilik linkleri, "Ücretsiz devam et" her zaman erişilebilir.

const PLAN_TITLE_KEYS: Record<PlanId, string> = {
  yearly: 'paywall.yearly',
  monthly: 'paywall.monthly',
  lifetime: 'paywall.lifetime',
};

const PLAN_PERIOD_KEYS: Record<PlanId, string> = {
  yearly: 'paywall.perYear',
  monthly: 'paywall.perMonth',
  lifetime: 'paywall.oneTime',
};

// Yayın öncesi gerçek URL'lere bağlanacak (M8, docs/legal → GitHub Pages)
const TERMS_URL = 'https://example.com/sakin/kosullar';
const PRIVACY_URL = 'https://example.com/sakin/gizlilik';

type LoadState = 'loading' | 'ready' | 'unavailable';

// Sabit tohumlu yıldız alanı — her açılışta aynı gökyüzü (titreme yok)
const STARS = [
  [24, 22, 1.6], [64, 46, 1.1], [104, 18, 1.3], [148, 52, 1.0], [186, 28, 1.7],
  [226, 60, 1.2], [262, 20, 1.4], [296, 44, 1.0], [322, 66, 1.5], [46, 74, 1.0],
  [130, 82, 1.2], [206, 90, 1.0], [284, 86, 1.3], [90, 62, 0.9], [246, 36, 0.9],
] as const;

// Paywall'un gece sahnesi: yıldızlar + hilal — premium'un "uyku" vaadini kurar
function NightScene({ accent, star }: { accent: string; star: string }) {
  return (
    <Svg
      width="100%"
      height={120}
      viewBox="0 0 360 120"
      preserveAspectRatio="xMaxYMid slice"
      accessibilityElementsHidden
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="night" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7C8FC9" stopOpacity={0.12} />
          <Stop offset="1" stopColor="#7C8FC9" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect width={360} height={120} fill="url(#night)" />
      {STARS.map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill={star} opacity={i % 3 === 0 ? 0.7 : 0.4} />
      ))}
      <Path d="M318 62a24 24 0 0 1-30-30 24 24 0 1 0 30 30Z" fill={accent} opacity={0.75} />
    </Svg>
  );
}

export default function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const setPremium = usePremium((s) => s.setPremium);
  const totalMinutes = useStats((s) => s.totalMinutes);

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
      setError(t('paywall.purchaseError'));
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
      setError(t('paywall.restoreEmpty'));
    }
  }

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <Screen scroll>
        <View style={styles.stack}>
          <View style={styles.scene}>
            <NightScene accent={colors.accent} star={colors.textSecondary} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={() => router.back()}
            style={styles.close}
            hitSlop={12}
          >
            <AppText variant="display3" tone="secondary">
              ✕
            </AppText>
          </Pressable>

          <View style={styles.header}>
            <AppText variant="display1">{t('paywall.title')}</AppText>
            <AppText tone="secondary">{t('paywall.subtitle')}</AppText>
            {totalMinutes >= 10 && (
              <AppText variant="secondary" tone="accent">
                {t('paywall.personal', { count: totalMinutes })}
              </AppText>
            )}
          </View>

          <View style={styles.perks}>
            {[t('paywall.perk1'), t('paywall.perk2'), t('paywall.perk3')].map((perk) => (
              <View key={perk} style={styles.perkRow}>
                <View style={[styles.perkDot, { backgroundColor: colors.accent }]} />
                <AppText>{perk}</AppText>
              </View>
            ))}
          </View>

          {loadState === 'loading' && (
            <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText tone="secondary">{t('paywall.loading')}</AppText>
            </View>
          )}

          {loadState === 'unavailable' && (
            <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText variant="bodyMedium">{t('paywall.unavailableTitle')}</AppText>
              <AppText variant="caption" tone="secondary">
                {t('paywall.unavailableBody')}
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
                      <AppText variant="bodyMedium">{t(PLAN_TITLE_KEYS[plan.id])}</AppText>
                      {featured && savings !== null && (
                        <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
                          <AppText variant="caption" style={{ color: colors.accent }}>
                            {t('paywall.savings', { percent: savings })}
                          </AppText>
                        </View>
                      )}
                    </View>
                    <View style={styles.priceRow}>
                      <AppText variant="display3" style={styles.priceText}>
                        {plan.priceLabel}
                      </AppText>
                      <AppText variant="caption" tone="secondary">
                        {plan.id === 'lifetime' ? t('paywall.oneTime') : t(PLAN_PERIOD_KEYS[plan.id])}
                      </AppText>
                    </View>
                    {plan.trialLabel ? (
                      <AppText variant="caption" tone="secondary">
                        {t('paywall.trialThen', { trial: plan.trialLabel })}
                      </AppText>
                    ) : null}
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
                label={selectedPlan?.trialLabel ? t('paywall.startTrial') : t('paywall.buy')}
                onPress={buy}
                loading={busy}
              />
            )}
            <Button label={t('paywall.continueFree')} variant="ghost" onPress={() => router.back()} />
            <Button label={t('paywall.restore')} variant="text" onPress={restore} />
          </View>

          <View style={styles.legal}>
            <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
              <AppText variant="caption" tone="secondary">
                {t('paywall.terms')}
              </AppText>
            </Pressable>
            <AppText variant="caption" tone="secondary">
              ·
            </AppText>
            <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8}>
              <AppText variant="caption" tone="secondary">
                {t('paywall.privacy')}
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
  scene: { position: 'absolute', top: 0, left: -space.screenMargin, right: -space.screenMargin },
  close: { alignSelf: 'flex-end', minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.xs },
  priceText: { fontVariant: ['tabular-nums'] },
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
