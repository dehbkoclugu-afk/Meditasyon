# Product

## Register

product

## Users

20–45 yaş arası, Türkçe konuşan, meditasyona yeni veya orta seviye kullanıcılar. Uygulamayı günün iki kritik anında açarlar: sabah (odak/başlangıç) ve gece yatakta (uyku). Çoğu zaman yorgun, dikkati dağınık ve tek eliyle telefon tutuyor haldedirler — arayüz bu ruh haline hizmet eder: az seçenek, büyük dokunma hedefleri, sakin hız. İkincil kitle: arayüzü İngilizce kullanan ama Türkçe ses içeriği dinleyen kullanıcılar.

## Product Purpose

Sakin, kullanıcının kendi sesiyle kaydettiği Türkçe yönlendirmeli meditasyonları sunan freemium bir mobil uygulamadır (iOS + Android). Başarı ölçütleri: (1) kullanıcı 30 saniye içinde bir seansa başlayabilir, (2) seans kilit ekranında kesintisiz oynar, (3) ücretsiz kullanıcı değeri hissedip yıllık aboneliğe döner. Uygulama bir araçtan çok bir ritüeldir: her akış "aç → nefes al → başla" kadar kısa olmalıdır.

## Brand Personality

Sakin, sıcak ve alçak sesli. Bir spa resepsiyonisti değil, güvenilen bir dost sesi: yumuşak ama net, şefkatli ama yapışkan değil. Üç kelime: **sıcak, sade, güven veren**. Kopya dili: kısa cümleler, emir kipi yerine davet ("Başlayalım mı?" değil → "Hazır olduğunda başla"), suçluluk yaratan gamification yok ("Serini kaybettin!" yasak).

## Anti-references

- **Calm/Headspace klonu görünümü**: mor-mavi gradient, çizgi film maskotlar, konfeti kutlamaları.
- **Jenerik AI/SaaS görünümü**: Inter fontu her yerde, kart içinde kart, cam efekti (glassmorphism), neon vurgular, saf siyah zemin.
- **Agresif monetizasyon kalıpları**: tam ekran kapatılamayan paywall, sahte indirim sayaçları, suçlulukla dönüşüm ("Kendine bunu yapma!").
- **Bildirim spam'i**: günde 1'den fazla hatırlatma asla; streak baskısı kurmak yasak.
- **Stok fotoğraf estetiği**: lotus pozisyonunda gün batımına bakan kadın fotoğrafları — kapaklar soyut, üretilmiş SVG illüstrasyonlardır.

## Design Principles

1. **Nefes alan arayüz.** Boşluk içeriktir. Her ekranda tek birincil eylem; ikincil her şey görsel olarak geri çekilir.
2. **Gece ormanı + mum ışığı.** Koyu, yeşile tonlanmış zeminler; tek sıcak amber vurgu. Renk asla bağırmaz — vurgu rengi ekran başına bir kez konuşur.
3. **Motion nefes ritminde.** Animasyonlar 300–600 ms, yumuşak easing, asla bounce. İmza hareket: 4 saniyelik döngüde büyüyüp küçülen nefes halkası.
4. **Ses birincil, ekran ikincil.** Player'da ekran karartılabilir; kilit ekranı kontrolleri birinci sınıf; hiçbir kritik bilgi yalnız görsel değildir.
5. **Dürüst freemium.** Kilitli içerik zarif işaretlenir (amber nokta), asla tıklama tuzağı olmaz; "Ücretsiz devam et" her paywall'da görünürdür.

## Accessibility & Inclusion

Temel: WCAG 2.1 AA.
- Dokunma hedefleri ≥ 44 pt; player ana butonu 72 pt.
- Kontrast oranları gerçek araçla doğrulanır (özellikle amber-üstü-koyu kombinasyonları).
- VoiceOver/TalkBack: tüm etkileşimli öğelerde anlamlı Türkçe/İngilizce etiketler; süre ve ilerleme sesli okunabilir.
- `prefers-reduced-motion` / "Hareketi azalt": nefes halkası dahil tüm animasyonlar statik alternatife düşer (halka opaklıkla nefes alır, ölçekle değil).
- Dinamik yazı boyutu: metinler %130'a kadar taşmadan büyür; Fraunces başlıklar kırpılmaz.
- Türkçe diakritikler (ğ, ş, İ, ı) her iki fontta da doğru render edilir; İ/i büyük-küçük dönüşümleri `toLocaleUpperCase('tr')` ile yapılır.
