# Impeccable Audit (native) — 2026-07-20

Kaynak-kod denetimi (audit.native.md akışı, adaptive platform). Cihaz testi
yapılamayan maddeler RELEASE.md kontrol listesine bağlandı.

## Skor

| # | Boyut | Puan | Not |
|---|-------|------|-----|
| 1 | Erişilebilirlik | 3 | Etiketler + roller tam; dinamik yazı 1.3x sınırlı; dokunma hedefleri bu geçişte 44pt'ye çıkarıldı. VoiceOver sıra testi cihaz gerektirir |
| 2 | Performans | 3 | Katalog küçük (29) — ScrollView map yeterli; grain/hale transform-only. Katalog >100 olursa FlatList'e geçilmeli (not) |
| 3 | Görünüm & Tema | 4 | Tüm renkler token'dan; koyu/açık birinci sınıf; ham hex yalnız tokens.ts'te |
| 4 | Platform Uyumu | 3 | Standart tab/modal desenleri, tutarlı özel ikon seti, inset'ler Screen'de; predictive back Android'de kapalı (şablon varsayılanı — cihazda değerlendirilecek) |
| 5 | Uyarlanabilirlik | 3 | 640px içerik sınırı (tablet), portre kilidi bilinçli (meditasyon); klavye davranışı cihazda doğrulanacak |
| **Toplam** | | **16/20** | **Good** |

## Bu geçişte düzeltilenler

- [P1] 36/40pt çipler → 44pt (player, ayarlar, keşfet filtreleri, zamanlayıcı,
  nefes süre seçici, Bugün kategori çipleri)

## Açık kalanlar (cihaz gerektirir → RELEASE.md §2)

- [P2] VoiceOver/TalkBack gerçek gezinme sırası ve odak kaybı testi
- [P2] Android predictive back değerlendirmesi (predictiveBackGestureEnabled)
- [P2] Klavye/inset: arama girişi klavye açıkken görünür mü (Android adjustResize)
- [P3] Katalog 100+ seansa ulaşırsa Keşfet sonuçları FlatList'e taşınmalı
- [P3] Dinamik yazı %130 üstü kırpma taraması (cihazda büyük fontla)

## İyi durumda

Token disiplini, tek ikon seti, reduced-motion alternatifleri (halka opaklık,
hale statik), kilit rozeti yerine dürüst premium etiketi, boş durum sahneleri.
