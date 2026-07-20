import rawCatalog from '../../content/catalog.json';
import { artworkAssets } from './artwork-map';
import { catalogSchema, type Catalog, type Program, type Session } from './schema';

// Açılışta bir kez parse edilir; şema bozuksa uygulama build/test aşamasında düşer.
export const catalog: Catalog = catalogSchema.parse(rawCatalog);

export const sessionsById: ReadonlyMap<string, Session> = new Map(
  catalog.sessions.map((s) => [s.id, s]),
);

export const programsById: ReadonlyMap<string, Program> = new Map(
  catalog.programs.map((p) => [p.id, p]),
);

export function sessionsInCategory(categoryId: string): Session[] {
  return catalog.sessions
    .filter((s) => s.categories.includes(categoryId as Session['categories'][number]))
    .sort((a, b) => a.order - b.order);
}

// Kategori kapağı: özel görsel (content/art/cat-<id>) varsa onu, yoksa
// kategorinin ilk seansının illüstrasyonunu kullanır.
export function categoryCoverSeed(categoryId: string): {
  seed: string;
  kind?: Session['type'];
} {
  const key = `cat-${categoryId}`;
  if (artworkAssets[key] != null) return { seed: key };
  const first = sessionsInCategory(categoryId)[0];
  return first ? { seed: first.id, kind: first.type } : { seed: categoryId };
}

export function programDaySessions(program: Program): Session[] {
  return program.days.map((id) => {
    const session = sessionsById.get(id);
    if (!session) throw new Error(`Program ${program.id}: bilinmeyen seans ${id}`);
    return session;
  });
}
