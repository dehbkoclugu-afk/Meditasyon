# Sakin — Türkçe Yönlendirmeli Meditasyon

iOS ve Android için freemium yönlendirmeli meditasyon uygulaması. Expo / React Native.

- **Plan:** [PLAN.md](./PLAN.md) — mimari, içerik modeli, monetizasyon, fazlar (M0–M8)
- **Ürün bağlamı:** [PRODUCT.md](./PRODUCT.md) · **Tasarım kuralları:** [DESIGN.md](./DESIGN.md)
- **Tasarım token'ları (kod):** `src/design/tokens.ts`

## Geliştirme

```bash
npm install
npm start          # Expo dev server
npm run typecheck  # tsc --noEmit
npm run lint
npm test
```

Not: Ses (react-native-track-player) ve abonelik (RevenueCat) native modül gerektirir —
Expo Go yerine **EAS dev build** kullanılır (M4'ten itibaren).

## İçerik

Ses kayıtları `content/raw/` altına (git dışı) konur, `npm run content:ingest` ile
normalize edilip `content/audio/`'ya işlenir; katalog `content/catalog.json`'dadır. (M2)
