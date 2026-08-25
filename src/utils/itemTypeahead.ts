import { displayItemName, normalizeItemName } from './itemName';

export type TypeaheadEntry = {
  id: string;
  /** Canonical display name: preferred list name, else first-seen live ITEM.NAME. */
  name: string;
  upc?: string;
  /** Alternate names from ITEM_ALIAS / purchase snapshots, excluding `name`. */
  aliases: string[];
  /** Category on target list from API or list hints; omitted when unknown */
  categoryId?: string;
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

/**
 * Collapse corpus rows that share an ITEM id into one suggestion.
 * First non-empty name per id is the title (API emits live ITEM.NAME first);
 * later rows become search aliases. `preferredNames` override the title when
 * the item is on a household list.
 */
export function buildTypeaheadCorpus(
  items: Array<{ id: string; name: string; upc?: string; categoryId?: string }>,
  preferredNames: TypeaheadNameHint[] = [],
): TypeaheadEntry[] {
  const preferredById = new Map<string, string>();
  for (const hint of preferredNames) {
    const name = displayItemName(hint.name);
    if (name && !preferredById.has(hint.id)) {
      preferredById.set(hint.id, name);
    }
  }

  const byId = new Map<string, { firstName: string; aliases: string[]; upc?: string; categoryId?: string }>();
  for (const item of items) {
    const name = displayItemName(item.name);
    if (!name) continue;
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, {
        firstName: name,
        aliases: [],
        upc: item.upc,
        categoryId: item.categoryId,
      });
      continue;
    }
    const nameNorm = normalizeItemName(name);
    if (
      nameNorm !== normalizeItemName(existing.firstName) &&
      !existing.aliases.some(n => normalizeItemName(n) === nameNorm)
    ) {
      existing.aliases.push(name);
    }
    if (!existing.upc && item.upc) {
      existing.upc = item.upc;
    }
    if (!existing.categoryId && item.categoryId) {
      existing.categoryId = item.categoryId;
    }
  }

  return Array.from(byId.entries()).map(([id, group]) => {
    const canonical = preferredById.get(id) ?? group.firstName;
    const canonicalNorm = normalizeItemName(canonical);
    const aliases: string[] = [];
    const seen = new Set<string>([canonicalNorm]);
    for (const name of [group.firstName, ...group.aliases]) {
      const norm = normalizeItemName(name);
      if (seen.has(norm)) continue;
      seen.add(norm);
      aliases.push(name);
    }
    return {
      id,
      name: canonical,
      upc: group.upc,
      aliases,
      categoryId: group.categoryId,
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

export type SpokenItemResolution =
  | { kind: 'catalog'; entry: TypeaheadEntry }
  | { kind: 'ambiguous'; entries: TypeaheadEntry[] }
  | { kind: 'newItem' };

/**
 * Siri-style resolve: exact → unique strong match → disambiguate → new item.
 * Length-1 queries never auto-bind to catalog (avoids "x" → "Xyzal").
 */
export function resolveSpokenItem(
  corpus: TypeaheadEntry[],
  rawName: string,
  limit = 5,
): SpokenItemResolution {
  const exact = matchTypeaheadEntry(corpus, rawName);
  if (exact) return { kind: 'catalog', entry: exact };

  const query = normalizeItemName(rawName);
  if (query.length <= 1) return { kind: 'newItem' };

  const ranked = searchTypeaheadCorpus(corpus, rawName, limit);
  const top = ranked[0];
  if (
    top &&
    top.score >= 200 &&
    (ranked.length === 1 || top.score - (ranked[1]?.score ?? 0) >= 50)
  ) {
    return { kind: 'catalog', entry: top.entry };
  }

  const strong = ranked.filter(r => r.score >= 100);
  if (strong.length === 1) return { kind: 'catalog', entry: strong[0].entry };
  if (strong.length > 1) {
    return { kind: 'ambiguous', entries: strong.slice(0, 5).map(r => r.entry) };
  }
  return { kind: 'newItem' };
}
