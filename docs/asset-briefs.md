# Sakin — Sanat Yönü & Asset Üretim Brief'leri

Bu doküman, görsel üretim AI'ına (Midjourney, DALL·E, Imagen, Firefly…) **tek tek**
verilir. Her zaman önce ANA STİL PROMPT'unu, sonra ilgili asset'in kendi prompt'unu
yapıştır. Dosyaları aşağıdaki tam adlarla teslim et (`assets/brand/`); yerleşim ve
placeholder sistemi uygulamada hazır (`src/content/art-registry.ts` +
`src/components/ArtSlot.tsx`) — dosyayı koyup registry'de bir satır değiştirmen yeter.

> **Kaynak tek doğruluk:** Renk/tipografi/motion değerleri `DESIGN.md` ve
> `src/design/tokens.ts`'ten gelir. Bir çelişki olursa tokens kazanır.

---

## ANA STİL PROMPT (her asset prompt'undan önce yapıştır)

> **Stil: "Gece Ormanı" — sakin, çağdaş, editoryal soyut.** Elle boyanmış hissi veren
> dijital guaj/suluboya; yumuşak fırça grenli, ince kağıt dokulu. DÜZ vektör DEĞİL,
> 3D render DEĞİL, fotoğraf DEĞİL, stok-görsel DEĞİL. Renk dünyası: yeşile tonlanmış
> gece zemini `#0D1412`, orman-yeşili yüzey `#152019`, sıcak kırık-beyaz `#F1EDE4`,
> ve sahnedeki **tek ışık kaynağı** olarak mum-amber `#E4B75D` — ışık her zaman mum
> ışığı veya ilk şafak gibi hisseder. Değerler koyu-orta tutulur ki üstüne gelen
> kırık-beyaz metin okunabilsin. Yumuşak atmosferik derinlik, hafif film greni
> (%2–3), nazik vignette. Ruh hâli: huzurlu, sessiz, sıcak, güven veren; gece ormanı,
> ay ışığı ve mum sıcaklığı çağrıştırır — ama minimal ve modern, geniş sakin negatif
> alanlarla. İnsan figürü (varsa) yüzsüz/sadeleşmiş, arkadan veya siluet; asla
> fotogerçekçi değil, daima onurlu. Görselin içinde metin, harf, filigran, logo yok.
>
> **Negatif prompt:** text, watermark, signature, photorealism, 3D render, plastic
> sheen, neon, glow abartısı, mor-pembe AI gradient, lens flare, aşırı doygunluk,
> kalabalık kompozisyon, çizgi-film outline, anime, emoji, stok-fotoğraf, fazladan
> uzuv, bozuk anatomi, saf siyah `#000`, saf gri.

**Tutarlılık kontrolleri (araç destekliyorsa):**
- Midjourney: `--style raw --stylize 200 --chaos 4`; tüm asset'leri tek oturumda üret,
  ilk kabul edilen kareyi diğerlerine `--sref` olarak ver.
- DALL·E/Imagen: ana prompt'u birebir koru; palet dört hex'e oturana kadar yeniden üret;
  aynı sohbette "same illustration style as previous" de.
- Verilen piksel boyutuna en az eşit üret, PNG dışa aktar (belirtilen yerlerde şeffaf).

**Sakin sözleşmesi (DESIGN.md yasakları — asla ihlal etme):**
Fotoğraf yok · mor-mavi gradient yok · neon/glow yok · glassmorphism yok · saf siyah/gri
yok · amber ekran başına bir kez konuşur (kompozisyonda tek sıcak odak).

---

## Slot listesi (özet)

| Slot | Ad | Dosya | Boyut | Şeffaf | Yerleşim |
|------|-----|-------|-------|--------|----------|
| S1 | Logomark | `S1-logomark.png` | 512² | ✓ | Onboarding/başlık, app geneli |
| S2 | App icon | `S2-appicon.png` | 1024² | — | Mağaza/launcher |
| S3 | Splash | `S3-splash.png` | 1284×2778 | — | Açılış ekranı |
| S4 | Grain doku | `S4-grain.png` | 512² | ✓ | Global %2 doku overlay |
| S5 | Onboarding hero | `S5-onboarding-hero.png` | 1170×1000 | — | Onboarding 1. adım |
| S6.x | Kategori kapakları (8) | `S6-<cat>.png` | 1170×760 | — | Kategori başlıkları/kartlar |
| S7 | Program crest — Başlangıç | `S7-baslangic-crest.png` | 720² | ✓ | Program tanıtım ekranı |
| S8 | Paywall hero | `S8-paywall-hero.png` | 1170×900 | — | Paywall üst kartı |
| S9 | Player amber hale | `S9-player-halo.png` | 720² | ✓ | Player kapak arkası hale |
| S10 | Seans bitiş sahnesi | `S10-finish.png` | 900² | ✓ | Seans bitişi kutlama |
| S11.x | Ambient rozetleri (5) | `S11-<amb>.png` | 400² | ✓ | Ambient seçici çipleri |
| S12.x | Boş durum sahneleri (3) | `S12-<scene>.png` | 600² | ✓ | Arama/favori/kategori boş |

> Seans kapakları (`content/art/*.jpg`) ayrı bir üretim hattına sahiptir (aşağıda
> "Seans kapakları" bölümü). ArtSlot registry'si (`src/content/art-registry.ts`)
> yukarıdaki S-slotları içindir; seans/kategori kapakları `CoverArt` +
> `artwork-map.ts` üzerinden çalışır.

---

## S1 — Logomark · `S1-logomark.png` · 512×512 · şeffaf PNG
**Yerleşim:** onboarding başlık (44px), sonra app geneli.
> Minimal, sakin logomark: tek sürekli zarif çizgiyle çizilmiş, bir mum alevine
> dönüşen yaprak/hilal formu — huzur ve uyanış. Sıcak amber `#E4B75D`, şeffaf zemin,
> `#EAC braun` iç gradient hissi, çok hafif dış hale. Bir daire içinde dengeli, 24 px'te
> okunur. Düz amblem, sahne yok, arka plan yok. --ar 1:1

## S2 — App icon · `S2-appicon.png` · 1024×1024 · opak
> App icon: S1 alev-yaprak logomark'ı, gece-yeşili radyal gradient (`#152019` merkez →
> `#0D1412` kenar) üzerinde ortalanmış amber ile; arkasında çok hafif radyal amber
> hale. Metin yok, kenarlık yok. 60 px'te okunmalı. Düz, premium, sakin. --ar 1:1

## S3 — Splash · `S3-splash.png` · 1284×2778 · opak
> Açılış ekranı: neredeyse saf gece-yeşili `#0D1412` alan, amber logomark tam merkezde
> küçük ve soluk bir haleyle, köşelerde belli belirsiz iki-üç yıldız. Aşırı minimal,
> nefes alan boşluk. --ar 9:19.5

## S4 — Grain doku · `S4-grain.png` · 512×512 · şeffaf
> Nötr monokrom film-greni karo, tekdüze, tekrarlanabilir (tileable), şeffaf üstüne
> %50 gri, ince 35mm gren. (Herhangi bir doku üreticisi olur; AI opsiyonel.)
> Uygulamada %2 opaklıkta global overlay olarak kullanılır.

## S5 — Onboarding hero · `S5-onboarding-hero.png` · 1170×1000 (1.17:1)
**Yerleşim:** onboarding 1. adım, ~280pt yükseklik, köşe yarıçapı 20.
> Geniş hero sahne: arkadan görünen küçük bir figür, gece ormanının kıyısında sakin bir
> tepede oturuyor/diz çökmüş; üst üçte iki gece-yeşili gökyüzü `#0D1412`, seyrek amber
> yıldızlar; ufukta mum-amber `#E4B75D` bir ilk şafak figürün omuzlarını yumuşakça
> aydınlatıyor. Gökte geniş huzurlu negatif alan. Guaj, yumuşak gren. Kompozisyon
> alt-merkeze demirli, üst kısım sessiz kalır. --ar 7:6

## S6 — Kategori kapakları · `S6-<cat>.png` · 1170×760 (~3:2) — 8 dosya
**Yerleşim:** kategori başlığı/kartı; alt %40 koyu scrim + kırık-beyaz metin alır — o
bölgeyi sakin ve koyu tut. Her kapak, kategorinin token rengiyle harmanlanır (neon yok).

| Dosya | Kategori | Sahne (ana prompt'a ekle) |
|-------|----------|---------------------------|
| `S6-uyku.png` | Uyku | Ay yolu vuran durgun gece gölü, ince sis, üst üçte bir yıldız serpili gökyüzü; indigo-yeşil `#7C8FC9` harman. --ar 3:2 |
| `S6-stres-kaygi.png` | Stres & Kaygı | Ağır bulutları yaran tek amber huzme, altında sakinleşen su; erik-moru `#B98FA6` harman. --ar 3:2 |
| `S6-odak.png` | Odak | Karanlıkta tek noktaya odaklı mum alevi, çevresinde eş merkezli yumuşak halkalar; kum-altını `#C9A96B` harman. --ar 3:2 |
| `S6-sabah.png` | Sabah | Tepelerin ardından yükselen ilk ışık, sırtları backlit çimen; sıcak `#D9B98A` harman. --ar 3:2 |
| `S6-nefes.png` | Nefes | Suya düşen tek damladan yayılan eş merkezli daireler, gece-yeşil su; adaçayı `#86B8A8` harman. --ar 3:2 |
| `S6-beden-taramasi.png` | Beden Taraması | Tepeden tırnağa süzülen yumuşak ışık şeridi, sakin yatay katmanlar; nötr yeşil harman. --ar 3:2 |
| `S6-sukran.png` | Şükran | Taşan küçük kil kâse, amber damlalar, sıcak iç mekân ışığı; bronz harman. --ar 3:2 |
| `S6-oz-sefkat.png` | Öz Şefkat | Sıcak mum ışığında birbirine yaklaşan iki el, yüzsüz, derin yeşil çevre; yumuşak amber. --ar 3:2 |

## S7 — Program crest · `S7-baslangic-crest.png` · 720×720 · şeffaf
**Yerleşim:** "Başlangıç" program tanıtım ekranı, ~120pt.
> Kişisel "yolculuk mührü": 7 günü çağrıştıran, yükselen bir mum alevini saran zeytin/
> defne dalı çelengi; gravür-madalya hissi ama guaj boyalı, amber `#E4B75D` çizgi +
> kırık-beyaz vurgular, şeffaf zemin. Kutlamalı ama sakin. --ar 1:1

## S8 — Paywall hero · `S8-paywall-hero.png` · 1170×900 (13:10)
**Yerleşim:** paywall üst kartı, ~260pt; alt yarı koyu scrim + beyaz metin alır — dram
üst yarıda kalsın. **Fiyat görselde YOK** (fiyat daima RevenueCat'ten gelir).
> Görkemli ama samimi sahne: izleyici karanlık bir orman açıklığından / taş kemerden
> mum-amber şafağa bakıyor; ışık açıklıktan içeri dolup toz zerrelerini yakalıyor,
> siluet çerçeveliyor. Üst yarı: ufukta `#E4B75D`'ten yukarıda `#152019`'a ışıklı
> gökyüzü gradyanı. Huzur ve davet, "ışığa doğru bir adım". --ar 13:10

## S9 — Player amber hale · `S9-player-halo.png` · 720×720 · şeffaf
**Yerleşim:** player kapak görselinin arkasında çok yavaş dönen hale (120 sn/tur).
> Yumuşak radyal amber hale/duman bulutu, merkezden dışa doğru sönümlenen `#E4B75D`,
> şeffaf zemin; nefes ritminde hafif düzensiz kenarlar. Sahne yok, sadece ışık dokusu.
> Kapak arkasında dönerken canlı ama sakin durur. --ar 1:1

## S10 — Seans bitiş sahnesi · `S10-finish.png` · 900×900 · şeffaf
**Yerleşim:** seans bitişi kutlama ekranı, nefes halkasının arkasında opsiyonel.
> Küçük spot illüstrasyon, şeffaf zemin: karanlık topraktan bir huzme amber ışıkta
> filizlenen tek fidan, iki kırık-beyaz yaprak; guaj, mütevazı ve umutlu. Sessiz bir
> tebrik. --ar 1:1

## S11 — Ambient rozetleri · `S11-<amb>.png` · 400×400 · şeffaf — 5 dosya
**Yerleşim:** player ambient seçici çipleri, ~40pt. Tek nesne, amber-ışıklı, şeffaf,
gevşek kenar.
| Dosya | Ambient | Konu |
|-------|---------|------|
| `S11-amb-yagmur.png` | Yağmur | pencere camında amber ışıkla parlayan yağmur damlaları |
| `S11-amb-orman-sabahi.png` | Orman sabahı | sisli ağaç siluetleri arasından süzülen tek ışık |
| `S11-amb-deniz-dalgalari.png` | Deniz dalgaları | ay/amber yolu yansıyan tek yumuşak dalga |
| `S11-amb-beyaz-gurultu.png` | Beyaz gürültü | yumuşak eş merkezli dalga halkaları, nötr sıcak |
| `S11-amb-gece-circirlari.png` | Gece cırcırları | yıldız yuvasında hilal, birkaç amber kıvılcım |

## S12 — Boş durum sahneleri · `S12-<scene>.png` · 600×600 · şeffaf — 3 dosya
**Yerleşim:** boş liste durumları. (Şu an `EmptyState` SVG çiziyor; bu slotlar guaj
alternatifidir — istersen ArtSlot ile değiştirilir.)
| Dosya | Sahne | Konu |
|-------|-------|------|
| `S12-search.png` | Arama boş | dalgalar arasında tek amber nokta, sakin yatay ufuk |
| `S12-heart.png` | Favori boş | topraktan filizlenen küçük amber fidan |
| `S12-category.png` | Kategori boş | tepenin ardından doğan küçük ay, birkaç yıldız |

---

## Seans kapakları (`content/art/*.jpg`) — ayrı hat

29 seans + 8 kategori kapağı `CoverArt` bileşeni tarafından basılır: `artwork-map.ts`'te
bir jpg varsa onu, yoksa deterministik SVG sahnesine (blob/yıldızlı gece/nefes halkaları)
düşer. Bu kapakları **yeniden üretmek** istersen ana stil prompt'unu kullan ve seansın
`type`'ına göre kompozisyon seç:

- **guided** → S6 kategorisiyle akraba soyut blob sahnesi, kategori renginde.
- **sleep_story** → büyük ay + serpili yıldızlar + ufuk tepesi (gece).
- **breathing** → eş merkezli yumuşak halkalar (nefes paterni).

Dosya adı = seans id'si (ör. `uykuya-yumusak-gecis.jpg`), 1170×760, `content/art/`'a
koy; `artwork-map.ts` otomatik üretilir (`npm run content:map`). Fotoğraf değil, soyut
organik render dışa aktar.

---

## Teslim kontrol listesi (her dosya için)
1. PNG (belirtilen yerlerde şeffaf) / seans kapakları jpg, tam dosya adı, sRGB.
2. Palet: tek doygun renk mum-amber; zeminler yeşil-gece ailesinde kalır. Mor-pembeye
   kayarsa yeniden üret.
3. Okunabilirlik: S5/S6/S8 için gözünü kıs — metin bölgeleri (belirtilen) koyu ve sakin
   kalmalı.
4. Dosyayı `assets/brand/`'e koy, `src/content/art-registry.ts`'te kaydet
   (`'S6-uyku': require('../../assets/brand/S6-uyku.png'),`), uygulamayı çalıştır —
   placeholder kendiliğinden kaybolur.
