import { Stack, useRouter } from 'expo-router';
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

const INTENTS: { id: Intent; label: string }[] = [
  { id: 'uyku', label: 'Daha iyi uyku' },
  { id: 'stres', label: 'Stresle başa çıkma' },
  { id: 'odak', label: 'Odaklanma' },
  { id: 'merak', label: 'Sadece merak' },
];

const REMINDER_TIMES = [
  { label: '07:00', hour: 7 },
  { label: '12:30', hour: 12, minute: 30 },
  { label: '19:00', hour: 19 },
  { label: '22:00', hour: 22 },
];

export default function OnboardingScreen() {
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
          {step === 0 && (
            <View style={styles.center}>
              <BreathRing size={150} />
              <View style={styles.copy}>
                <AppText variant="display1" style={styles.centerText}>
                  {brand.name}
                </AppText>
                <AppText tone="secondary" style={styles.centerText}>
                  Türkçe yönlendirmeli meditasyon. Hazır olduğunda başla.
                </AppText>
              </View>
              <Button label="Başlayalım" onPress={() => setStep(1)} />
            </View>
          )}

          {step === 1 && (
            <View style={styles.center}>
              <View style={styles.copy}>
                <AppText variant="display2" style={styles.centerText}>
                  Seni buraya ne getirdi?
                </AppText>
                <AppText variant="secondary" tone="secondary" style={styles.centerText}>
                  Birden fazla seçebilirsin — önerileri buna göre ayarlarız.
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
                      <AppText variant="bodyMedium">{intent.label}</AppText>
                    </Pressable>
                  );
                })}
              </View>
              <Button label="Devam" onPress={() => setStep(2)} />
            </View>
          )}

          {step === 2 && (
            <View style={styles.center}>
              <View style={styles.copy}>
                <AppText variant="display2" style={styles.centerText}>
                  Günlük nazik bir hatırlatma?
                </AppText>
                <AppText variant="secondary" tone="secondary" style={styles.centerText}>
                  Günde en fazla bir bildirim. İstediğin an kapatabilirsin.
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
                  label={reminderChoice !== null ? 'Hatırlatıcıyı kur' : 'Şimdilik geç'}
                  onPress={confirmReminder}
                />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.center}>
              <View style={styles.copy}>
                <AppText variant="display2" style={styles.centerText}>
                  Hazırsın
                </AppText>
                <AppText tone="secondary" style={styles.centerText}>
                  Başlangıç programı ücretsiz. Tüm kütüphane için Premium her zaman burada.
                </AppText>
              </View>
              <View style={styles.actions}>
                <Button label="Premium'u incele" onPress={() => finish(true)} />
                <Button label="Ücretsiz devam et" variant="ghost" onPress={() => finish(false)} />
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
