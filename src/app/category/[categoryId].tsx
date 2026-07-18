import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText, Screen, SessionCard } from '@/components';
import { canAccessSession } from '@/content/access';
import { catalog, sessionsInCategory } from '@/content/catalog';
import { useOpenSession } from '@/features/navigation';
import { durationLabel } from '@/i18n/format';
import { useLocale } from '@/i18n';
import { space } from '@/design/tokens';
import { usePremium } from '@/stores/premium';

export default function CategoryScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const openSession = useOpenSession();
  const isPremium = usePremium((s) => s.isPremium);

  const category = catalog.categories.find((c) => c.id === categoryId);
  if (!category) {
    return (
      <Screen>
        <AppText variant="display2">{t('common.notFound')}</AppText>
      </Screen>
    );
  }

  const sessions = sessionsInCategory(category.id);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: category.name[locale], headerBackTitle: t('common.back') }} />
      <Screen scroll>
        <View style={styles.stack}>
          <AppText variant="display1">{category.name[locale]}</AppText>
          {sessions.length === 0 ? (
            <AppText tone="secondary">{t('category.empty')}</AppText>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                title={session.title[locale]}
                durationLabel={durationLabel(session.durationSec, locale)}
                categoryLabel={category.name[locale]}
                categoryId={session.categories[0]}
                locked={!canAccessSession(session, isPremium)}
                onPress={() => openSession(session)}
              />
            ))
          )}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.sm },
});
