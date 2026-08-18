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
    let query = string.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    let corpus = SharedIntentStore.loadTypeaheadCorpus()
    guard !query.isEmpty else {
      return Array(corpus.prefix(8)).map(ItemSuggestionEntity.init(entry:))
    }
    return corpus
      .filter { entry in
        entry.name.lowercased().contains(query)
          || entry.aliases.contains { $0.lowercased().contains(query) }
      }
      .prefix(8)
      .map(ItemSuggestionEntity.init(entry:))
  }

  func suggestedEntities() async throws -> [ItemSuggestionEntity] {
    Array(SharedIntentStore.loadTypeaheadCorpus().prefix(8)).map(ItemSuggestionEntity.init(entry:))
  }
}
