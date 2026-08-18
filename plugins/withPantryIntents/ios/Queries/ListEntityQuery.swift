import AppIntents
import Foundation

struct ListEntityQuery: EntityStringQuery {
  func entities(for identifiers: [ShoppingListEntity.ID]) async throws -> [ShoppingListEntity] {
    let wanted = Set(identifiers)
    return SharedIntentStore.loadLists()
      .filter { wanted.contains($0.id) }
      .map(ShoppingListEntity.init(snapshot:))
  }

  func entities(matching string: String) async throws -> [ShoppingListEntity] {
    let query = string.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    guard !query.isEmpty else { return try await suggestedEntities() }
    return SharedIntentStore.loadLists()
      .filter { $0.name.lowercased().contains(query) }
      .map(ShoppingListEntity.init(snapshot:))
  }

  func suggestedEntities() async throws -> [ShoppingListEntity] {
    var lists = SharedIntentStore.loadLists().map(ShoppingListEntity.init(snapshot:))
    if let lastId = SharedIntentStore.loadLastUsedListId() {
      lists.sort { lhs, rhs in
        if lhs.id == lastId { return true }
        if rhs.id == lastId { return false }
        return lhs.name.localizedCaseInsensitiveCompare(rhs.name) == .orderedAscending
      }
    } else {
      lists.sort { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
    }
    return lists
  }
}
