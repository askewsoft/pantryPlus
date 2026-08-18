import AppIntents
import Foundation

struct ItemSuggestionEntityQuery: EntityStringQuery {
  func entities(for identifiers: [ItemSuggestionEntity.ID]) async throws -> [ItemSuggestionEntity] {
    let wanted = Set(identifiers)
    return SharedIntentStore.loadTypeaheadCorpus()
      .filter { wanted.contains($0.id) }
      .map(ItemSuggestionEntity.init(entry:))
  }

  func entities(matching string: String) async throws -> [ItemSuggestionEntity] {
    TypeaheadMatcher.search(SharedIntentStore.loadTypeaheadCorpus(), rawQuery: string, limit: 8)
      .map { ItemSuggestionEntity(entry: $0.entry) }
  }

  func suggestedEntities() async throws -> [ItemSuggestionEntity] {
    Array(SharedIntentStore.loadTypeaheadCorpus().prefix(8)).map(ItemSuggestionEntity.init(entry:))
  }
}
