import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText, Screen } from '@/components';
import { purchasesGateway } from '@/features/purchases/gateway';
import {
  cancelReminders,
  requestNotificationPermission,
  scheduleDailyReminder,
} from '@/features/reminders/reminders';
import { radius, space } from '@/design/tokens';
import { useTheme, type ThemeMode } from '@/design/theme';
import { usePremium } from '@/stores/premium';
import { useSettings } from '@/stores/settings';

const REMINDER_TIMES = [
  { label: '07:00', hour: 7, minute: 0 },
  { label: '12:30', hour: 12, minute: 30 },
  { label: '19:00', hour: 19, minute: 0 },
  { label: '22:00', hour: 22, minute: 0 },
];

const THEME_OPTIONS: { mode: ThemeMode; labelKey: string }[] = [
  { mode: 'system', labelKey: 'settings.themeAuto' },
  { mode: 'dark', labelKey: 'settings.themeDark' },
  { mode: 'light', labelKey: 'settings.themeLight' },
];

const TERMS_URL = 'https://example.com/sakin/kosullar';
const PRIVACY_URL = 'https://example.com/sakin/gizlilik';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const settings = useSettings();
  const setPremium = usePremium((s) => s.setPremium);
  const isPremium = usePremium((s) => s.isPremium);

  async function toggleReminder(enabled: boolean) {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) return; // izin yoksa anahtar kapalı kalır
      settings.setReminder({ ...settings.reminder, enabled: true });
      await scheduleDailyReminder(settings.reminder.hour, settings.reminder.minute);
    } else {
      settings.setReminder({ ...settings.reminder, enabled: false });
      await cancelReminders();
    }
  }

  async function pickReminderTime(hour: number, minute: number) {
    settings.setReminder({ enabled: true, hour, minute });
    const granted = await requestNotificationPermission();
    if (granted) await scheduleDailyReminder(hour, minute);
  }

  function manageSubscription() {
    const url =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/account/subscriptions'
        : 'https://play.google.com/store/account/subscriptions';
    Linking.openURL(url);
  }

  async function restore() {
    const found = await purchasesGateway.restore();
    if (found) setPremium(true);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t('settings.title'), headerBackTitle: t('common.back') }} />
      <Screen scroll>
        <View style={styles.stack}>
          <Section title={t('settings.appearance')}>
            <View style={styles.chipRow}>
              {THEME_OPTIONS.map((option) => {
                const active = settings.themeMode === option.mode;
                return (
                  <Chip
                    key={option.mode}
                    label={t(option.labelKey)}
                    active={active}
                    onPress={() => settings.setThemeMode(option.mode)}
                  />
                );
              })}
            </View>
          </Section>

          <Section title={t('settings.language')}>
            <View style={styles.chipRow}>
              {(
                [
                  { value: 'system', label: t('settings.langSystem') },
                  { value: 'tr', label: 'Türkçe' },
                  { value: 'en', label: 'English' },
                ] as const
              ).map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  active={settings.language === option.value}
                  onPress={() => settings.setLanguage(option.value)}
                />
              ))}
            </View>
          </Section>

          <Section title={t('settings.reminder')}>
            <Row label={t('settings.dailyReminder')}>
              <Switch
                value={settings.reminder.enabled}
                onValueChange={toggleReminder}
                trackColor={{ true: colors.accent, false: colors.border }}
                thumbColor={colors.textPrimary}
              />
            </Row>
            {settings.reminder.enabled && (
              <View style={styles.chipRow}>
                {REMINDER_TIMES.map((time) => {
                  const active =
                    settings.reminder.hour === time.hour && settings.reminder.minute === time.minute;
                  return (
                    <Chip
                      key={time.label}
                      label={time.label}
                      active={active}
                      onPress={() => pickReminderTime(time.hour, time.minute)}
                    />
                  );
                })}
              </View>
            )}
          </Section>

          <Section title={t('settings.session')}>
            <Row label={t('settings.haptics')}>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={settings.setHapticsEnabled}
                trackColor={{ true: colors.accent, false: colors.border }}
                thumbColor={colors.textPrimary}
              />
            </Row>
          </Section>

          <Section title={t('settings.premium')}>
            <Row label={isPremium ? t('settings.membershipActive') : t('settings.membershipFree')} />
            {isPremium && <LinkRow label={t('settings.manageSubscription')} onPress={manageSubscription} />}
            <LinkRow label={t('settings.restore')} onPress={restore} />
          </Section>

          <Section title={t('settings.about')}>
            <LinkRow label={t('paywall.terms')} onPress={() => Linking.openURL(TERMS_URL)} />
            <LinkRow label={t('paywall.privacy')} onPress={() => Linking.openURL(PRIVACY_URL)} />
            <Row label={t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })} />
          </Section>
        </View>
      </Screen>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <AppText variant="caption" tone="secondary">
        {title}
      </AppText>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function Row({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <AppText>{label}</AppText>
      {children}
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <AppText tone="accent">{label}</AppText>
    </Pressable>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.accentSoft : colors.surfaceHigh,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}
    >
      <AppText variant="caption" style={active ? { color: colors.accent } : undefined}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.lg },
  section: { gap: space.xs },
  card: { borderRadius: radius.card, borderWidth: 1, paddingHorizontal: space.md, paddingVertical: space.xs, gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, paddingVertical: space.xs },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
});
