// Marka kimliği tek yerden okunur — isim değişirse yalnız bu dosya güncellenir.
// Store kimlikleri (bundle id / package) app.json'da ayrıca tanımlıdır ve
// yayından önce kesinleşmelidir; sonradan değiştirilemez.
export const brand = {
  name: 'Sakin',
  tagline: {
    tr: 'Türkçe yönlendirmeli meditasyon',
    en: 'Guided meditation in Turkish',
  },
  supportEmail: 'umtuceylan@gmail.com',
} as const;
