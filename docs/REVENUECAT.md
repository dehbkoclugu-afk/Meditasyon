# RevenueCat Kurulum Rehberi

Kod hazır; planların paywall'da görünmesi için bu adımlar SENİN hesaplarınla yapılmalı. Sıra önemli.

## 1. Store konsollarında ürünler

### App Store Connect (Apple)
1. Paid Apps sözleşmesini imzala (Agreements → Paid Apps), banka + vergi bilgilerini gir.
2. Uygulamayı oluştur (bundle id: `com.sakin.meditasyon` — app.json ile birebir aynı).
3. Features → In-App Purchases:
   - Abonelik grubu oluştur: `Premium`
   - **Auto-renewable:** `premium_monthly` (1 ay) ve `premium_yearly` (1 yıl, **7 gün ücretsiz deneme** introductory offer)
   - **Non-consumable:** `premium_lifetime`
4. Fiyat önerileri: aylık ₺129,99 / yıllık ₺699,99 / ömür boyu ₺1.999,99 (bölgesel fiyatları Apple otomatik türetir; istersen elle düzelt).

### Google Play Console
1. Uygulamayı oluştur (package: `com.sakin.meditasyon`), bir kez internal testing'e AAB yüklemeden IAP tanımlanamaz — ilk EAS build sonrası dön.
2. Monetize → Subscriptions:
   - `premium_monthly` (base plan: aylık)
   - `premium_yearly` (base plan: yıllık + **7 gün ücretsiz deneme** offer'ı)
3. Monetize → In-app products: `premium_lifetime`

## 2. RevenueCat panosu (app.revenuecat.com — ücretsiz)

1. Proje oluştur: `Sakin`; içine iki app ekle: iOS (bundle id) + Android (package).
2. Apple tarafı: App Store Connect API anahtarını RC'ye bağla (RC sihirbazı yönlendirir). Google tarafı: Play service account JSON'u bağla.
3. **Entitlement** oluştur: kimlik = `premium` (koddaki sabitle birebir: `src/features/purchases/gateway.native.ts`).
4. Products: üç store ürününü içe aktar, hepsini `premium` entitlement'ına bağla.
5. **Offering** oluştur: kimlik = `default` (current yap); paketleri ekle:
   - `$rc_annual` → premium_yearly
   - `$rc_monthly` → premium_monthly
   - `$rc_lifetime` → premium_lifetime
6. API Keys: iOS ve Android **public SDK** anahtarlarını kopyala.

## 3. Anahtarları uygulamaya koy

`app.json` → `expo.extra.revenueCat`:

```json
"extra": {
  "revenueCat": {
    "iosApiKey": "appl_xxxxxxxx",
    "androidApiKey": "goog_xxxxxxxx"
  }
}
```

Bunlar public anahtardır, repoya girmesi sorun değildir (secret API key'i ASLA koyma).

## 4. Sandbox testi (cihazda, dev build ile)

- **iOS:** App Store Connect → Users → Sandbox tester hesabı aç; cihazda Settings → App Store → Sandbox Account ile gir. Uygulamada paywall'dan deneme başlat → iptal et → geri yükle senaryolarını dene.
- **Android:** Play Console → Setup → License testing'e Gmail adresini ekle; internal testing parkurundan kur.
- Uçak modunda premium içeriğe erişim sürmeli (MMKV'deki son durum) — kontrol et.

## Kod tarafı nasıl çalışıyor (özet)

- Açılışta `Purchases.configure` (anonim kullanıcı — hesap yok); `CustomerInfo` dinleyicisi premium durumunu `usePremium` store'una yazar, MMKV offline saklar.
- Paywall fiyatları `Offerings`'ten okur; koddaki tek kimlikler `premium` (entitlement) ve paket tipleri (ANNUAL/MONTHLY/LIFETIME). Store ürün kimliklerini kod bilmez — RC eşler.
- "Satın alımları geri yükle" Apple zorunluluğudur; paywall'da hazır.
