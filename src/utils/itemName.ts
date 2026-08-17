/**
 * Display form: trim, collapse internal whitespace. Preserves casing.
 */
export function displayItemName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Uniqueness / match key: display form lowercased.
 */
export function normalizeItemName(name: string): string {
  return displayItemName(name).toLowerCase();
}

export function isCaseOnlyNameChange(from: string, to: string): boolean {
  const next = displayItemName(to);
  return next !== '' && next !== displayItemName(from) && normalizeItemName(from) === normalizeItemName(to);
}
