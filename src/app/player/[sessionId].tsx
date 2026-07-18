import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, CoverArt, Screen } from '@/components';
import { catalog, sessionsById } from '@/content/catalog';
import { durationLabel } from '@/i18n/format';
import { space } from '@/design/tokens';

// M4'te gerçek oynatıcıya dönüşecek (react-native-track-player):
// kilit ekranı kontrolleri, pozisyon kaydı, uyku zamanlayıcısı, ambience miksi.
export default function PlayerScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();

  const session = sessionId ? sessionsById.get(sessionId) : undefined;
  if (!session) {
    return (
      <Screen>
        <AppText variant="display2">Seans bulunamadı</AppText>
      </Screen>
    );
  }

  const categoryName =
    catalog.categories.find((c) => c.id === session.categories[0])?.name.tr ?? '';

  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <Screen>
        <View style={styles.center}>
          <View style={styles.artWrap}>
            <CoverArt seed={session.id} categoryId={session.categories[0]} height={220} />
          </View>
          <View style={styles.copy}>
            <AppText variant="caption" tone="secondary">
              {categoryName.toLocaleUpperCase('tr')} · {durationLabel(session.durationSec, 'tr')}
            </AppText>
            <AppText variant="display1" style={styles.title}>
              {session.title.tr}
            </AppText>
            <AppText tone="secondary" style={styles.desc}>
              {session.description.tr}
            </AppText>
          </View>
          <AppText variant="secondary" tone="secondary" style={styles.note}>
            {"Ses motoru M4'te geliyor — şimdilik önizleme."}
          </AppText>
          <Button label="Kapat" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: space.xl },
  artWrap: { borderRadius: 28, overflow: 'hidden' },
  copy: { gap: space.xs, alignItems: 'center' },
  title: { textAlign: 'center' },
  desc: { textAlign: 'center' },
  note: { textAlign: 'center' },
});
