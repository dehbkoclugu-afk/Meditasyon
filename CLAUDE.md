# Sakin

Türkçe yönlendirmeli meditasyon uygulaması (Expo / React Native, iOS + Android, freemium + RevenueCat).

- Yol haritası ve tüm mimari kararlar: `PLAN.md` (fazlar M0–M8). Bir faza başlamadan önce oku.
- Ürün bağlamı: `PRODUCT.md` · Tasarım kuralları ve yasaklar: `DESIGN.md` · Token kaynağı: `src/design/tokens.ts`
- UI işlerinde `.claude/skills/` altındaki `impeccable`, `taste` (design-taste-frontend) ve `caveman` skill'leri kullanılır.
- Doğrulama: `npm run typecheck && npm run lint && npm test` — üçü de temiz olmadan commit yok.
- Rotalar `src/app/` (expo-router); iş mantığı `src/features/`; içerik kataloğu `content/catalog.json`.
- Metinlerde i18n zorunlu (TR/EN); Türkçe büyük harf dönüşümü `toLocaleUpperCase('tr')`.
