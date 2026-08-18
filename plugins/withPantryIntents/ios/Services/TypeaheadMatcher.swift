import Foundation

enum TypeaheadMatcher {
  struct RankedEntry {
    let entry: IntentTypeaheadEntry
    let score: Int
    let matchedAlias: String?
  }

  static func displayItemName(_ name: String) -> String {
    name.trimmingCharacters(in: .whitespacesAndNewlines)
      .replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
  }

  static func normalizeItemName(_ name: String) -> String {
    displayItemName(name).lowercased()
  }

  static func search(
    _ corpus: [IntentTypeaheadEntry],
    rawQuery: String,
    limit: Int = 8
  ) -> [RankedEntry] {
    let query = normalizeItemName(rawQuery)
    guard !query.isEmpty else { return [] }
    let ranked = corpus
      .map { rankEntry($0, query: query) }
      .filter { $0.score > 0 }
      .sorted {
        if $0.score != $1.score { return $0.score > $1.score }
        return $0.entry.name.localizedCaseInsensitiveCompare($1.entry.name) == .orderedAscending
      }
    return Array(ranked.prefix(limit))
  }

  static func matchExact(_ corpus: [IntentTypeaheadEntry], rawName: String) -> IntentTypeaheadEntry? {
    let query = normalizeItemName(rawName)
    guard !query.isEmpty else { return nil }
    return corpus.first { entry in
      allSearchNames(entry).contains { normalizeItemName($0) == query }
    }
  }

  enum SpokenItemResolution: Equatable {
    case catalog(IntentTypeaheadEntry)
    case ambiguous([IntentTypeaheadEntry])
    case newItem
  }

  /// Mirrors Add Item typeahead: exact → unique strong match → disambiguate → new item.
  static func resolveSpokenItem(
    _ corpus: [IntentTypeaheadEntry],
    rawName: String,
    limit: Int = 5
  ) -> SpokenItemResolution {
    if let exact = matchExact(corpus, rawName: rawName) {
      return .catalog(exact)
    }

    let ranked = search(corpus, rawQuery: rawName, limit: limit)
    if let top = ranked.first, top.score >= 200,
       ranked.count == 1 || top.score - (ranked.dropFirst().first?.score ?? 0) >= 50 {
      return .catalog(top.entry)
    }

    let strong = ranked.filter { $0.score >= 100 }
    if strong.count == 1 {
      return .catalog(strong[0].entry)
    }
    if strong.count > 1 {
      return .ambiguous(strong.prefix(5).map(\.entry))
    }
    return .newItem
  }

  /// Roster match used for duplicate / on-list checks. Exact first, then a unique strong fuzzy hit.
  static func matchRoster(_ roster: [IntentRosterItem], rawName: String) -> IntentRosterItem? {
    let corpus = entries(from: roster)
    if let exact = matchExact(corpus, rawName: rawName),
       let hit = roster.first(where: { $0.id == exact.id }) {
      return hit
    }

    let ranked = search(corpus, rawQuery: rawName, limit: 3)
    if let top = ranked.first, top.score >= 100,
       let hit = roster.first(where: { $0.id == top.entry.id }) {
      let second = ranked.dropFirst().first?.score ?? 0
      if ranked.count == 1 || top.score - second >= 50 {
        return hit
      }
    }
    return nil
  }

  static func householdLists(
    current: IntentListSnapshot,
    all: [IntentListSnapshot]
  ) -> [IntentListSnapshot] {
    let cohortId = current.groupId
    let others = all.filter { list in
      if list.id == current.id { return false }
      if let cohortId, !cohortId.isEmpty {
        return list.groupId == cohortId
      }
      let listUngrouped = list.groupId == nil || list.groupId?.isEmpty == true
      return listUngrouped && list.ownerId == current.ownerId
    }
    return [current] + others
  }

  /// First household match wins. `""` means uncategorized; `nil` means not found.
  static func findCategoryId(
    itemId: String,
    currentList: IntentListSnapshot,
    allLists: [IntentListSnapshot],
    rosters: [String: [IntentRosterItem]]
  ) -> String? {
    let lists = householdLists(current: currentList, all: allLists)
    for list in lists {
      if let hit = (rosters[list.id] ?? []).first(where: {
        $0.id.compare(itemId, options: .caseInsensitive) == .orderedSame
      }) {
        return hit.categoryId ?? ""
      }
    }
    return nil
  }

  static func entries(from roster: [IntentRosterItem]) -> [IntentTypeaheadEntry] {
    roster.map {
      IntentTypeaheadEntry(id: $0.id, name: $0.name, aliases: [], upc: nil)
    }
  }

  static func buildCorpus(
    items: [CatalogItem],
    preferredNames: [(id: String, name: String)] = []
  ) -> [IntentTypeaheadEntry] {
    var preferredById: [String: String] = [:]
    for hint in preferredNames {
      let name = displayItemName(hint.name)
      if !name.isEmpty, preferredById[hint.id] == nil {
        preferredById[hint.id] = name
      }
    }

    var byId: [String: (names: [String], upc: String?)] = [:]
    for item in items {
      let name = displayItemName(item.name)
      guard !name.isEmpty else { continue }
      if var existing = byId[item.id] {
        if !existing.names.contains(where: { normalizeItemName($0) == normalizeItemName(name) }) {
          existing.names.append(name)
        }
        if existing.upc == nil || existing.upc?.isEmpty == true {
          existing.upc = item.upc
        }
        byId[item.id] = existing
      } else {
        byId[item.id] = (names: [name], upc: item.upc)
      }
    }

    return byId.map { id, group in
      let canonical = pickCanonicalName(group.names, preferred: preferredById[id])
      let canonicalNorm = normalizeItemName(canonical)
      return IntentTypeaheadEntry(
        id: id,
        name: canonical,
        aliases: group.names.filter { normalizeItemName($0) != canonicalNorm },
        upc: group.upc
      )
    }
  }

  private static func allSearchNames(_ entry: IntentTypeaheadEntry) -> [String] {
    [entry.name] + entry.aliases
  }

  private static func pickCanonicalName(_ names: [String], preferred: String?) -> String {
    let preferredNorm = preferred.map { normalizeItemName($0) } ?? ""
    if !preferredNorm.isEmpty, let match = names.first(where: { normalizeItemName($0) == preferredNorm }) {
      return match
    }
    return names.sorted {
      if $0.count != $1.count { return $0.count > $1.count }
      return $0.localizedCompare($1) == .orderedAscending
    }.first ?? ""
  }

  private static func rankEntry(_ entry: IntentTypeaheadEntry, query: String) -> RankedEntry {
    var bestScore = rankName(normalizeItemName(entry.name), query: query)
    var matchedAlias: String?
    for alias in entry.aliases {
      let score = rankName(normalizeItemName(alias), query: query)
      if score > bestScore {
        bestScore = score
        matchedAlias = alias
      }
    }
    return RankedEntry(entry: entry, score: bestScore, matchedAlias: matchedAlias)
  }

  private static func rankName(_ normalizedName: String, query: String) -> Int {
    if normalizedName.hasPrefix(query) { return 300 - normalizedName.count }
    let wordStart = normalizedName.split(separator: " ").contains { $0.hasPrefix(query) }
    if wordStart { return 200 - normalizedName.count }
    if let index = normalizedName.range(of: query)?.lowerBound {
      return 100 - normalizedName.distance(from: normalizedName.startIndex, to: index)
    }
    return subsequenceScore(normalizedName, query: query)
  }

  private static func subsequenceScore(_ normalizedName: String, query: String) -> Int {
    if query.isEmpty { return 0 }
    var qi = query.startIndex
    for ch in normalizedName {
      if qi < query.endIndex, ch == query[qi] {
        qi = query.index(after: qi)
      }
    }
    guard qi == query.endIndex else { return 0 }
    return 10 + max(0, 20 - (normalizedName.count - query.count))
  }
}
