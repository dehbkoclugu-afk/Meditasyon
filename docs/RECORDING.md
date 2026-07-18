# Ses Kayıt Rehberi

Meditasyon seslerini kaydederken bu rehberi izle; işleme (normalizasyon, kırpma, encode) script'e emanet — sen sadece iyi ham kayıt ver.

## Kayıt ayarları

- **Format:** WAV, 48 kHz, 24-bit, **mono**
- **Ortam:** Sessiz oda; yankıyı azaltmak için halı/perde/yorganlı alan idealdir. Buzdolabı, klima, trafik gibi sabit uğultulara dikkat.
- **Mikrofon mesafesi:** 15–20 cm; patlayan sesler (p, b) için pop filtresi veya mikrofona hafif açılı konuşma.
- **Seviye:** Konuşma tepe noktaları kayıt cihazında yaklaşık **-12 dB ile -6 dB** arasında olsun; asla kırmızıya (0 dB) vurmasın. Normalizasyonu script yapar, sen sadece kırpmadan (clipping) kaçın.
- **Baş ve son:** Kayda başlarken ve bitirirken **2'şer saniye sessizlik** bırak (script otomatik kırpar ve fade uygular).

## Konuşma tarzı (PRODUCT.md sesi)

- Alçak tempolu, sıcak, davet eden — spa anonsu değil, güvenilen dost sesi.
- Cümleler kısa; duraklamalar cömert. Yönergeden sonra dinleyiciye uygulaması için sessiz alan bırak (uzun meditasyonlarda 20–60 sn sessiz bölümler normaldir).
- Hata yaparsan durma: 2 sn bekle, cümleyi baştan söyle; en iyi alışı sonra seçersin (tek dosyada kalabilir, montajı kayıt programında yaparsın).

## Dosya adlandırma

Ham kayıtları `content/raw/` klasörüne koy (git'e girmez):

```
{tip}-{seans-id}-{dil}.wav
guided-uykuya-yumusak-gecis-tr.wav
sleep_story-eski-sahil-kasabasi-tr.wav
amb-yagmur.wav
```

`seans-id` mutlaka `content/catalog.json`'daki id ile birebir aynı olmalı.

## İşleme (senin makinende, ffmpeg kurulu olmalı)

```bash
# Konuşma / hikâye:
npm run content:ingest -- content/raw/guided-uykuya-yumusak-gecis-tr.wav uykuya-yumusak-gecis

# Ambience (loop):
npm run content:ingest -- content/raw/amb-yagmur.wav amb-yagmur --ambience
```

Script şunları yapar: sessizlik kırpma → loudness normalizasyonu (konuşma -16 LUFS / ambience -20 LUFS) → 1.5 sn fade-in/out → AAC m4a (konuşma 96 kbps mono / ambience 128 kbps stereo) → `catalog.json`'a gerçek süreyi yazar → placeholder'ı siler → asset haritasını günceller.

Sonra:

```bash
npm run content:validate   # her şey yerli yerinde mi
git add content/ src/content/audio-map.ts && git commit
```

## Kalite kontrol listesi (her kayıt için)

- [ ] Kulaklıkla baştan sona dinlendi (tık, öksürük, telefon titreşimi yok)
- [ ] Seviye hiç kırmızıya vurmadı
- [ ] Süre, katalogdaki planlanan süreye yakın (±%20)
- [ ] Ambience dosyalarında baş-son geçişi loop'a uygun (ani kesik yok)

## Lansman kayıt listesi

Öncelik sırası (önce ücretsiz vitrin, sonra premium):

1. **Başlangıç programı** — 7 kayıt × 8–10 dk (hepsi ücretsiz, vitrin)
2. Her kategorinin ücretsiz seansı — 8 kayıt
3. Ücretsiz uyku hikâyesi: Eski Sahil Kasabası (~25 dk)
4. Premium tekli seanslar — 9 kayıt
5. Premium uyku hikâyesi: Yağmurlu Orman Evi (~30 dk)
6. Ambience'lar — 5 kayıt/kaynak (telifsiz kaynak da olur)

Tam liste ve süreler: `content/catalog.json`.
