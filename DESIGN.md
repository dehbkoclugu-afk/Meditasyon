---
name: Sakin
description: Gece ormanı + mum ışığı. Koyu, yeşile tonlanmış zeminler üzerinde tek sıcak amber vurgu. Yumuşak serif başlıklar, nefes ritminde motion, ferah yerleşim.

# src/design/tokens.ts bu değerlerin kod karşılığıdır ve tek doğruluk
# kaynağıdır; bir token orada değişirse burası da güncellenir.
colors:
  # Zeminler (koyu tema — birincil)
  bg: "#0D1412"            # sayfa zemini — saf siyah değil, yeşile tonlanmış
  surface: "#152019"       # kartlar, raflar
  surface-high: "#1D2B22"  # yükseltilmiş öğeler, aktif durumlar
  border: "#FFFFFF0A"      # hairline — gölge yerine katman + hairline

  # Metin
  text-primary: "#F1EDE4"  # sıcak kırık beyaz
  text-secondary: "#A8B3A6" # yeşilimsi gri — zeminle akraba, saf gri yasak

  # Vurgu
  accent: "#E4B75D"        # amber/mum — CTA, ilerleme halkası, streak
  accent-soft: "#E4B75D22" # yüzeylerde hale/dolgu

  # Durumlar (pastel, alarmsız)
  success: "#8FBF9F"
  danger: "#D98E7A"

  # Kategori vurguları (zeminle harmanlı, neon yasak)
  cat-uyku: "#7C8FC9"
  cat-odak: "#C9A96B"
  cat-nefes: "#86B8A8"
  cat-stres: "#B98FA6"
  cat-sabah: "#D9B98A"

  # Açık tema (ikincil)
  light-bg: "#F5F1E8"      # kağıt
  light-surface: "#FFFFFF"
  light-text: "#26302A"
  light-text-muted: "#5E6A60"

typography:
  display: "Fraunces"      # başlıklar, seans adları, süre rakamları — soft serif
  body: "Albert Sans"      # arayüz metinleri
  scale: [34, 28, 22, 17, 15, 13]
  body-line-height: 1.5
  numerals: tabular-nums   # süre ve istatistiklerde

spacing:
  grid: 4                  # 8/12/16/24/32/48
  screen-margin: 24

radius:
  card: 20
  pill: 999                # butonlar hap
  player-art: 28

motion:
  duration: 300-600ms
  easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  banned: [bounce, elastic]
  signature: "nefes halkası — 4 sn döngüde 1.0→1.15 ölçek; reduced-motion'da opaklıkla"
---

# Sakin — Tasarım Kuralları

## Yasaklar (anti-slop sözleşmesi)

- Inter/system font → yasak. Mor-mavi gradient → yasak. Kart içinde kart → yasak.
- Saf siyah `#000` ve saf gri metin → yasak; her nötr yeşile tonlanır.
- Renkli zeminde gri metin → yasak. Bounce/elastic easing → yasak.
- Başlık üstü yuvarlak-kare ikon karosu → yasak. Emoji ikon olarak → yasak.
- Glassmorphism, neon glow, konfeti → yasak.
- Paywall'da hardcode fiyat → yasak (fiyat daima RevenueCat Offerings'ten gelir).

## Dial'lar (taste)

- `DESIGN_VARIANCE: 4` — sakin, simetriye yakın ama tekdüze değil
- `MOTION_INTENSITY: 3` — yavaş, nefes ritminde
- `VISUAL_DENSITY: 3` — ferah; meditasyon ürünü nefes almalı

## Derinlik ve doku

Derinlik gölgeyle değil zemin katmanıyla kurulur: `bg → surface → surface-high` + `border` hairline. Premium his için %1–2 opaklıkta grain doku overlay'i serbesttir; başka doku yoktur.

## Kapak görselleri

Fotoğraf yasak. Kapaklar kategori renginden türetilmiş soyut organik blob/gradient-mesh SVG'lerdir; üretici script ile tutarlı biçimde oluşturulur (`scripts/` — M2).

## Vurgu disiplini

Amber (`accent`) ekran başına bir kez konuşur: tek birincil CTA veya tek ilerleme göstergesi. İki amber öğe aynı anda yarışıyorsa biri `text-primary`'ye düşürülür.
