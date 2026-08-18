import Foundation

struct ListMembership {
  let onList: Bool
  let item: IntentRosterItem?

  var categoryName: String? {
    guard let name = item?.categoryName, !name.isEmpty else { return nil }
    return name
  }
}

enum ListMembershipChecker {
  static func byItemId(itemId: String, listId: String) async -> ListMembership {
    let roster = SharedIntentStore.loadRoster(listId: listId)
    if let hit = roster.first(where: { $0.id.compare(itemId, options: .caseInsensitive) == .orderedSame }) {
      return ListMembership(onList: true, item: hit)
    }

    if let onList = try? await PantryApiClient.shared.isOnList(listId: listId, itemId: itemId), onList {
      return ListMembership(
        onList: true,
        item: IntentRosterItem(id: itemId, name: "", categoryId: nil, categoryName: nil)
      )
    }

    return ListMembership(onList: false, item: nil)
  }

  static func bySpokenName(_ rawName: String, listId: String) -> ListMembership {
    let roster = SharedIntentStore.loadRoster(listId: listId)
    let corpus = TypeaheadMatcher.entries(from: roster)
    if let exact = TypeaheadMatcher.matchExact(corpus, rawName: rawName),
       let hit = roster.first(where: { $0.id == exact.id }) {
      return ListMembership(onList: true, item: hit)
    }

    let ranked = TypeaheadMatcher.search(corpus, rawQuery: rawName, limit: 3)
    if let top = ranked.first, top.score >= 100,
       let hit = roster.first(where: { $0.id == top.entry.id }) {
      let second = ranked.dropFirst().first?.score ?? 0
      if ranked.count == 1 || top.score - second >= 50 {
        return ListMembership(onList: true, item: hit)
      }
    }

    return ListMembership(onList: false, item: nil)
  }

  static func dialogAlreadyOnList(itemName: String, listName: String, membership: ListMembership) -> String {
    let display = displayName(itemName, membership: membership)
    if let categoryName = membership.categoryName {
      return "\(display) is already on \(listName) in \(categoryName)"
    }
    if membership.item != nil {
      return "\(display) is already on \(listName) (uncategorized)"
    }
    return "\(display) is already on \(listName)"
  }

  static func dialogOnList(itemName: String, listName: String, membership: ListMembership) -> String {
    let display = displayName(itemName, membership: membership)
    if let categoryName = membership.categoryName {
      return "Yes, \(display) is on \(listName) in \(categoryName)"
    }
    if membership.item != nil {
      return "Yes, \(display) is on \(listName) (uncategorized)"
    }
    return "Yes, \(display) is on \(listName)"
  }

  static func dialogNotOnList(itemName: String, listName: String) -> String {
    "No, \(itemName) is not on \(listName)"
  }

  private static func displayName(_ fallback: String, membership: ListMembership) -> String {
    if let name = membership.item?.name, !name.isEmpty { return name }
    return fallback
  }
}
