# Yayın Rehberi — Sakin

Sıralı kontrol listesi. Kod tarafı hazır; buradaki adımların çoğu SENİN
hesaplarını gerektirir. Tik atarak ilerle.

## 0. Ön koşullar

- [ ] Apple Developer hesabı (99$/yıl) + Paid Apps sözleşmesi imzalı
- [ ] Google Play Console hesabı (25$ tek seferlik)
- [ ] Expo hesabı (ücretsiz) — `npx eas login`
- [ ] RevenueCat hesabı — `docs/REVENUECAT.md` adımları
- [ ] ffmpeg kurulu (kayıt işleme için)

## 1. Proje bağlama (bir kez)

```bash
npx eas init                # EAS project id'yi app.json'a yazar
npx eas update:configure    # EAS Update (OTA içerik) kanallarını bağlar
```

## 2. Dev build + cihaz testleri

```bash
npx eas build --profile development --platform ios      # veya android
```

Cihazda test listesi (PLAN.md §11):
- [ ] Kilit ekranında 20 dk kesintisiz oynatma; kontroller çalışıyor (oynat/duraklat/±15 sn)
- [ ] Telefon araması gelince duraklıyor; kulaklık çekilince duraklıyor
- [ ] Uyku zamanlayıcısı: fade-out yumuşak; ambience ile anlatıcı birlikte çalıyor, seviyeler bağımsız
- [ ] Bildirim: seçilen saatte geliyor, günde 1
- [ ] Streak: cihaz saatini ileri alarak gün atlatınca doğru sıfırlanıyor
- [ ] TR/EN geçişi; Fraunces'ta ğ/ş/İ doğru; VoiceOver/TalkBack ile ana akış geziliyor
- [ ] Dinamik yazı boyutu %130'da taşma yok

## 3. Gerçek içerik

- [ ] Kayıtlar `docs/RECORDING.md`'ye göre alınıp `npm run content:ingest` ile işlendi
- [ ] `npm run content:validate` temiz; uygulama boyutu kontrol (ses toplamı ≤ 250 MB)
- [ ] Placeholder kalmadı: `ls content/audio/*.wav` boş dönmeli

## 4. Monetizasyon canlı testi

- [ ] RevenueCat anahtarları `app.json`'da; paywall planları cihazda görünüyor
- [ ] iOS sandbox: deneme başlat → iptal → geri yükle
- [ ] Android lisans testçisi: aynı akış
- [ ] Uçak modunda premium içerik açık kalıyor (offline entitlement)

## 5. Yasal + mağaza metadata

- [ ] `docs/legal/*.md` gözden geçirildi, tarihler dolduruldu, GitHub Pages'te yayınlandı
- [ ] Uygulamadaki placeholder URL'ler gerçek adreslerle değiştirildi:
      `src/app/paywall.tsx` ve `src/app/settings/index.tsx` içindeki `TERMS_URL` / `PRIVACY_URL`
- [ ] `docs/STORE.md` metinleri konsollara girildi; ekran görüntüleri alındı
- [ ] App Privacy formu STORE.md'deki cevaplarla dolduruldu

## 6. Production build + gönderim

```bash
npx eas build --profile production --platform all
npx eas submit --platform ios       # TestFlight
npx eas submit --platform android   # Internal testing
```

- [ ] TestFlight / kapalı testte 2-3 gün gerçek kullanım
- [ ] Apple abonelik red kontrolü: paywall'da fiyat görünür ✓, geri yükle ✓,
      koşullar+gizlilik linkleri ✓, "Ücretsiz devam et" ✓, kapatma X ✓
- [ ] Mağaza incelemesine gönder

## 7. Yayın sonrası: içerik güncelleme (OTA)

Yeni meditasyon eklemek (store incelemesi gerekmez):

```bash
# 1. kaydı işle: npm run content:ingest -- content/raw/yeni.wav yeni-seans-id
# 2. catalog.json'a kaydı ekle (yoksa) + npm run content:validate
git add content src/content && git commit && git push
npx eas update --channel production --message "Yeni seans: ..."
```

Not: native modül eklenirse (yeni paket) OTA yetmez — yeni store build gerekir.
