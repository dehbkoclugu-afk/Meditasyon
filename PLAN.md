# Yönlendirmeli Meditasyon Uygulaması — Uygulama Planı (Aşırı Detaylı)

## 0. Bağlam

**Neden:** Kullanıcı iOS + Android'de çalışan, ücretli (freemium + abonelik) bir yönlendirmeli meditasyon uygulaması istiyor. Meditasyon seslerini kendisi kaydedecek; bizim işimiz uygulamanın tamamı: mimari, tasarım, içerik boru hattı, oynatıcı, monetizasyon, yayın.

**Kesinleşen kararlar (kullanıcı onaylı):**
- Teknoloji: **Expo / React Native** (tek kod tabanı, EAS dev build)
- Gelir modeli: **Freemium + Abonelik** (aylık / yıllık+deneme / ömür boyu) — **RevenueCat**
- İçerik: **Backend'siz, uygulamaya gömülü** (sesler app bundle içinde; yeni içerik EAS Update OTA ile veya store güncellemesiyle gelir — sunucu maliyeti sıfır)
- Dil: **Türkçe + İngilizce** arayüz (ses içeriği başlangıçta Türkçe)

**Depo durumu:** `dehbkoclugu-afk/Meditasyon` tamamen boş (ilk commit yok). Çalışma dalı: `claude/paid-meditation-app-plan-ax79b6`. Greenfield.

**Skill talimatı:** Kullanıcı caveman, taste ve impeccable skill'lerinin yüklenip tasarımda kullanılmasını istedi. Plan modunda kurulum yapılamadığı için kurulum **M0'ın ilk adımı**dır; taste + impeccable'ın tasarım prensipleri bu planın 5. bölümüne şimdiden işlenmiştir.

---

## 1. Ürün Tanımı

- **Çalışma adı:** `Sakin` (placeholder — kullanıcı değiştirebilir; kod içinde marka adı tek bir sabitten okunur: `src/config/brand.ts`)
- **Değer önerisi:** Türkçe, insan sesiyle (kullanıcının kendi kaydı) yönlendirilen meditasyonlar; uyku, stres, odak. Yerli içerik = Calm/Headspace'in Türkçe boşluğu.
- **Hedef kitle:** 20–45 yaş, meditasyona yeni/orta seviye, Türkçe konuşan; ikincil: EN arayüzle gezinen ama TR ses dinleyen kullanıcılar.
- **Platformlar:** iOS 15.1+, Android 7+ (API 24+). Tablet birinci sınıf değil ama kırılmamalı.

---

## 2. İçerik Modeli (katalog şeması)

Backend olmadığı için **tek doğruluk kaynağı** repo içindeki manifest: `content/catalog.json` (+ TS tip güvencesi `zod` şemasıyla derleme sırasında doğrulanır).

### 2.1 Varlık tipleri

1. **Session (tekli meditasyon):** id, tip (`guided` | `sleep_story` | `breathing` | `soundscape`), başlık (TR/EN), açıklama (TR/EN), süre (saniye — ingest script otomatik yazar), kategori id'leri, ses dosyası yolu, kapak görseli/illüstrasyon ref, `access: "free" | "premium"`, yayın tarihi, sıra ağırlığı, anlatıcı id.
2. **Program (çok günlük kurs):** id, başlık, açıklama, gün sayısı, sıralı session id listesi, `access`, tamamlanma rozeti. Kural: kullanıcı günleri sırayla açar (gün N bitmeden N+1 kilitli — ayarlardan kapatılabilir).
3. **Category:** id, ad (TR/EN), ikon, renk vurgusu, sıra. Başlangıç seti: `uyku`, `stres-kaygi`, `odak`, `sabah`, `nefes`, `beden-taramasi`, `sukran`, `oz-sefkat`.
4. **Ambience (arka plan sesi):** yağmur, orman, dalga, beyaz gürültü… Player'da anlatıcı sesiyle **ayrı kanalda** karıştırılır (kullanıcı ambience ses seviyesini ayrı kontrol eder). Loop'lanabilir, gapless.
5. **Breathing exercise (nefes):** ses dosyası opsiyonel; esas olarak animasyon güdümlü — patern tanımı JSON'da: `{ inhale: 4, hold: 4, exhale: 6, holdEmpty: 0, cycles: 10 }` (kutu nefesi, 4-7-8 vb. hazır patternler).

### 2.2 Lansman içerik hedefi (kullanıcının kayıt listesi)

- **"Başlangıç" programı (7 gün × 8–10 dk)** → tamamı **ücretsiz** (ürünün tanıtım vitrini)
- Kategori başına 3–5 tekli seans (10–15 dk) → çoğu premium, kategori başına 1 tanesi ücretsiz
- 2 uyku hikâyesi (20–30 dk) → 1 ücretsiz, 1 premium
- 3 nefes egzersizi (animasyon + kısa yönlendirme sesi) → ücretsiz
- 5 ambience loop'u (telifsiz kaynaklardan veya kullanıcı kaydından) → ücretsiz
- **Toplam lansman:** ~30 seans; ücretsiz katman ~12 parça. Uygulama boyutu hedefi: ses toplamı ≤ 250 MB (AAC ile ~4–5 saat içerik sığar).

### 2.3 İçerik güncelleme akışı (backend'siz)

Yeni meditasyon eklemek = `content/audio/` klasörüne m4a koy + `catalog.json`'a kayıt ekle + `npm run content:validate` + EAS Update yayınla (store incelemesi gerekmez, JS+asset OTA gider). Büyük içerik dalgalarında normal store güncellemesi.

---

## 3. Ses Boru Hattı (kullanıcının kayıtları → uygulama)

### 3.1 Kayıt spesifikasyonu (kullanıcıya talimat dokümanı: `docs/RECORDING.md` olarak repoya yazılacak)

- Kayıt: **48 kHz / 24-bit WAV, mono**, sessiz oda, mikrofona 15–20 cm, pop filtresi
- Baş/son 2 sn sessizlik bırak (fade için)
- Dosya adı: `{tip}-{slug}-{dil}.wav` → örn. `guided-uykuya-gecis-tr.wav`
- Ham kayıtlar repoya **girmez** (`content/raw/` gitignore'da); sadece işlenmiş m4a'lar commit'lenir. Git LFS gerekmez (m4a'lar ~10–25 MB).

### 3.2 Ingest script (`scripts/ingest-audio.mjs`, ffmpeg tabanlı)

Tek komut: `npm run content:ingest -- content/raw/dosya.wav`
1. Loudness normalize: `ffmpeg -i in.wav -af loudnorm=I=-16:TP=-1.5:LRA=11` (konuşma için -16 LUFS; ambience -20 LUFS)
2. Baş/son otomatik trim + 1.5 sn fade-in/out
3. Encode: konuşma → AAC 96 kbps mono `.m4a`; ambience/müzikli → AAC 128 kbps stereo
4. Süreyi `ffprobe` ile okuyup `catalog.json`'daki ilgili kayda yazar (elle süre girme yok)
5. Çıktıyı `content/audio/{id}.m4a`'ya koyar
- `npm run content:validate`: zod şema kontrolü + her `audioFile`'ın diskte var olduğunu + yetim dosya olmadığını doğrular. CI'da koşar.

### 3.3 Placeholder içerik (geliştirme için)

Kullanıcı kayıtları gelene kadar: `scripts/gen-placeholders.mjs` ffmpeg ile sessiz/ton m4a'lar üretir; katalog gerçek yapıda, sesler sahte. Böylece uygulama, kayıtlar hazır olmadan uçtan uca biter — kayıtlar geldikçe dosyalar değişir, kod değişmez.

---

## 4. Teknik Mimari

### 4.1 Çekirdek yığın

| Katman | Seçim | Neden |
|---|---|---|
| Framework | Expo SDK (güncel) + TypeScript strict | Tek kod tabanı, EAS build/update |
| Router | `expo-router` | Dosya tabanlı, deep link bedava |
| Ses | **`react-native-track-player`** | Kilit ekranı kontrolleri, background audio, iOS Now Playing / Android MediaSession — meditasyon uygulamasının kalbi. (RevenueCat zaten native modül gerektirdiği için Expo Go değil **dev build** kullanılacak; RNTP bu yüzden serbest.) |
| Abonelik | `react-native-purchases` (RevenueCat) | Entitlement yönetimi backend'siz çözülür |
| State | `zustand` + `react-native-mmkv` (persist) | Basit, hızlı, senkron storage |
| Animasyon | `react-native-reanimated` + `react-native-svg` | Nefes animasyonu, player halkası, geçişler |
| i18n | `i18next` + `expo-localization` | TR/EN; katalogdaki metinler `{ tr, en }` obje |
| Bildirim | `expo-notifications` (yalnız yerel bildirim) | Günlük hatırlatıcı; push sunucusu yok |
| Grafik/ikon | `lucide-react-native` değil → özel minimal ikon seti tercih; gerekirse `phosphor` ince stil | Anti-slop: jenerik ikon görünümünden kaçın |
| Test | `jest` + `@testing-library/react-native`; kritik akışlar için `maestro` (opsiyonel) | |
| Lint | `eslint` + `prettier` + `typescript` CI'da | |

### 4.2 Neden background audio kritik ve nasıl yapılacak

- iOS: `UIBackgroundModes: ["audio"]` (app.json → infoPlist); Android: Foreground Service + MediaSession (RNTP halleder)
- Ekran kilitliyken: oynat/duraklat, 15 sn geri, kapak görseli kilit ekranında
- Kesinti yönetimi: telefon araması gelirse duraklat, bitince (kullanıcı ayarına göre) devam
- Ambience mikslemesi: RNTP tek kanal çalar → ambience için ikinci hafif çalar (`expo-audio`) paralelde loop; ikisinin ses seviyeleri bağımsız. Uyku zamanlayıcısı ikisini birden fade-out ile durdurur.

### 4.3 Veri modeli (tamamı yerel — MMKV)

```ts
// persist edilen store'lar
progress: { [sessionId]: { completedAt: string[], lastPositionSec: number } }
programProgress: { [programId]: { unlockedDay: number, completedDays: number[] } }
stats: { totalMinutes: number, totalSessions: number, streak: { current, best, lastActiveDate } }
favorites: string[]                 // session id'leri
settings: { language, reminderTime, theme, ambienceVolume, autoResumeAfterCall, keepScreenAwake }
premium: { isActive, expiresAt }    // RevenueCat cache'i — tek doğruluk kaynağı RC SDK, bu sadece offline yansıma
```
- Streak kuralı: gün içinde ≥1 seans tamamlama (≥%80 dinlenmişse "tamamlandı"). Gece yarısı sınırı cihaz saat dilimine göre.
- Hesap yok → veri cihazda. Ayarlarda "verileri dışa aktar/içe aktar" (JSON dosyası) ile cihaz geçişi çözümü (v1.1'e ertelenebilir).

### 4.4 Proje yapısı

```
Meditasyon/
├── app/                          # expo-router rotaları
│   ├── (tabs)/
│   │   ├── index.tsx             # Bugün (ana ekran)
│   │   ├── explore.tsx           # Keşfet / Kütüphane
│   │   ├── breathe.tsx           # Nefes
│   │   └── profile.tsx           # Sen (istatistik + ayarlar girişi)
│   ├── player/[sessionId].tsx    # Tam ekran oynatıcı (modal)
│   ├── program/[programId].tsx
│   ├── category/[categoryId].tsx
│   ├── paywall.tsx               # Premium modal
│   ├── onboarding.tsx
│   └── settings/…                # ayarlar, hatırlatıcı, dil, hakkında, gizlilik
├── src/
│   ├── components/               # DS bileşenleri (Button, Card, PlayRing, LockBadge…)
│   ├── design/                   # tokens.ts (renk/tip/spacing/motion) — tek kaynak
│   ├── features/                 # player/, paywall/, stats/, breathing/, reminders/
│   ├── content/                  # catalog loader, zod şema, erişim (gating) mantığı
│   ├── i18n/                     # tr.json, en.json
│   ├── stores/                   # zustand store'ları
│   └── config/brand.ts
├── content/
│   ├── catalog.json
│   ├── audio/*.m4a
│   └── art/*                     # kapak illüstrasyonları
├── scripts/                      # ingest-audio.mjs, gen-placeholders.mjs, validate-catalog.mjs
├── docs/RECORDING.md             # kullanıcıya kayıt rehberi
├── PRODUCT.md + DESIGN.md        # /impeccable init çıktıları
└── .github/workflows/ci.yml     # tsc + eslint + jest + content:validate
```

---

## 5. Tasarım Sistemi (taste + impeccable prensipleri gömülü)

`/impeccable init` M0'da koşulacak (mod: **product**); aşağıdakiler PRODUCT.md/DESIGN.md'nin ilk içeriği olacak.

### 5.1 Yasaklar (anti-slop sözleşmesi — DESIGN.md'ye aynen girer)

- Inter/system font her yerde → **yasak**; mor-mavi gradient → **yasak**; kart içinde kart → **yasak**
- Saf siyah (#000) / saf gri metin → **yasak**, her nötr renk tonlanır (yeşile çalan koyu)
- Renkli zeminde gri metin → **yasak**; bounce/elastic easing → **yasak**
- Her başlığın üstünde yuvarlak-kare ikon karosu → **yasak**; emoji ikon olarak → **yasak**
- Taste dial'ları: `DESIGN_VARIANCE: 4` (sakin, simetriye yakın ama tekdüze değil), `MOTION_INTENSITY: 3` (yavaş, nefes ritminde), `VISUAL_DENSITY: 3` (ferah — meditasyon ürünü nefes almalı)

### 5.2 Renk (dark-first; ışık teması ikincil)

Kavram: **"gece ormanı + mum ışığı"** — soğuk koyu yeşil zemin, sıcak amber vurgu.

```
bg           #0D1412   (koyu, yeşile tonlanmış — saf siyah değil)
surface      #152019
surfaceHigh  #1D2B22
textPrimary  #F1EDE4   (sıcak kırık beyaz)
textSecond   #A8B3A6   (yeşilimsi gri — zeminle akraba)
accent       #E4B75D   (amber/mum — CTA, ilerleme halkası, streak alevi)
accentSoft   #E4B75D22 (yüzeylerde hale)
success      #8FBF9F · danger #D98E7A (pastel, alarmsız)
kategori vurguları: uyku #7C8FC9 · odak #C9A96B · nefes #86B8A8 … (her biri zeminle harmanlanmış, neon yok)
```
Işık teması: `#F5F1E8` kağıt zemin, aynı amber vurgu; otomatik + manuel seçim.

### 5.3 Tipografi

- **Display: Fraunces** (Google Fonts; Türkçe diakritik tam destek — ğ, ş, İ test edilecek) — başlıklar, seans adları, süre rakamları (soft serif = insani, "app template" hissinin tam tersi)
- **Body: Albert Sans** — arayüz metinleri, açıklamalar
- Ölçek: 34/28/22 display · 17 body · 15 secondary · 13 caption; satır aralığı gevşek (body 1.5)
- Rakamlar (süre, istatistik) tabular-nums

### 5.4 Şekil, boşluk, derinlik

- Spacing: 4'lük ızgara — 8/12/16/24/32/48; ekran kenar boşluğu 24
- Radius: kart 20, buton 999 (hap), player kapak 28 — yumuşak ama jelibon değil
- Derinlik gölgeyle değil **zemin katmanı + %1–2 doku** ile (çok hafif grain overlay — premium his); border'lar `#FFFFFF0A`
- Kapak görselleri: fotoğraf yerine **soyut gradient-mesh / organik blob illüstrasyonlar** (SVG, kategori rengiyle türetilmiş) — tutarlı, telif dertsiz, boyutu küçük

### 5.5 Motion (nefes ritminde)

- Süreler: 300–600 ms; easing `cubic-bezier(0.4, 0, 0.2, 1)`; asla bounce
- İmza animasyon: **nefes halkası** — ana ekran hero'sunda ve nefes egzersizinde ölçek 1.0→1.15 arası 4 sn'lik döngüde yumuşakça büyüyüp küçülen halka (reanimated)
- Player: kapak arkasında çok yavaş dönen (120 sn/tur) amber ışık halesi; ilerleme dairesel halka
- Ekran geçişleri: fade + 12 px yukarı kayma; player modal'i alttan yumuşak yükselir

### 5.6 Ses–arayüz uyumu

- Seans bitiminde tek yumuşak "tibet çanı" (ayarlardan kapatılır); haptic: seans başı/sonu hafif `impactLight`
- Player açıkken ekran karartma modu: 10 sn dokunulmazsa arayüz %90 söner, sadece halka kalır

---

## 6. Ekran Ekran Döküm

### 6.1 Onboarding (ilk açılış, 4 adım, atlanabilir)

1. Karşılama: marka + nefes halkası animasyonu, tek cümle değer önerisi
2. Niyet seçimi (çoklu): "Daha iyi uyku / Stres / Odak / Merak" → ana ekran önerilerini kişiselleştirir (MMKV'ye yazılır)
3. Hatırlatıcı: saat seç → yerel bildirim izni burada istenir ("izin körlüğü" olmadan, bağlamıyla)
4. Yumuşak paywall: yıllık+deneme öne çıkar, **"Ücretsiz devam et" her zaman görünür** (Apple reddi riskine karşı zorunlu)
- Edge: bildirim izni reddi → sessizce devam, ayarlardan tekrar; onboarding tamamlanınca flag MMKV'ye.

### 6.2 Bugün (ana sekme)

- Selamlama (saate göre: "İyi akşamlar") + streak alevi (amber) + bugünkü dakika
- **Hero kart:** günün önerisi (niyet + saat + geçmişe göre basit kural motoru; gece → uyku içeriği). Devam eden program varsa "Gün 3'e devam et" hero'yu alır
- "Devam et" rafı (yarım kalan seanslar, kaldığı saniyeden), kategori kısayolları, "Yeni eklenenler"
- Boş durumlar: ilk gün → "Başlangıç programının 1. gününe başla" tek odaklı hero

### 6.3 Keşfet / Kütüphane

- Arama (başlık+açıklama, TR/EN, diakritik-duyarsız), kategori grid'i, programlar rafı, süre filtresi (≤5 / 10 / 15+ dk)
- Premium içerik kilit rozeti: kilit ikonu değil, zarif **amber nokta + "Premium"** etiketi; tıklayınca paywall (hangi içerikten gelindiği analytics'e yazılır)

### 6.4 Player (tam ekran modal)

- Kapak (nefes halesi), başlık, kategori, kalan süre; dairesel ilerleme
- Kontroller: 15 sn geri · oynat/duraklat (büyük, 72 px) · 15 sn ileri; hız yok (meditasyonda gereksiz)
- Alt sıra: favori ♥ · uyku zamanlayıcısı (5/10/20/45 dk/seans sonu → fade-out) · ambience seçici (ses + ayrı volüm slider'ı)
- Davranış: kilit ekranı kontrolleri; çıkışta pozisyon kaydı; ≥%80 dinleme = tamamlandı → streak/istatistik güncelle + bitiş ekranı ("3 gün üst üste 🔥 yerine zarif metin + halka animasyonu", sonraki seans önerisi)
- Edge: ses dosyası eksikse (bozuk update) zarif hata + "yeniden dene"; kulaklık çekilince duraklat; araya çağrı → duraklat/geri dön

### 6.5 Program detay

- Kapak, açıklama, gün listesi (tamamlandı ✓ / bugünkü → vurgulu / kilitli günler soluk)
- Premium programda ilk gün her zaman dinlenebilir ("tadına bak" kuralı) → paywall dönüşümünü besler

### 6.6 Nefes (sekme)

- Patern kartları (Kutu 4-4-4-4, 4-7-8, Sakinleşme 4-6). Egzersiz ekranı: tam ekran halka, faz metni ("Nefes al… Tut… Ver…"), faz geçişinde hafif haptic, opsiyonel yönlendirme sesi; süre seçimi 1/3/5 dk
- Tamamen ücretsiz (alışkanlık yaratıcı, günlük açılış sebebi)

### 6.7 Sen (profil)

- İstatistik: toplam dakika, seans sayısı, streak (şimdiki/en iyi), son 8 haftalık ısı şeridi (GitHub grid'inin zarif, tek renkli amber versiyonu)
- Favoriler, rozetler (7 gün streak, ilk program bitti, 100 dk…) — sade, çocuksu değil
- Ayarlar girişi; Premium durumu ("Premium üyesin · yıllık" / "Premium'a geç" CTA)

### 6.8 Ayarlar

Dil (TR/EN + sistem) · tema (koyu/açık/otomatik) · hatırlatıcı saati · bitiş çanı aç/kapa · çağrı sonrası otomatik devam · aboneliği yönet (RC → store yönlendirme) · **Satın alımları geri yükle** (Apple zorunlu) · gizlilik politikası & kullanım şartları linkleri (Apple zorunlu, webview) · veri dışa/içe aktar (v1.1) · hakkında/sürüm

### 6.9 Paywall (tek modal, her kilitli temas noktasından açılır)

- Üstte değer önerisi + 3–4 madde (tüm içerik, yeni her ay, uyku hikâyeleri, çevrimdışı zaten var)
- Plan seçici: **Yıllık (öne çıkan, "%X tasarruf" + 7 gün ücretsiz deneme)** · Aylık · Ömür boyu
- Altta: geri yükle · şartlar · gizlilik (Apple reddi önleme üçlüsü); kapatma X'i ilk andan görünür
- A/B altyapısı yok (v1); metinler i18n'de, fiyatlar RC Offerings'ten dinamik çekilir (hardcode fiyat **yasak**)

---

## 7. Monetizasyon Detayı (RevenueCat)

### 7.1 Ürün kurulumu

| Ürün | Store ID | Öneri fiyat (TR / US) | Not |
|---|---|---|---|
| Aylık | `premium_monthly` | ₺129,99 / $6.99 | Deneme yok |
| Yıllık | `premium_yearly` | ₺699,99 / $39.99 | **7 gün ücretsiz deneme**, paywall'da varsayılan |
| Ömür boyu | `premium_lifetime` | ₺1.999,99 / $99.99 | Non-consumable |

- RC tarafı: tek entitlement **`premium`**; Offering `default` üç paketle. Fiyatlar store konsollarında bölgesel otomatik.
- Uygulama tarafı: `Purchases.configure` app açılışında (anonim ID — hesap sistemi yok, RC anonim kullanıcıyla entitlement'ı cihaza bağlar; "geri yükle" store hesabından tanır). `CustomerInfo` listener → zustand `premium` store'u günceller; offline'da son bilinen durum MMKV'den.
- Gating tek fonksiyon: `canAccess(session, isPremium)` → `content/access.ts`. Kural motoru: `access === "free"` veya `isPremium` veya "programın 1. günü".

### 7.2 Store konsol işleri (kod dışı, kullanıcı + biz)

- Apple: paid apps sözleşmesi, vergi/banka; App Store Connect'te 3 IAP + abonelik grubu; **gizlilik politikası URL'si zorunlu** (basit statik sayfa — GitHub Pages'te barındırılabilir, repo içinde `docs/legal/`)
- Google: Play Console'da abonelikler + base plan/offer (deneme yıllıkta); kapalı test parkuru
- RevenueCat: iki app (iOS/Android) tek proje, API key'ler `app.json` extra → `expo-constants` ile okunur (secret değildir, public SDK key)

---

## 8. Bildirimler (yalnız yerel)

- Günlük hatırlatıcı: kullanıcının seçtiği saatte, dönen 10+ nazik metin havuzundan ("2 dakikan var mı?") — TR/EN
- Streak koruma: dün seans yapıldı + bugün 21:00'e kadar yapılmadıysa tek nazik hatırlatma (spam değil; ayardan kapatılır)
- Uygulama açılınca o günün bildirimi iptal; tüm planlama `expo-notifications` yerel API'siyle, sunucu yok

---

## 9. Analitik & Kalite (privacy-first)

- Crash: **Sentry** (`sentry-expo`) — yalnız hata; PII yok
- Ürün analitiği v1'de **yok** (backend'siz felsefeyle uyumlu, store metrikleri + RC dashboard'u yeter). RC zaten dönüşüm/deneme/iptal metriklerini verir.
- App Tracking Transparency **gerekmez** (takip yok) → App Privacy formu "veri toplamıyor"a yakın doldurulur; bu bir pazarlama avantajı ("gizliliğe saygılı")

---

## 10. Uygulama Fazları

### M0 — Temel + Skill'ler (½ gün)
1. Skill kurulumları:
   ```
   claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
   npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
   npx skills add https://github.com/pbakaus/impeccable
   ```
2. `/impeccable init` (mod: product) → PRODUCT.md + DESIGN.md (Bölüm 5 içeriğiyle)
3. `npx create-expo-app` (TypeScript, expo-router şablonu), prettier/eslint, CI workflow (tsc+lint+test+content:validate), ilk commit + push

### M1 — Tasarım sistemi (1 gün)
`src/design/tokens.ts` (Bölüm 5 birebir) · Fraunces+Albert Sans yüklemesi (`expo-font`) + **Türkçe diakritik render testi** · çekirdek bileşenler: Button, SessionCard, ProgramCard, LockBadge, Screen, StatTile, BreathRing (reanimated) · koyu/açık tema altyapısı

### M2 — İçerik boru hattı (1 gün)
`catalog.json` şeması (zod) + lansman kataloğunun iskeleti (Bölüm 2.2 listesi, gerçek başlık/açıklamalarla) · `ingest-audio.mjs`, `gen-placeholders.mjs`, `validate-catalog.mjs` · placeholder sesler üret · `docs/RECORDING.md` yaz · SVG kapak üreteci (kategori renginden organik blob)

### M3 — Navigasyon + ana ekranlar (2 gün)
Tab yapısı, Bugün (öneri kuralı dahil), Keşfet (arama+filtre), kategori/program detayları, boş durumlar

### M4 — Player + ses motoru (2 gün, en riskli faz)
RNTP entegrasyonu (dev build!), background/kilit ekranı, pozisyon kaydı, tamamlanma eşiği, uyku zamanlayıcısı, ambience ikinci kanal, kesinti senaryoları, bitiş ekranı

### M5 — Monetizasyon (1,5 gün)
RC SDK + Offerings'ten dinamik paywall, gating (`canAccess`), geri yükle, ayarlar entegrasyonu, sandbox testleri (iOS sandbox hesap + Play lisans testçisi)

### M6 — Alışkanlık katmanı (1,5 gün)
Onboarding 4 adım, yerel bildirimler, streak/istatistik/rozetler, nefes egzersizi ekranı, haptics+bitiş çanı

### M7 — i18n + cila (1,5 gün)
tr.json/en.json tamamı + katalog TR/EN metinleri · erişilebilirlik: VoiceOver/TalkBack etiketleri, dokunma hedefleri ≥44 px, dinamik font taşma kontrolü · `/impeccable audit` + `/impeccable polish` + `/impeccable critique` koş, bulguları uygula · performans: açılış <2 sn, liste 60 fps

### M8 — Yayın (1–2 gün + inceleme süreleri)
EAS production build (iOS+Android) · store metadata TR/EN (ad, altbaşlık, açıklama, anahtar kelimeler), ekran görüntüleri (6.7"/6.1"/Android; tasarım dilinde şablonlu) · App Privacy formu, içerik derecelendirmesi · TestFlight + Play kapalı test → gerçek kayıtlarla son katalog → mağaza incelemesine gönderim · Apple abonelik reddi kontrol listesi (geri yükle ✓, şartlar linki ✓, fiyat görünür ✓, ücretsiz devam ✓)

**Toplam:** ~12–14 iş günü kod + kullanıcının kayıt süresi (paralel yürür).

---

## 11. Doğrulama Planı

- **Otomatik:** CI'da `tsc --noEmit` + eslint + jest (gating kuralı, streak hesabı, katalog şeması, öneri motoru birim testleri) + `content:validate`
- **Cihazda (fiziksel cihaz şart):**
  - Ses: kilit ekranında 20 dk kesintisiz oynatma (iOS+Android), çağrı kesintisi, kulaklık çekme, uyku zamanlayıcısı fade'i, ambience miks
  - IAP: iOS sandbox'ta deneme başlat/iptal/geri yükle; Android lisans testçisiyle aynısı; uçak modunda premium içeriğe erişim (offline entitlement)
  - Streak: cihaz saatini ileri alarak gün atlama senaryoları
  - i18n: TR/EN geçişi + Türkçe karakterlerin Fraunces'ta doğru render'ı
- **Tasarım kabulü:** `/impeccable audit` temiz + Bölüm 5.1 yasaklar listesine karşı elle tarama

## 12. Riskler

1. **RNTP + Expo entegrasyonu** (M4): en olası sürtünme noktası; dev build ilk M0'da alınıp M4 beklemeden ses PoC'u doğrulanacak
2. **Apple abonelik incelemesi:** ret sebeplerinin tamamı 6.9 + M8 kontrol listesinde önceden kapatıldı
3. **Uygulama boyutu:** ses ≤250 MB bütçesi; aşılırsa bitrate düşürme (96→80 kbps konuşmada fark edilmez) veya en uzun uyku hikâyelerini v1.1 OTA'ya bırakma
4. **Backend'siz büyüme tavanı:** kullanıcı hesabı/cihazlar arası senkron istenirse ileride Supabase eklenebilir — mimari bunu bloklamaz (içerik erişimi ve istatistik tek modülde soyutlandı)
