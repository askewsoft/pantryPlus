import AppIntents
import Foundation

struct CategoryEntityQuery: EntityStringQuery {
  func entities(for identifiers: [CategoryEntity.ID]) async throws -> [CategoryEntity] {
    let wanted = Set(identifiers)
    return allCategories().filter { wanted.contains($0.id) }
  }

  func entities(matching string: String) async throws -> [CategoryEntity] {
    let query = string.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    let pool = try await suggestedEntities()
    guard !query.isEmpty else { return pool }
    return pool.filter { $0.name.lowercased().contains(query) }
  }

  func suggestedEntities() async throws -> [CategoryEntity] {
    let lists = SharedIntentStore.loadLists()
    let lastId = SharedIntentStore.loadLastUsedListId()
    let target = lists.first(where: { $0.id == lastId }) ?? lists.first
    guard let target else { return [] }
    return target.categories.map { CategoryEntity(id: $0.id, name: $0.name, listId: target.id) }
  }

  private func allCategories() -> [CategoryEntity] {
    SharedIntentStore.loadLists().flatMap { list in
      list.categories.map { CategoryEntity(id: $0.id, name: $0.name, listId: list.id) }
    }
  }
}
