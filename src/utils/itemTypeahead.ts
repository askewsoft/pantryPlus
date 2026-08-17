import { displayItemName, normalizeItemName } from './itemName';

export type TypeaheadEntry = {
  id: string;
  name: string;
  upc?: string;
};

/** Minimal list shape for resolving which category an item belongs to. */
export type TypeaheadListLookup = {
  categories: Array<{ id: string; items: Array<{ id: string }> }>;
  items: Array<{ id: string }>;
};

/**
 * Find category id for an item on the given lists (first match wins).
 * Returns '' for uncategorized, undefined if not found on any list.
 */
export function findCategoryIdForItem(
  itemId: string,
  lists: TypeaheadListLookup[],
): string | undefined {
  for (const list of lists) {
    for (const category of list.categories) {
      if (category.items.some(i => i.id === itemId)) {
        return category.id;
      }
    }
    if (list.items.some(i => i.id === itemId)) {
      return '';
    }
  }
  return undefined;
}

/** Dedupe by normalized name; first occurrence wins (preserves display casing). */
export function dedupeTypeaheadCorpus(items: TypeaheadEntry[]): TypeaheadEntry[] {
  const byNorm = new Map<string, TypeaheadEntry>();
  for (const item of items) {
    const key = normalizeItemName(item.name);
    if (!key || byNorm.has(key)) continue;
    byNorm.set(key, { id: item.id, name: displayItemName(item.name), upc: item.upc });
  }
  return Array.from(byNorm.values());
}

function subsequenceScore(normalizedName: string, query: string): number {
  if (query.length === 0) return 0;
  let qi = 0;
  for (let i = 0; i < normalizedName.length && qi < query.length; i++) {
    if (normalizedName[i] === query[qi]) qi++;
  }
  return qi === query.length ? 10 + Math.max(0, 20 - (normalizedName.length - query.length)) : 0;
}

function rankEntry(normalizedName: string, query: string): number {
  if (normalizedName.startsWith(query)) return 300 - normalizedName.length;
  const wordStart = normalizedName.split(' ').some(word => word.startsWith(query));
  if (wordStart) return 200 - normalizedName.length;
  if (normalizedName.includes(query)) return 100 - normalizedName.indexOf(query);
  return subsequenceScore(normalizedName, query);
}

/** Prefix-first search with light fuzzy (subsequence) fallback. */
export function searchTypeaheadCorpus(
  corpus: TypeaheadEntry[],
  rawQuery: string,
  limit = 8,
): TypeaheadEntry[] {
  const query = normalizeItemName(rawQuery);
  if (!query) return [];

  return corpus
    .map(entry => ({
      entry,
      score: rankEntry(normalizeItemName(entry.name), query),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map(({ entry }) => entry);
}
