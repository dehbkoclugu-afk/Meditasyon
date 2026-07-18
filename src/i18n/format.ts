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
