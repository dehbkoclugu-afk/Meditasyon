// Günün niyeti kartı — tarih-seed'li, 24 metinlik havuz. Bugün ekranı gösterir.

export type Quote = { tr: string; en: string };

export const QUOTES: Quote[] = [
  { tr: 'Bugün acele etmene gerek yok.', en: "There's no need to hurry today." },
  { tr: 'Nefesin, her an dönebileceğin bir ev.', en: 'Your breath is a home you can always return to.' },
  { tr: 'Küçük bir duraklama bile bir başlangıçtır.', en: 'Even a small pause is a beginning.' },
  { tr: 'Zihnin dalgalanabilir; sen kıyısın.', en: 'The mind may ripple; you are the shore.' },
  { tr: 'Şu an, olman gereken tek yer.', en: 'This moment is the only place you need to be.' },
  { tr: 'Bugün kendine bir dakika borçlusun.', en: 'You owe yourself a minute today.' },
  { tr: 'Yavaşlamak da bir ilerlemedir.', en: 'Slowing down is progress too.' },
  { tr: 'Her nefes yeni bir sayfa.', en: 'Every breath is a fresh page.' },
  { tr: 'Dinlenmek, vazgeçmek değildir.', en: 'Resting is not giving up.' },
  { tr: 'Sessizlik, cevapların çoğunu bilir.', en: 'Silence knows most of the answers.' },
  { tr: 'Bugünün tek görevi: burada olmak.', en: "Today's only task: being here." },
  { tr: 'Kendine dostuna davrandığın gibi davran.', en: 'Treat yourself as you would a friend.' },
  { tr: 'Fırtına geçer; nefes kalır.', en: 'Storms pass; the breath remains.' },
  { tr: 'Bir şey yapmamak da bir şeydir.', en: 'Doing nothing is also doing something.' },
  { tr: 'Zihnini boşaltma; ona yer aç.', en: "Don't empty the mind; make room for it." },
  { tr: 'Bugün neye ihtiyacın olduğunu sor.', en: 'Ask yourself what you need today.' },
  { tr: 'Omuzlarını bırak. Şimdi bir kez daha.', en: 'Drop your shoulders. Now once more.' },
  { tr: 'Az, çoğu zaman yeterlidir.', en: 'Less is often enough.' },
  { tr: 'Duyduğun her ses, şimdiye bir davet.', en: 'Every sound you hear is an invitation to now.' },
  { tr: 'Kendinle geçirdiğin zaman kayıp değildir.', en: 'Time spent with yourself is never lost.' },
  { tr: 'Nazik ol — özellikle kendine.', en: 'Be gentle — especially with yourself.' },
  { tr: 'Bir nefeslik mesafede huzur var.', en: 'Peace is one breath away.' },
  { tr: 'Bugün mükemmel olmak zorunda değil.', en: "Today doesn't have to be perfect." },
  { tr: 'Geldiğin için teşekkürler.', en: 'Thank you for showing up.' },
];

/** Aynı gün hep aynı sözü döndürür (tarih-seed). */
export function dailyQuote(dateKey: string): Quote {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  return QUOTES[h % QUOTES.length];
}
