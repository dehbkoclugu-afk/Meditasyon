import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, BreathRing, Button, Screen } from '@/components';
import { brand } from '@/config/brand';
import { requestNotificationPermission, scheduleDailyReminder } from '@/features/reminders/reminders';
import { radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { useSettings, type Intent } from '@/stores/settings';

// 4 adım: karşılama → niyet → hatırlatıcı → yumuşak paywall (PLAN.md §6.1).
// Her adım atlanabilir; "Ücretsiz devam et" daima görünür.

const INTENTS: { id: Intent; labelKey: string }[] = [
  { id: 'uyku', labelKey: 'onboarding.intentUyku' },
  { id: 'stres', labelKey: 'onboarding.intentStres' },
  { id: 'odak', labelKey: 'onboarding.intentOdak' },
  { id: 'merak', labelKey: 'onboarding.intentMerak' },
];

const REMINDER_TIMES = [
  { label: '07:00', hour: 7 },
  { label: '12:30', hour: 12, minute: 30 },
  { label: '19:00', hour: 19 },
  { label: '22:00', hour: 22 },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const settings = useSettings();
  const [step, setStep] = useState(0);
  const [intents, setIntents] = useState<Intent[]>([]);
  const [reminderChoice, setReminderChoice] = useState<number | null>(null);

  function finish(openPaywall: boolean) {
    settings.setIntents(intents);
    settings.setOnboardingDone();
    router.replace('/');
    if (openPaywall) router.push('/paywall');
  }

  async function confirmReminder() {
    if (reminderChoice !== null) {
      const time = REMINDER_TIMES[reminderChoice];
      const granted = await requestNotificationPermission();
      if (granted) {
        settings.setReminder({ enabled: true, hour: time.hour, minute: time.minute ?? 0 });
        await scheduleDailyReminder(time.hour, time.minute ?? 0);
      }
      // izin reddi: sessizce devam, ayarlardan tekrar denenir (PLAN.md §6.1)
    }
    setStep(3);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <View style={styles.root}>
          {/* Adım göstergesi: aktif nokta amber çizgiye uzar */}
          <View style={styles.dots} accessibilityLabel={`${step + 1} / 4`}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === step
                    ? { width: 24, backgroundColor: colors.accent }
                    : { backgroundColor: colors.border },
                ]}
              />
            ))}
          </View>
          {step === 0 && (
            <View style={styles.center}>
              <BreathRing size={150} />
              <View style={styles.copy}>
                <AppText variant="display1" style={styles.centerText}>
                  {brand.name}
                </AppText>
                <AppText tone="secondary" style={styles.centerText}>
                  {t('onboarding.welcomeBody')}
                </AppText>
              </View>
              <Button label={t('onboarding.welcomeCta')} onPress={() => setStep(1)} />
            </View>
          )}

          {step === 1 && (
            <View style={styles.center}>
              <View style={styles.copy}>
                <AppText variant="display2" style={styles.centerText}>
                  {t('onboarding.intentTitle')}
                </AppText>
                <AppText variant="secondary" tone="secondary" style={styles.centerText}>
                  {t('onboarding.intentBody')}
                </AppText>
              </View>
              <View style={styles.options}>
                {INTENTS.map((intent) => {
                  const active = intents.includes(intent.id);
                  return (
                    <Pressable
                      key={intent.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() =>
                        setIntents((current) =>
                          active ? current.filter((i) => i !== intent.id) : [...current, intent.id],
                        )
                      }
                      style={[
                        styles.option,
                        {
                          backgroundColor: active ? colors.surfaceHigh : colors.surface,
                          borderColor: active ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <AppText variant="bodyMedium">{t(intent.labelKey)}</AppText>
                    </Pressable>
                  );
                })}
              </View>
              <Button label={t('common.continue')} onPress={() => setStep(2)} />
            </View>
          )}

          {step === 2 && (
            <View style={styles.center}>
              <View style={styles.copy}>
                <AppText variant="display2" style={styles.centerText}>
                  {t('onboarding.reminderTitle')}
                </AppText>
                <AppText variant="secondary" tone="secondary" style={styles.centerText}>
                  {t('onboarding.reminderBody')}
                </AppText>
              </View>
              <View style={styles.chipRow}>
                {REMINDER_TIMES.map((time, index) => {
                  const active = reminderChoice === index;
                  return (
                    <Pressable
                      key={time.label}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setReminderChoice(active ? null : index)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? colors.accentSoft : colors.surface,
                          borderColor: active ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <AppText variant="bodyMedium" style={active ? { color: colors.accent } : undefined}>
                        {time.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.actions}>
                <Button
                  label={reminderChoice !== null ? t('onboarding.reminderSet') : t('onboarding.reminderSkip')}
                  onPress={confirmReminder}
                />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.center}>
              <View style={styles.copy}>
                <AppText variant="display2" style={styles.centerText}>
                  {t('onboarding.readyTitle')}
                </AppText>
                <AppText tone="secondary" style={styles.centerText}>
                  {t('onboarding.readyBody')}
                </AppText>
              </View>
              <View style={styles.actions}>
                <Button label={t('onboarding.seePremium')} onPress={() => finish(true)} />
                <Button label={t('paywall.continueFree')} variant="ghost" onPress={() => finish(false)} />
              </View>
            </View>
          )}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingTop: space.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl },
  copy: { alignItems: 'center', gap: space.xs, paddingHorizontal: space.lg },
  centerText: { textAlign: 'center' },
  options: { alignSelf: 'stretch', gap: space.xs },
  option: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, justifyContent: 'center' },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: space.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  actions: { alignSelf: 'stretch', gap: space.xs },
});
