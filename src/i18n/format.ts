// Türkçe metin dönüşümleri: İ/i ve I/ı ayrımı yüzünden daima locale'li API kullanılır.
export function upperTr(text: string): string {
  return text.toLocaleUpperCase('tr');
}

export function lowerTr(text: string): string {
  return text.toLocaleLowerCase('tr');
}

/** Saniyeyi "12 dk" / "12 min" biçimine çevirir; 1 dk altını yukarı yuvarlar. */
export function durationLabel(seconds: number, locale: 'tr' | 'en'): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return locale === 'tr' ? `${minutes} dk` : `${minutes} min`;
}

/** Saniyeyi "12:34" biçimine çevirir (player süre göstergesi). */
export function timeLabel(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Arama için diakritik-duyarsız normalizasyon: "Şükran" ve "sukran" eşleşir. */
export function normalizeSearch(text: string): string {
  const folded: Record<string, string> = {
    ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
  };
  return lowerTr(text).replace(/[çğıöşü]/g, (ch) => folded[ch] ?? ch);
}

export type DayPart = 'sabah' | 'gunduz' | 'aksam' | 'gece';

/** Saatten günün dilimini döndürür — selamlama ve öneri motoru bunu kullanır. */
export function dayPartForHour(hour: number): DayPart {
  if (hour >= 5 && hour < 11) return 'sabah';
  if (hour >= 11 && hour < 17) return 'gunduz';
  if (hour >= 17 && hour < 22) return 'aksam';
  return 'gece';
}
