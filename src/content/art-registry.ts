import type { ImageSourcePropType } from 'react-native';

/**
 * Sanat asset registry — bitmiş görseller için tek bağlantı noktası.
 *
 * Akış:
 *  1. Uygulamadaki her ArtSlot aşağıdan bir AssetId ister; kayıt `null` iken
 *     ya mevcut generative görseli (fallback) ya da etiketli bir placeholder
 *     gösterir — yerleşim, sanat üretilmeden önce kesinleşir.
 *  2. Görseli `docs/asset-briefs.md`'deki brief'lerle üret.
 *  3. Dosyayı `assets/brand/`'e brief'teki tam adla koy (ör. S6-uyku.png).
 *  4. `null` yerine `require('../../assets/brand/S6-uyku.png')` yaz.
 * Placeholder kaybolur, bitmiş sanat her yerde otomatik görünür.
 */
export type AssetId =
  | 'S1-logomark'
  | 'S2-appicon'
  | 'S3-splash'
  | 'S4-grain'
  | 'S5-onboarding-hero'
  | 'S6-uyku'
  | 'S6-stres-kaygi'
  | 'S6-odak'
  | 'S6-sabah'
  | 'S6-nefes'
  | 'S6-beden-taramasi'
  | 'S6-sukran'
  | 'S6-oz-sefkat'
  | 'S7-baslangic-crest'
  | 'S8-paywall-hero'
  | 'S9-player-halo'
  | 'S10-finish'
  | 'S11-amb-yagmur'
  | 'S11-amb-orman-sabahi'
  | 'S11-amb-deniz-dalgalari'
  | 'S11-amb-beyaz-gurultu'
  | 'S11-amb-gece-circirlari'
  | 'S12-search'
  | 'S12-heart'
  | 'S12-category';

export const artRegistry: Record<AssetId, ImageSourcePropType | null> = {
  'S1-logomark': require('../../assets/brand/S1-logomark.png'),
  'S2-appicon': require('../../assets/brand/S2-appicon.png'),
  'S3-splash': require('../../assets/brand/S3-splash.png'),
  'S4-grain': require('../../assets/brand/S4-grain.png'),
  'S5-onboarding-hero': require('../../assets/brand/S5-onboarding-hero.png'),
  'S6-uyku': require('../../assets/brand/S6-uyku.png'),
  'S6-stres-kaygi': require('../../assets/brand/S6-stres-kaygi.png'),
  'S6-odak': require('../../assets/brand/S6-odak.png'),
  'S6-sabah': require('../../assets/brand/S6-sabah.png'),
  'S6-nefes': require('../../assets/brand/S6-nefes.png'),
  'S6-beden-taramasi': require('../../assets/brand/S6-beden-taramasi.png'),
  'S6-sukran': require('../../assets/brand/S6-sukran.png'),
  'S6-oz-sefkat': require('../../assets/brand/S6-oz-sefkat.png'),
  'S7-baslangic-crest': null,
  'S8-paywall-hero': null,
  'S9-player-halo': null,
  'S10-finish': null,
  'S11-amb-yagmur': null,
  'S11-amb-orman-sabahi': null,
  'S11-amb-deniz-dalgalari': null,
  'S11-amb-beyaz-gurultu': null,
  'S11-amb-gece-circirlari': null,
  'S12-search': null,
  'S12-heart': null,
  'S12-category': null,
};

/** Placeholder içinde gösterilen üstveri (asset-briefs.md ile aynı). */
export const artSpecs: Record<AssetId, { label: string; size: string }> = {
  'S1-logomark': { label: 'Logomark', size: '512² PNG (şeffaf)' },
  'S2-appicon': { label: 'App icon', size: '1024² PNG' },
  'S3-splash': { label: 'Splash', size: '1284×2778 PNG' },
  'S4-grain': { label: 'Grain doku', size: '512² PNG (şeffaf)' },
  'S5-onboarding-hero': { label: 'Onboarding hero', size: '1170×1000 PNG' },
  'S6-uyku': { label: 'Kapak — Uyku', size: '1170×760 PNG' },
  'S6-stres-kaygi': { label: 'Kapak — Stres & Kaygı', size: '1170×760 PNG' },
  'S6-odak': { label: 'Kapak — Odak', size: '1170×760 PNG' },
  'S6-sabah': { label: 'Kapak — Sabah', size: '1170×760 PNG' },
  'S6-nefes': { label: 'Kapak — Nefes', size: '1170×760 PNG' },
  'S6-beden-taramasi': { label: 'Kapak — Beden Taraması', size: '1170×760 PNG' },
  'S6-sukran': { label: 'Kapak — Şükran', size: '1170×760 PNG' },
  'S6-oz-sefkat': { label: 'Kapak — Öz Şefkat', size: '1170×760 PNG' },
  'S7-baslangic-crest': { label: 'Program crest — Başlangıç', size: '720² PNG (şeffaf)' },
  'S8-paywall-hero': { label: 'Paywall hero', size: '1170×900 PNG' },
  'S9-player-halo': { label: 'Player hale', size: '720² PNG (şeffaf)' },
  'S10-finish': { label: 'Seans bitiş', size: '900² PNG (şeffaf)' },
  'S11-amb-yagmur': { label: 'Ambient — Yağmur', size: '400² PNG (şeffaf)' },
  'S11-amb-orman-sabahi': { label: 'Ambient — Orman sabahı', size: '400² PNG (şeffaf)' },
  'S11-amb-deniz-dalgalari': { label: 'Ambient — Deniz dalgaları', size: '400² PNG (şeffaf)' },
  'S11-amb-beyaz-gurultu': { label: 'Ambient — Beyaz gürültü', size: '400² PNG (şeffaf)' },
  'S11-amb-gece-circirlari': { label: 'Ambient — Gece cırcırları', size: '400² PNG (şeffaf)' },
  'S12-search': { label: 'Boş — Arama', size: '600² PNG (şeffaf)' },
  'S12-heart': { label: 'Boş — Favori', size: '600² PNG (şeffaf)' },
  'S12-category': { label: 'Boş — Kategori', size: '600² PNG (şeffaf)' },
};
