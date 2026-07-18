import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Screen, SessionCard } from '@/components';
import { canAccessSession } from '@/content/access';
import { catalog, sessionsInCategory } from '@/content/catalog';
import { useOpenSession } from '@/features/navigation';
import { durationLabel } from '@/i18n/format';
import { space } from '@/design/tokens';
import { usePremium } from '@/stores/premium';

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const openSession = useOpenSession();
  const isPremium = usePremium((s) => s.isPremium);

  const category = catalog.categories.find((c) => c.id === categoryId);
  if (!category) {
    return (
      <Screen>
        <AppText variant="display2">Kategori bulunamadı</AppText>
      </Screen>
    );
  }

  const sessions = sessionsInCategory(category.id);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: category.name.tr, headerBackTitle: 'Geri' }} />
      <Screen scroll>
        <View style={styles.stack}>
          <AppText variant="display1">{category.name.tr}</AppText>
          {sessions.length === 0 ? (
            <AppText tone="secondary">Bu kategoriye yakında içerik eklenecek.</AppText>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                title={session.title.tr}
                durationLabel={durationLabel(session.durationSec, 'tr')}
                categoryLabel={category.name.tr}
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
