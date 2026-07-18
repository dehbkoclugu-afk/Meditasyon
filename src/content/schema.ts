import { z } from 'zod';

// content/catalog.json'un tek doğruluk kaynağı şeması.
// Yapısal bütünlük (id referansları, ses dosyalarının varlığı)
// scripts/validate-catalog.mjs'te ayrıca denetlenir.

export const CATEGORY_IDS = [
  'uyku',
  'stres-kaygi',
  'odak',
  'sabah',
  'nefes',
  'beden-taramasi',
  'sukran',
  'oz-sefkat',
] as const;

const localizedText = z.object({
  tr: z.string().min(1),
  en: z.string().min(1),
});

const slug = z.string().regex(/^[a-z0-9-]+$/);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const categorySchema = z.object({
  id: z.enum(CATEGORY_IDS),
  name: localizedText,
  order: z.number().int().nonnegative(),
});

export const breathPatternSchema = z.object({
  inhale: z.number().positive(),
  hold: z.number().nonnegative(),
  exhale: z.number().positive(),
  holdEmpty: z.number().nonnegative(),
  cycles: z.number().int().positive(),
});

export const sessionSchema = z
  .object({
    id: slug,
    type: z.enum(['guided', 'sleep_story', 'breathing']),
    title: localizedText,
    description: localizedText,
    categories: z.array(z.enum(CATEGORY_IDS)).min(1),
    // Planlanan süre; gerçek kayıt ingest edilince ffprobe ölçümüyle güncellenir.
    durationSec: z.number().int().positive(),
    // false: henüz ses yok (nefes egzersizleri sesli yönlendirme olmadan da çalışır)
    hasAudio: z.boolean(),
    access: z.enum(['free', 'premium']),
    publishedAt: isoDate,
    order: z.number().int(),
    pattern: breathPatternSchema.optional(),
  })
  .refine((s) => s.type !== 'breathing' || s.pattern !== undefined, {
    message: 'breathing tipindeki seanslar pattern tanımlamalıdır',
  });

export const programSchema = z.object({
  id: slug,
  title: localizedText,
  description: localizedText,
  days: z.array(slug).min(3),
  access: z.enum(['free', 'premium']),
});

export const ambienceSchema = z.object({
  id: slug,
  title: localizedText,
});

export const catalogSchema = z.object({
  version: z.literal(1),
  categories: z.array(categorySchema).length(CATEGORY_IDS.length),
  sessions: z.array(sessionSchema).min(1),
  programs: z.array(programSchema).min(1),
  ambiences: z.array(ambienceSchema),
});

export type Catalog = z.infer<typeof catalogSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type Program = z.infer<typeof programSchema>;
export type Ambience = z.infer<typeof ambienceSchema>;
export type Category = z.infer<typeof categorySchema>;
export type BreathPattern = z.infer<typeof breathPatternSchema>;
