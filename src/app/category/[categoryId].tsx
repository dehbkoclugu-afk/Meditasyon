import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText, CoverArt, EmptyState, Screen, SessionCard } from '@/components';
import { canAccessSession } from '@/content/access';
import { catalog, categoryCoverSeed, sessionsInCategory } from '@/content/catalog';
import { useOpenSession } from '@/features/navigation';
import { durationLabel } from '@/i18n/format';
import { useLocale } from '@/i18n';
import { radius, space, type CategoryId } from '@/design/tokens';
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
          {/* Dev, kırpık kapak: kategori kimliği başlığın üstünde nefes alır */}
          <View style={styles.headerArt} accessibilityElementsHidden>
            <View style={styles.headerArtInner}>
              <CoverArt
                seed={categoryCoverSeed(category.id).seed}
                categoryId={category.id as CategoryId}
                height={280}
                kind={categoryCoverSeed(category.id).kind}
              />
            </View>
          </View>
          <AppText variant="display1">{category.name[locale]}</AppText>
          {category.tagline && (
            <AppText tone="secondary">{category.tagline[locale]}</AppText>
          )}
          {sessions.length === 0 ? (
            <EmptyState scene="category" body={t('category.empty')} />
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                kind={session.type}
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
  headerArt: { height: 150, borderRadius: radius.card, overflow: 'hidden' },
  headerArtInner: { marginTop: -65 },
});
