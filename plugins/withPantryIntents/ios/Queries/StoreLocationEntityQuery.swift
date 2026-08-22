import AppIntents
import Foundation

struct StoreLocationEntityQuery: EntityStringQuery {
  func entities(for identifiers: [StoreLocationEntity.ID]) async throws -> [StoreLocationEntity] {
    let wanted = Set(identifiers.map { $0.lowercased() })
    return SharedIntentStore.loadLocations().compactMap { snapshot in
      guard wanted.contains(snapshot.id.lowercased()) else { return nil }
      return StoreLocationEntity(snapshot: snapshot)
    }
  }

  func entities(matching string: String) async throws -> [StoreLocationEntity] {
    let query = string.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    let pool = try await suggestedEntities()
    guard !query.isEmpty else { return pool }
    return pool.filter { $0.name.lowercased().contains(query) }
  }

  func suggestedEntities() async throws -> [StoreLocationEntity] {
    SharedIntentStore.loadLocations().map { StoreLocationEntity(snapshot: $0) }
  }
}
