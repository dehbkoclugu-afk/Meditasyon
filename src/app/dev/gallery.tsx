import { StyleSheet, View } from 'react-native';

import {
  AppText,
  BreathRing,
  Button,
  LockBadge,
  ProgramCard,
  Screen,
  SessionCard,
  StatTile,
} from '@/components';
import { fonts, space } from '@/design/tokens';

// Gizli tasarım galerisi — tüm bileşen varyantları tek ekranda.
// taste/impeccable audit'leri ve Türkçe diakritik kontrolü buradan yapılır.
// Erişim: /dev/gallery (tab bar'da görünmez).

const TR_TEST = "Iğdır'da yağış şıklığı — İĞDIR'DA YAĞIŞ ŞIKLIĞI";

export default function GalleryScreen() {
  return (
    <Screen scroll>
      <View style={styles.stack}>
        <AppText variant="display2">Galeri</AppText>

        <Section title="Tipografi + Türkçe diakritik">
          <AppText variant="display3">{TR_TEST}</AppText>
          <AppText>{TR_TEST}</AppText>
          <AppText variant="display3" style={{ fontFamily: fonts.displayItalic }}>
            Hazır olduğunda başla
          </AppText>
          <AppText variant="numeral">12:34 · 1.250</AppText>
        </Section>

        <Section title="Butonlar">
          <Button label="Seansa başla" onPress={noop} />
          <Button label="Yükleniyor" onPress={noop} loading />
          <Button label="Devre dışı" onPress={noop} disabled />
          <Button label="Tümünü gör" onPress={noop} variant="ghost" />
          <Button label="Atla" onPress={noop} variant="text" />
        </Section>

        <Section title="Kartlar">
          <SessionCard
            title="Uykuya Yumuşak Geçiş"
            durationLabel="15 dk"
            categoryLabel="Uyku"
            categoryId="uyku"
            locked
            onPress={noop}
          />
          <SessionCard
            title="Sabah Niyeti"
            durationLabel="8 dk"
            categoryLabel="Sabah"
            categoryId="sabah"
            onPress={noop}
          />
          <ProgramCard
            title="Başlangıç"
            subtitle="7 gün · Meditasyona giriş"
            progress={3 / 7}
            onPress={noop}
          />
          <ProgramCard
            title="Derin Uyku"
            subtitle="5 gün · Uyku programı"
            locked
            onPress={noop}
          />
        </Section>

        <Section title="Rozet + istatistik">
          <LockBadge />
          <View style={styles.tiles}>
            <StatTile value="128" label="toplam dakika" />
            <StatTile value="9" label="seri (gün)" />
          </View>
        </Section>

        <Section title="Nefes halkası">
          <View style={styles.ringWrap}>
            <BreathRing size={120} />
          </View>
        </Section>
      </View>
    </Screen>
  );
}

function noop() {}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="caption" tone="secondary">
        {title.toLocaleUpperCase('tr')}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.xl },
  section: { gap: space.sm },
  tiles: { flexDirection: 'row', gap: space.sm },
  ringWrap: { alignItems: 'center', paddingVertical: space.lg },
});
