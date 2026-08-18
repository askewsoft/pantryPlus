import { displayItemName, normalizeItemName } from './itemName';

export type TypeaheadEntry = {
  id: string;
  /** Canonical display name (ITEM.NAME, or longest variant if unknown). */
  name: string;
  upc?: string;
  /** Alternate names from ITEM_ALIAS / purchase snapshots, excluding `name`. */
  aliases: string[];
};

/** Minimal list shape for resolving which category an item belongs to. */
export type TypeaheadListLookup = {
  categories: Array<{ id: string; items: Array<{ id: string }> }>;
  items: Array<{ id: string }>;
};

export type TypeaheadNameHint = {
  id: string;
  name: string;
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

function allSearchNames(entry: TypeaheadEntry): string[] {
  return [entry.name, ...entry.aliases];
}

function pickCanonicalName(names: string[], preferred?: string): string {
  const preferredNorm = preferred ? normalizeItemName(preferred) : '';
  if (preferredNorm) {
    const match = names.find(n => normalizeItemName(n) === preferredNorm);
    if (match) return match;
  }
  return [...names].sort((a, b) => b.length - a.length || a.localeCompare(b))[0];
}

/**
 * Collapse corpus rows that share an ITEM id (canonical name + aliases)
 * into one suggestion. `preferredNames` are current list display names.
 */
export function buildTypeaheadCorpus(
  items: Array<{ id: string; name: string; upc?: string }>,
  preferredNames: TypeaheadNameHint[] = [],
): TypeaheadEntry[] {
  const preferredById = new Map<string, string>();
  for (const hint of preferredNames) {
    const name = displayItemName(hint.name);
    if (name && !preferredById.has(hint.id)) {
      preferredById.set(hint.id, name);
    }
  }

  const byId = new Map<string, { names: string[]; upc?: string }>();
  for (const item of items) {
    const name = displayItemName(item.name);
    if (!name) continue;
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, { names: [name], upc: item.upc });
      continue;
    }
    if (!existing.names.some(n => normalizeItemName(n) === normalizeItemName(name))) {
      existing.names.push(name);
    }
    if (!existing.upc && item.upc) {
      existing.upc = item.upc;
    }
  }

  return Array.from(byId.entries()).map(([id, group]) => {
    const canonical = pickCanonicalName(group.names, preferredById.get(id));
    const canonicalNorm = normalizeItemName(canonical);
    return {
      id,
      name: canonical,
      upc: group.upc,
      aliases: group.names.filter(n => normalizeItemName(n) !== canonicalNorm),
    };
  });
}

function subsequenceScore(normalizedName: string, query: string): number {
  if (query.length === 0) return 0;
  let qi = 0;
  for (let i = 0; i < normalizedName.length && qi < query.length; i++) {
    if (normalizedName[i] === query[qi]) qi++;
  }
  return qi === query.length ? 10 + Math.max(0, 20 - (normalizedName.length - query.length)) : 0;
}

function rankName(normalizedName: string, query: string): number {
  if (normalizedName.startsWith(query)) return 300 - normalizedName.length;
  const wordStart = normalizedName.split(' ').some(word => word.startsWith(query));
  if (wordStart) return 200 - normalizedName.length;
  if (normalizedName.includes(query)) return 100 - normalizedName.indexOf(query);
  return subsequenceScore(normalizedName, query);
}

export type RankedTypeahead = {
  entry: TypeaheadEntry;
  score: number;
  matchedAlias?: string;
};

function rankEntry(entry: TypeaheadEntry, query: string): RankedTypeahead {
  let bestScore = rankName(normalizeItemName(entry.name), query);
  let matchedAlias: string | undefined;
  for (const alias of entry.aliases) {
    const score = rankName(normalizeItemName(alias), query);
    if (score > bestScore) {
      bestScore = score;
      matchedAlias = alias;
    }
  }
  return { entry, score: bestScore, matchedAlias };
}

/** Prefix-first search across canonical names and aliases; one row per ITEM. */
export function searchTypeaheadCorpus(
  corpus: TypeaheadEntry[],
  rawQuery: string,
  limit = 8,
): RankedTypeahead[] {
  const query = normalizeItemName(rawQuery);
  if (!query) return [];

  return corpus
    .map(entry => rankEntry(entry, query))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit);
}

/** Exact match on canonical name or alias. */
export function matchTypeaheadEntry(
  corpus: TypeaheadEntry[],
  rawName: string,
): TypeaheadEntry | undefined {
  const query = normalizeItemName(rawName);
  if (!query) return undefined;
  return corpus.find(entry =>
    allSearchNames(entry).some(name => normalizeItemName(name) === query),
  );
}
